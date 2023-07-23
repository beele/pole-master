import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { AuthOptions, Session } from 'next-auth';
import { encode } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { NextResponse } from 'next/server';

const nextAuthOptions = (req: NextApiRequest, res: ExpandedNextApiRequest): AuthOptions => {
    return {
        providers: [
            GoogleProvider({
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                authorization: {
                    params: {
                        prompt: 'consent',
                        access_type: 'offline',
                        response_type: 'code',
                    },
                },
            }),
        ],
        secret: process.env.JWT_SECRET,
        session: { strategy: 'jwt' },
        callbacks: {
            async signIn({ user, account, profile, email, credentials }) {
                return true;
            },
            async redirect({ url, baseUrl }) {
                return baseUrl;
            },
            async session({ session, token, user }): Promise<Session> {
                console.log('session access');

                session.accessToken = token?.accessToken ?? null;
                session.accessTokenExpiry = token?.accessTokenExpiry ?? null;
                return session;
            },
            async jwt({ token, user, account, profile, trigger, session }) {
                console.log('jwt generate');

                if (profile) {
                    token.profile = profile;
                }

                if (trigger === 'signIn') {
                    console.log('trigger', trigger);

                    const tokenString = await encode({ token: token, secret: process.env.NEXTAUTH_SECRET ?? '' });
                    const response = await axios.get<any>('http://localhost:3000/auth/next-auth/login', {
                        withCredentials: true,
                        headers: { 'next-auth.session-token': tokenString },
                    });

                    // The cookies received from the request are not set, so we extract them and put them on our token.
                    const tokenCookies: string[] = response.headers['set-cookie'] ?? [];
                    // TODO: Better/safer extraction method
                    const actualTokens = tokenCookies.map((tkn) => {
                        return tkn.split('=')[1].split(';')[0];
                    });

                    token.accessToken = response.headers['access_token'];
                    token.accessTokenExpiry = response.headers['access_token_expiry'];
                    // "Hack" to be able to set the refresh token as an HTTP-only cookie!
                    res.refreshToken = actualTokens[0];
                }

                if (trigger === 'update' && session.accessToken && session.refreshToken) {
                    console.log('jwt update trigger');

                    token.accessToken = session.accessToken;
                    token.accessTokenExpiry = session.accessTokenExpiry
                    // The new refresh token is already set as an HTTP-cookie as it is returned from the API server as such!
                }

                return token;
            },
        },
    };
};

// TODO: With the app router the res object passed is NOT the response!
// TODO: Find a way to access the actual response in the nextAutOptions to set the http cookies!
// https://next-auth.js.org/configuration/initialization#advanced-initialization
// https://nextjs.org/docs/app/building-your-application/routing/router-handlers
// The NextApiResponse is actually a RouteHandlerContext!!! Next auth fuckery!
const handler = async (req: NextApiRequest, res: ExpandedNextApiRequest) => {
    const response: NextResponse = await NextAuth(req, res, nextAuthOptions(req, res));
    if (res.refreshToken) {
        const previousSetCookie = response.headers.get('set-cookie');
        response.headers.set(
            'set-cookie',
            previousSetCookie + ',refresh-token=' + res.refreshToken + '; path=/; HttpOnly; SameSite=lax',
        );
    }
    console.log('requested handled');
    return response;
};

export { handler as GET, handler as POST };

type ExpandedNextApiRequest = NextApiResponse & {
    refreshToken: string;
};
