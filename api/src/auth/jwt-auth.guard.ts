import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { JwtService } from './jwt.service';
import { JwtPayload } from './jwt.strategy';
import { Request, Response } from 'express';

export const USER_ROLE = 'userRole';
export const UserRole = (value: Role) => SetMetadata(USER_ROLE, value);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector, private readonly jwtService: JwtService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        //console.log('A: JWT guard canActivate');

        const requiredUserRole: Role = this.reflector.getAllAndOverride<Role>(USER_ROLE, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request: Request = context.switchToHttp().getRequest();
        const response : Response = context.switchToHttp().getResponse();
        
        // If we come from the refresh auth endpoint we want to check the refresh token!
        const access_token = this.jwtService.verifyToken(request.cookies.access_token);
        const refresh_token = this.jwtService.verifyToken(request.cookies.refresh_token);
        const isRefreshFlow = request.url === '/auth/refresh';

        if (isRefreshFlow) {
            if (!refresh_token || this.checkRoleAccess(requiredUserRole, refresh_token['role']) === false) {
                response.redirect('/auth/google/?redirect_uri=' + request.url);
                return false;
            }

            return super.canActivate(context);
        }

        if (access_token && refresh_token && this.checkRoleAccess(requiredUserRole, access_token['role']) && this.checkRoleAccess(requiredUserRole, refresh_token['role'])) {
            return super.canActivate(context);
        }

        if (!access_token && refresh_token && this.checkRoleAccess(requiredUserRole, refresh_token['role'])) {
            response.status(401).send('Token expired');
            return false;
        }

        response.status(401).send('Unauthorized');
        return false;
    }

    private checkRoleAccess(requiredRole: Role, userRole: Role): boolean {
        switch (requiredRole) {
            case Role.USER:
                return userRole === Role.USER || userRole === Role.ADMIN;
            case Role.ADMIN:
                return userRole === Role.ADMIN;
            default:
                return false;
        }
    }
}
