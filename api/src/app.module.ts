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
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from './user/user.service';

@Module({
    imports: [ConfigModule.forRoot(), JwtModule.register({secret: 'totally-secret-jwt-key'})],
    controllers: [AuthController, AppController, PoleController],
    providers: [GoogleStrategy, JwtStrategy, AuthService, DatabaseService, UserService, PoleService],
})

export class AppModule {
}
