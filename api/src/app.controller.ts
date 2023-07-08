import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, UserRole } from './auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Request } from 'express';

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
    helloAdmin(@Req() request: Request): string {
        return 'Hello world admin';
    }

    @Get('secure/user')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    helloUser(): string {
        return 'Hello world user';
    }
}
