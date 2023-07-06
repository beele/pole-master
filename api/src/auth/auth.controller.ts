import { Controller, Get, HttpCode, InternalServerErrorException, Req, Res, UseGuards } from '@nestjs/common';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { AuthService } from './auth.service';
import { UserDto } from 'src/user/user.service';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Get('google')
    @UseGuards(GoogleOAuthGuard)
    async auth() {}

    @Get('google/callback')
    @UseGuards(GoogleOAuthGuard)
    @HttpCode(200)
    async googleAuthCallback(@Req() req: Request, @Res({passthrough: true}) res: Response) {
        try {
            const token = await this.authService.signIn(req.user as UserDto);

            res.cookie('access_token', token, {
                maxAge: 2592000000,
                sameSite: true,
                secure: false,
            });

            return 'Logged in!';
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException();
        }
    }
}
