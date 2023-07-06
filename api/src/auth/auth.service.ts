import {
    BadRequestException,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserDto, UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService: JwtService, private readonly userService: UserService) {}

    public async signIn(user: UserDto) {
        if (!user) {
            throw new BadRequestException('Unauthenticated');
        }

        let userExists: User = await this.userService.findUserByEmail(user.email);
        if (!userExists) {
            userExists = await this.userService.createUser({ ...user });
        }

        return this.generateJwt({
            sub: userExists.id,
            email: userExists.email,
        });
    }

    private generateJwt(payload) {
        return this.jwtService.sign(payload);
    }
}
