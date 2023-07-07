import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { GoogleOAuthGuard } from './auth/google-oauth.guard';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    hello(): string {
        return 'Hello world';
    }

    @Get('secure')
    @UseGuards(JwtAuthGuard)
    helloSecured(): string {
        return 'Hello world secured';
    }

    @Get('firebase/ping')
    helloFirebase(): string {
        return 'Hello world secured firebase';
    }
}
