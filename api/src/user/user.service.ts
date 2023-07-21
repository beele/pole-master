import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express';
import { JwtService } from 'src/auth/jwt.service';
import { DatabaseService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private readonly jwtService: JwtService, private readonly dbService: DatabaseService) {}

    public async getUserFromRequest(request: Request): Promise<User> {
        const accessToken: string = request.cookies.access_token ?? request.headers['access_token'];
        const decodedToken = this.jwtService.verifyToken(accessToken);
        // TODO: Checks?
        return await this.findUserByEmail(decodedToken.email);
    }

    public async findUserByEmail(email: string): Promise<User> {
        const user = await this.dbService.db.user.findUnique({ where: { email: email } });
        // TODO: Checks?
        return user;
    }

    public async findUserById(id: number): Promise<User> {
        const user = await this.dbService.db.user.findUnique({ where: { id: id } });
        // TODO: Checks?
        return user;
    }

    public async createUser(userToCreate: UserDto): Promise<User> {
        const newUser = await this.dbService.db.user.create({ data: { ...userToCreate } });
        // TODO: Checks?
        return newUser;
    }
}

export type UserDto = {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
};
