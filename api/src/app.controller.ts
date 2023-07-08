import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, UserRole } from './auth/jwt-auth.guard';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { UserService } from './user/user.service';

@Controller()
export class AppController {

    constructor(private readonly userService: UserService) {}

    @Get()
    hello(): string {
        return 'Hello world';
    }

    @Get('secure/admin')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.ADMIN)
    helloAdmin(@Req() req: Request) {
        return {result: 'Hello world admin'};
    }

    @Get('secure/user')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    helloUser(@Req() req: Request) {
        return this.userService.getUserFromRequest(req);
        //return {result: 'Hello world user'};
    }
}
