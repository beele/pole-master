import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
    constructor(private readonly jwtService: NestJwtService) {}

    generateToken(payload: any): string {
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
            secret: process.env.JWT_SECRET
        });
        return accessToken;
    }

    generateRefreshToken(payload: any): string {
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
            secret: process.env.JWT_SECRET
        });
        return refreshToken;
    }

    verifyToken(token: string): any {
        try {
            const decoded = this.jwtService.verify(token, {secret: process.env.JWT_SECRET});
            return decoded;
        } catch (error) {
            return null;
        }
    }
}
