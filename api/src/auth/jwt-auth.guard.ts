import { ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { JwtService } from './jwt.service';
import { Request, Response } from 'express';
import { hkdf } from '@panva/hkdf';
import { jwtDecrypt } from 'jose';

export const USER_ROLE = 'userRole';
export const UserRole = (value: Role) => SetMetadata(USER_ROLE, value);

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector, private readonly jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //console.log('A: JWT guard canActivate');

        const requiredUserRole: Role = this.reflector.getAllAndOverride<Role>(USER_ROLE, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request: Request = context.switchToHttp().getRequest();
        const response: Response = context.switchToHttp().getResponse();

        // If we come from the refresh auth endpoint we want to check the refresh token!
        const access_token = this.jwtService.verifyToken(request.cookies.access_token);
        const refresh_token = this.jwtService.verifyToken(request.cookies.refresh_token);
        const isNextAuthLoginFlow = request.url === '/auth/next-auth/login';
        const isRefreshFlow = request.url === '/auth/refresh';

        if (isNextAuthLoginFlow) {
            const decodedSessionToken = await this.decode(
                request.cookies['next-auth.session-token'],
                process.env.JWT_SECRET,
            );
            if (!decodedSessionToken) {
                return false;
            }
            request.query.decoded_session_token = decodedSessionToken;

            return (await super.canActivate(context)) as boolean;
        }

        if (isRefreshFlow) {
            if (!refresh_token || this.checkRoleAccess(requiredUserRole, refresh_token['role']) === false) {
                response.redirect('/auth/google/?redirect_uri=' + request.url);
                return false;
            }
            return (await super.canActivate(context)) as boolean;
        }

        // Regular flow when we have a valid access token!
        if (
            access_token &&
            refresh_token &&
            this.checkRoleAccess(requiredUserRole, access_token['role']) &&
            this.checkRoleAccess(requiredUserRole, refresh_token['role'])
        ) {
            return (await super.canActivate(context)) as boolean;
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

    /** Decodes a NextAuth.js issued JWT. */
    private async decode(token: string, secret: string): Promise<{} | null> {
        if (!token) return null;
        const encryptionSecret = await this.getDerivedEncryptionKey(secret);
        const { payload } = await jwtDecrypt(token, encryptionSecret, {
            clockTolerance: 15,
        });
        return payload;
    }
    private async getDerivedEncryptionKey(secret: string | Buffer) {
        return await hkdf('sha256', secret, '', 'NextAuth.js Generated Encryption Key', 32);
    }
}
