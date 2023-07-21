import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { GoogleUserPayload } from './google.strategy';
import { JwtService } from './jwt.service';

export type JwtPayload = JwtGeneralPayload & JwtSpecificPayload;

export type JwtGeneralPayload = {
    iat: number;
    exp: number;
};

export type JwtSpecificPayload = {
    firstName: string;
    lastName: string;
    email: string;
    picture: string;
    role: Role;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWTFromCookieOrHeader]),
        });
    }

    public async authenticate(req: Request, options: any) {
        //console.log('A: JWT strat authenticate');

        if (req.cookies && req.url === '/auth/next-auth/login') {
            const user: GoogleUserPayload = {
                provider: 'google',
                providerId: (req.query.decoded_session_token as any).sub, // TODO: Is this field correct?
                email: (req.query.decoded_session_token as any).profile.email,
                firstName: (req.query.decoded_session_token as any).profile.given_name,
                lastName: (req.query.decoded_session_token as any).profile.family_name,
                picture: (req.query.decoded_session_token as any).profile.picture,
            }
            
            let retrievedOrCreatedUser: User = await this.userService.findUserByEmail(user?.email);
            if (!retrievedOrCreatedUser) {
                retrievedOrCreatedUser = await this.userService.createUser({ ...user });
            }

            const payload: JwtSpecificPayload = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                picture: user.picture,
                role: retrievedOrCreatedUser.role,
            };
            const accessToken = this.jwtService.generateToken(payload);
            const refreshToken = this.jwtService.generateRefreshToken(payload);

            req.query.access_token = accessToken;
            req.query.refresh_token = refreshToken;
            req.query.decoded_session_token = undefined;
        }
        return super.authenticate(req, options);
    }

    private static extractJWTFromCookieOrHeader(req: Request): string | null {
        //console.log('A: JWT strat extract JWT');

        if (req.url === '/auth/next-auth/login' && req.query?.access_token) {
            return req.query.access_token as string;
        }
        
        if (req.url === '/auth/refresh') {
            return req.cookies?.refresh_token ?? req.headers['refresh_token'] as string ?? null;
        }

        return req.cookies?.access_token ?? req.headers['access_token'] as string ?? null;
    }

    public async validate(payload: JwtPayload, done: VerifiedCallback) {
        //console.log('A: JWT strat validate', payload);

        // TODO: What kind of validation is needed here? Most stuff has already been checked in the authenticate method.
        //const user: User = await this.userService.findUserByEmail(payload.email);
        if (!payload) {
            throw new UnauthorizedException('Please log in to continue');
        }

        done(null, payload);
    }
}
