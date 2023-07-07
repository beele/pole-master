import {
    Module,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { PoleService } from './pole/pole.service';
import { DatabaseService } from './db/db.service';
import { PoleController } from './pole/pole.controller';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { GoogleStrategy } from './auth/google.strategy';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { JwtService } from './auth/jwt.service';

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
        JwtService,
        JwtStrategy,
        DatabaseService,
        UserService,
        PoleService,
    ],
})
export class AppModule {}
