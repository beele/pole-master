import { Controller, Get, HttpException, HttpStatus, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { JwtService } from './jwt.service';
import { UserService } from 'src/user/user.service';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard, UserRole } from './jwt-auth.guard';
import { GoogleUserPayload } from './google.strategy';
import { JwtSpecificPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

    @Get('next-auth/login')
    @UseGuards(JwtAuthGuard)
    async nextAuthAuthLogin(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        console.log(req.query.access_token);
        res.cookie('access_token', req.query.access_token, {
            httpOnly: true,
            maxAge: 3600000, //1h
            sameSite: 'lax',
            secure: false,
        });
        res.cookie('refresh_token', req.query.refresh_token, {
            httpOnly: true,
            maxAge: 60480000, //7d
            sameSite: 'lax',
            secure: false,
        });
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Query() query) {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user: GoogleUserPayload = req.user as GoogleUserPayload;

        let retrievedOrCreatedUser: User = await this.userService.findUserByEmail(user.email);
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

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 3600000, //1h
            sameSite: 'lax',
            secure: false,
        });
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 60480000, //7d
            sameSite: 'lax',
            secure: false,
        });

        const redirect = decodeURI(req.query['state'] as string ?? '/');
        res.redirect(redirect);
    }

    // TODO: FIX: Invalidate the received refresh token!
    @Get('refresh')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    async generateAccessToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken: string = req.cookies.refresh_token;
        if (!refreshToken) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        const decodedToken = this.jwtService.verifyToken(refreshToken);
        if (!decodedToken) {
            throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        const payload = {
            firstName: decodedToken.firstName,
            lastName: decodedToken.lastName,
            email: decodedToken.email,
            picture: decodedToken.picture,
            role: decodedToken.role,
        };

        const newAccessToken = this.jwtService.generateToken(payload);
        const newRefreshToken = this.jwtService.generateRefreshToken(payload);

        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            maxAge: 3600000, //1h
            sameSite: true,
            secure: false,
        });
        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            maxAge: 60480000, //7d
            sameSite: 'lax',
            secure: false,
        });
    }

    @Get('logout')
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response, @Query() query) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.redirect(req.query.redirect_uri as string ?? '');
    }
}
