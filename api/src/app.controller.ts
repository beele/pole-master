import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

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
}
