import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    constructor() {}

    @Get()
    hello(): string {
        return 'Hello world';
    }

    @Get('/secure/')
    async secureHello(): Promise<string> {
        return 'Secure Hello world';
    }
}
