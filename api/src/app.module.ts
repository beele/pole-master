import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { FirebaseService } from './auth/firebase-service';
import { PreAuthMiddleware } from './auth/pre-auth-middleware';
import { PoleService } from './pole/pole.service';
import { DatabaseService } from './db/db.service';
import { PoleController } from './pole/pole.controller';

@Module({
    imports: [],
    controllers: [AppController, PoleController],
    providers: [FirebaseService, DatabaseService, PoleService],
})

// TODO: Guard: https://docs.nestjs.com/guards

export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(PreAuthMiddleware).forRoutes({
            path: '/secure/*',
            method: RequestMethod.ALL,
        });
    }
}
