import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard, UserRole } from './auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    hello(): string {
        return 'Hello world';
    }

    @Get('secure/admin')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.ADMIN)
    helloSecuredAdmin(): string {
        return 'Hello world secured admin';
    }

    @Get('secure/user')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    helloSecuredUser(): string {
        return 'Hello world secured user';
    }
}
