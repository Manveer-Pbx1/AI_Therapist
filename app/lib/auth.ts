import { NextAuthOptions, User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@/utils/connectDB";
import User from "@/app/models/User";
import dotenv from "dotenv";
import { signOut as nextAuthSignOut } from "next-auth/react";
dotenv.config();

declare module "next-auth" {
    interface TheUser extends NextAuthUser {
        id: string;
    }
    interface Session {
        user: {
            id: string;
        } & NextAuthUser;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "consent", // Force re-consent if permissions change
                    access_type: "offline", // Allows refresh tokens
                    scope: "openid profile email",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // When a user logs in, 'user' will be defined
            if (user) {
                // Connect to DB and fetch the user's MongoDB ObjectId
                await connectToDB();
                const dbUser = await User.findOne({ email: user.email }) as { _id: string };
                if (dbUser) {
                    token.id = dbUser._id.toString(); // Store MongoDB ObjectId in token
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id) {
                session.user.id = token.id as string; // Set session user ID to MongoDB ObjectId
            }
            return session;
        },
        async signIn({ profile }: { profile?: any }) {
            try {
                await connectToDB();
                const userExists = await User.findOne({ email: profile?.email });

                if (!userExists) {
                    await User.create({
                        username: profile?.name?.replace(/\s+/g, "").toLowerCase(),
                        email: profile?.email,
                        image: profile?.image,
                        last_reminder_sent: new Date(0) // Initialize with past date
                    });

                    // Send welcome email for new users only
                    await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: profile?.email,
                            name: profile?.name,
                            type: 'welcome'
                        }),
                    });
                } else {
                    // Update the existing user's image if it changed
                    await User.findOneAndUpdate(
                        { email: profile?.email },
                        { image: profile?.picture || profile?.image }
                    );
                }

                return true;
            } catch (error) {
                console.error("Error signing in:", error);
                return false;
            }
        },
    },
    debug: true,
    logger: {
        error(code, ...message) {
            console.error(code, message);
        },
        warn(code, ...message) {
            console.warn(code, message);
        },
        debug(code, ...message) {
            console.debug(code, message);
        },
    },
};

// Add signOutUser function
export const signOutUser = async () => {
    try {
        await nextAuthSignOut({
            callbackUrl: "/",
            redirect: true,
        });
    } catch (error) {
        console.error("Error signing out:", error);
        throw error; // Propagate the error to handle it in the UI
    }
};
