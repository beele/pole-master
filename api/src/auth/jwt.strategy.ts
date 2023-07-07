import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Request } from 'express';

export type JwtPayload = JwtGeneralPayload & JwtSpecificPayload;

export type JwtGeneralPayload = {
    iat: number;
    exp: number;
};

export type JwtSpecificPayload = {
    providerId: number;
    firstName: string;
    lastName: string;
    email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly userService: UserService,
    ) {
        super({
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromExtractors([
                JwtStrategy.extractJWTFromCookie,
            ]),
        });
    }

    private static extractJWTFromCookie(req: Request): string | null {
        if (req.cookies && req.cookies.access_token) {
            return req.cookies.access_token;
        }
        return null;
    }

    public async validate(payload: JwtPayload) {
        const user: User = await this.userService.findUserByEmail(payload.email);
        if (!user) {
            throw new UnauthorizedException('Please log in to continue');
        }

        // TODO: Check claims?

        return {
            id: payload.providerId,
            email: payload.email,
        };
    }
}
