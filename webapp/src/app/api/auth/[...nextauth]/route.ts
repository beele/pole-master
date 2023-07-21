import axios from 'axios';
import NextAuth from 'next-auth';
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
        async session({ session, token, user }) {
            if (token) {
                (session as any).accessToken = token.accessToken;
                (session as any).refreshToken = token.refreshToken;
            }

            return session;
        },
        async jwt({ token, user, account, profile, trigger }) {
            if (profile) {
                token.profile = profile;
            }

            if (trigger === 'signIn') {
                /*console.log('token', token);
                console.log('user', user);
                console.log('account', account);
                console.log('profile', profile);*/
                console.log('trigger', trigger);

                const tokenString = await encode({ token: token, secret: process.env.NEXTAUTH_SECRET ?? '' });
                const response = await axios.get<any>('http://localhost:3000/auth/next-auth/login', {
                    withCredentials: true,
                    headers: { 'next-auth.session-token': tokenString },
                });
                // TODO: we need to set our access and refresh tokens that we received!

                const tokenCookies: string[] = response.headers['set-cookie'] ?? [];
                const actualTokens = tokenCookies.map((tkn) => {
                    return tkn.split('=')[1].split(';')[0];
                });
                console.log(actualTokens);
                token.accessToken = actualTokens[0];
                token.refreshToken = actualTokens[1];
            }

            return token;
        },
    },
});

export { handler as GET, handler as POST };
