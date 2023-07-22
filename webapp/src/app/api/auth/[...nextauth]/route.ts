import axios from 'axios';
import NextAuth, { Session } from 'next-auth';
import { encode } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                  prompt: "consent",
                  access_type: "offline",
                  response_type: "code"
                }
              }
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
            // Bing over the access and refresh tokens to the user session.
            session.accessToken = token?.accessToken ?? null;
            session.refreshToken = token?.refreshToken ??  null;
            return session;
        },
        async jwt({ token, user, account, profile, trigger }) {
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
                const actualTokens = tokenCookies.map((tkn) => {
                    return tkn.split('=')[1].split(';')[0];
                });

                token.accessToken = actualTokens[0];
                token.refreshToken = actualTokens[1];
            }

            if (trigger === 'update') {
                
            }

            return token;
        },
    },
});

export { handler as GET, handler as POST };
