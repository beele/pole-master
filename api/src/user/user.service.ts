import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/db/db.service';

@Injectable()
export class UserService {
    constructor(private dbService: DatabaseService) {}

    public async findUserByEmail(email: string): Promise<User> {
        const user = await this.dbService.db.user.findUnique({where: { email: email }});
        // TODO: Checks?
        return user;
    }

    public async findUserById(id: number): Promise<User> {
        const user = await this.dbService.db.user.findUnique({where: { id: id }});
        // TODO: Checks?
        return user;
    }

    public async createUser(userToCreate: UserDto): Promise<User> {
        const newUser = await this.dbService.db.user.create({data: { ...userToCreate }});
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
    
    accessToken: string;
    refreshToken: string;
}
