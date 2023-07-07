import { Controller, Get, UseGuards } from '@nestjs/common';
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
    helloAdmin(): string {
        return 'Hello world admin';
    }

    @Get('secure/user')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    helloUser(): string {
        return 'Hello world user';
    }
}
