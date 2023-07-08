import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';

export type GoogleUserPayload = {
    provider: string;
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
};

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['profile', 'email'],
        });
    }

    authenticate(req: Request, options: any) {
        if (!options?.state) {
            options = { ...options, state: encodeURI(req.query.redirect_uri as string ?? '/') };
        }
        return super.authenticate(req, options);
    }

    public async validate(
        request: Request,
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        const user: GoogleUserPayload = {
            provider: 'google',
            providerId: id,
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            picture: photos[0].value,
        };

        done(null, user);
    }
}
