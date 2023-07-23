import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: 'http://localhost:4000',
        credentials: true,
        allowedHeaders: ['Access_token'],
        exposedHeaders: ['Access_token'],
    });
    app.use(cookieParser());
    await app.listen(3000);
}
bootstrap();
