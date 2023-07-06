import { Body, Controller, Delete, Get, Post } from "@nestjs/common";
import { Pole } from "@prisma/client";
import { PoleDto, PoleService } from "./pole.service";

@Controller()
export class PoleController {

    constructor(private readonly poleService: PoleService) {}

    @Get('/poles')
    async retrieveAllPoles(): Promise<Pole[]> {
        return this.poleService.allPoles;
    }

    @Post('/poles')
    async createPoles(@Body() poleDto: PoleDto[]): Promise<Pole[]> {
        return this.poleService.createNewPoles(poleDto.map(dto => dto.url));
    }

    @Delete('/poles')
    async deletePoles(@Body() poleDto: PoleDto[]): Promise<void> {
        this.poleService.deletePoles(poleDto.map(dto => dto.url));
    }
}
