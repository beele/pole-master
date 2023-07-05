import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PoleService } from './pole/pole.service';
import { Pole } from '@prisma/client';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Get('/secure/ping')
    async securePing(): Promise<string> {
        return 'pong';
    }
}
