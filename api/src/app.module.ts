import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { PoleService } from './pole/pole.service';
import { DatabaseService } from './db/db.service';
import { PoleController } from './pole/pole.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { GoogleStrategy } from './auth/google.strategy';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { FirebaseService } from './auth/firebase.service';
import { PreAuthMiddleware } from './auth/pre-auth-middleware';

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '60s' },
        }),
    ],
    controllers: [
        AuthController, 
        AppController, 
        PoleController
    ],
    providers: [
        GoogleStrategy,
        JwtStrategy,
        AuthService,
        FirebaseService,
        DatabaseService,
        UserService,
        PoleService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): any {
        consumer.apply(PreAuthMiddleware).forRoutes({
            path: '/firebase/*',
            method: RequestMethod.ALL,
        });
    }
}
