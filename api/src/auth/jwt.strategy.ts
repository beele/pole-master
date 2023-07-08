import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { Role, User } from '@prisma/client';
import { Request } from 'express';

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
    constructor(private readonly userService: UserService) {
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWTFromCookie]),
        });
    }

    private static extractJWTFromCookie(req: Request): string | null {
        //console.log('A: JWT strat extract JWT');

        if (req.cookies && req.url === '/auth/refresh' && req.cookies.refresh_token) {
            return req.cookies.refresh_token;
        }
        if (req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
        }
        return null;
    }

    public async validate(payload: JwtPayload, done: VerifiedCallback) {
        // TODO: What kind of validation is needed here? The JWT-auth guard already checks a lot (invoked before this)!
        //console.log('A: JWT strat validate');

        const user: User = await this.userService.findUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException('Please log in to continue');
        }

        done(null, payload);
    }
}
