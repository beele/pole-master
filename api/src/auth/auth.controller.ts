import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UserDto, UserService } from 'src/user/user.service';
import { User } from '@prisma/client';

@Controller('auth')
export class AuthController {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        const user: UserDto = req.user as UserDto;
        console.log(user);

        const payload = {
            providerId: user.providerId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };

        let userExists: User = await this.userService.findUserByEmail(user.email);
        if (!userExists) {
            userExists = await this.userService.createUser({ ...user });
        }

        // TODO: Insert claims?

        const accessToken = this.jwtService.generateToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);

        res
        .cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 3600000, //1h
            sameSite: true,
            secure: false,
        });
        res
        .cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 60480000, //7d
            sameSite: 'lax',
            secure: false,
        });

        return { accessToken, refreshToken };
    }
}
