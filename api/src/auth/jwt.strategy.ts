import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { User } from '@prisma/client';
import { Request } from 'express';

export type JwtPayload = {
    sub: number;
    email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(private readonly userService: UserService) {
        const extractJwtFromCookie = (req: Request) => {
            let token = null;
            if (req && req.cookies) {
                token = req.cookies['access_token'];
            }
            return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        };

        super({
            ignoreExpiration: false,
            secretOrKey: 'totally-secret-jwt-key',
            jwtFromRequest: extractJwtFromCookie,
        });
    }

    public async validate(payload: JwtPayload) {
        console.log(payload);
        const user: User = await this.userService.findUserById(payload.sub);
        console.log(user);

        if (!user) {
            throw new UnauthorizedException('Please log in to continue');
        }

        return {
            id: payload.sub,
            email: payload.email,
        };
    }
}
