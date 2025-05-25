import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectToDatabase from '@/app/conn/db';
import Owner from '@/models/Owner';

// Define authOptions first so it can be reused
export const authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "google") {
                await connectToDatabase();
                const existing = await Owner.findOne({ email: user.email });
                if (!existing) {
                    const newOwner = new Owner({
                        email: user.email,
                        name: user.name
                    });
                    await newOwner.save();
                }
            }
            return true;
        },
    },
};

// Use authOptions in the NextAuth handler
const handler = NextAuth(authOptions);

// Export GET and POST for App Router
export { handler as GET, handler as POST };
