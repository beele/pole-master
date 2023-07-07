import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { JwtService } from './jwt.service';

export const USER_ROLE = 'userRole';
export const UserRole = (value: Role) => SetMetadata(USER_ROLE, value);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector, private readonly jwtService: JwtService) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const requiredUserRole: Role = this.reflector.getAllAndOverride<Role>(USER_ROLE, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest();
        const token = request.cookies.access_token;

        if (!token) {
            return false;
        }

        const decodedToken = this.jwtService.verifyToken(token);
        if (!decodedToken || this.checkRoleAccess(requiredUserRole, decodedToken['role']) === false) {
            return false;
        }

        return super.canActivate(context);
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
