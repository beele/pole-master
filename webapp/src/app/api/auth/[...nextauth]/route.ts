import axios from 'axios';
import NextAuth from 'next-auth';
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
            return session;
        },
        async jwt({ token, user, account, profile, trigger }) {
            if (trigger === 'signIn') {
                console.log('token', token);
                console.log('user', user);
                console.log('account', account);
                console.log('profile', profile);
                console.log('trigger', trigger);

                await axios.get<any>('http://localhost:3000/auth/next-auth/login', { withCredentials: true });
                // TODO: This will set our access and refresh tokens!
            }

            if (profile) {
                token.profile = profile;
            }

            return token;
        },
    },
});

export { handler as GET, handler as POST };
