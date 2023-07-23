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
        const access_token = request.headers['access_token'] as string;
        const verified_access_token = this.jwtService.verifyToken(access_token);

        const refresh_token = request.cookies.refresh_token;
        const verified_refresh_token = this.jwtService.verifyToken(refresh_token);

        const isNextAuthLoginFlow = request.url === '/auth/next-auth/login';
        const isRefreshFlow = request.url === '/auth/refresh';

        if (isNextAuthLoginFlow) {
            const decodedSessionToken = await this.decode(
                request.headers['next-auth.session-token'] as string,
                process.env.JWT_SECRET,
            );
            if (!decodedSessionToken) {
                return false;
            }
            request.query.decoded_session_token = decodedSessionToken;

            return (await super.canActivate(context)) as boolean;
        }

        if (isRefreshFlow) {
            // TODO: Rework the redirect flow, this does not work with next-auth!
            if (refresh_token && !verified_refresh_token) {
                //response.redirect('/auth/google/?redirect_uri=' + request.url);
                response.status(401).send('Refresh token expired or invalid');
                return false;
            }
            return (await super.canActivate(context)) as boolean;
        }

        if (access_token && !verified_access_token) {
            response.status(401).send('Token expired or invalid');
            return false;
        }

        if (verified_access_token) {
            if (this.checkRoleAccess(requiredUserRole, verified_access_token['role'])) {
                return (await super.canActivate(context)) as boolean;
            }
            response.status(401).send('Insufficient privileges');
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
