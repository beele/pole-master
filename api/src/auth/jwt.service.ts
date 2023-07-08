import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { JwtPayload, JwtSpecificPayload } from './jwt.strategy';

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    generateToken(payload: JwtSpecificPayload): string {
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            secret: process.env.JWT_SECRET
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtSpecificPayload): string {
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
            secret: process.env.JWT_SECRET
        });
        return refreshToken;
    }

    verifyToken(token: string): JwtPayload {
        try {
            // The verify method checks the token for expiry.
            const decoded: JwtPayload = this.jwtService.verify(token, {secret: process.env.JWT_SECRET});
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
