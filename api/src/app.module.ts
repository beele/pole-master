import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseApp } from './auth/firebase-app';
import { PreAuthMiddleware } from './auth/pre-auth-middleware';
import { RoleAuthMiddleware } from './auth/role-auth-middleware';
import { PoleService } from './pole/pole.service';
import { DatabaseService } from './db/db.service';
import { PoleController } from './pole/pole.controller';

@Module({
    imports: [],
    controllers: [AppController, PoleController],
    providers: [AppService, FirebaseApp, DatabaseService, PoleService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(PreAuthMiddleware).forRoutes({
            path: '/secure/*',
            method: RequestMethod.ALL,
        });
    }
}
