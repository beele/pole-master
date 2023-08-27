import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Pole, Role } from "@prisma/client";
import { PoleDto, PoleService } from "./pole.service";
import { JwtAuthGuard, UserRole } from "src/auth/jwt-auth.guard";
import { Request, Response } from "express";
import { UserService } from "src/user/user.service";

@Controller()
export class PoleController {

    constructor(private readonly poleService: PoleService, private readonly userService: UserService) {}

    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    @Get('/poles')
    async retrieveAllPoles(@Req() req: Request, @Query('cursor') cursor, @Query('direction') direction = 'next', @Res() res: Response): Promise<Pole[]> {
        if (!['next', 'prev'].includes(direction)) {
            res.status(HttpStatus.BAD_REQUEST).send('Invalid direction parameter. Must be "next" or "prev"!');
        }

        return this.poleService.getExistingPolesPaginated(cursor, direction as 'next' | 'prev');
    }

    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    @Get('/poles/user')
    async retrieveUserPoles(@Req() req: Request) {
        const retrievedUser = await this.userService.getUserFromRequest(req);
        return await this.poleService.getPolesForUser(retrievedUser);
    }

    @UseGuards(JwtAuthGuard)
    @UserRole(Role.USER)
    @Post('/poles/link')
    async linkPoles(@Req() req: Request, @Body() poleIds: number[]): Promise<void> {
        const retrievedUser = await this.userService.getUserFromRequest(req);
        this.poleService.linkPoles(poleIds, retrievedUser);
    }

    @Post('/poles')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.ADMIN)
    async createPoles(@Body() poleDto: PoleDto[]): Promise<Pole[]> {
        return this.poleService.createNewPoles(poleDto.map(dto => dto.url));
    }

    @Delete('/poles')
    @UseGuards(JwtAuthGuard)
    @UserRole(Role.ADMIN)
    async deletePoles(@Body() poleDto: PoleDto[]): Promise<void> {
        this.poleService.deletePoles(poleDto.map(dto => dto.url));
    }
}
