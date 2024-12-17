import { NextResponse } from 'next/server';
import { connectToDB } from '@/utils/connectDB';
import User from '@/app/models/User';

// Vercel cron job handler
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
    try {
        // Verify the request is from Vercel Cron
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        await connectToDB();
        
        // Get current date and date 2 days ago
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));

        // Find users who haven't received a reminder in the last 2 days
        const eligibleUsers = await User.find({
            last_reminder_sent: { $lt: twoDaysAgo }
        });

        // Send emails to eligible users
        for (const user of eligibleUsers) {
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.username,
                    type: 'reminder'
                })
            });

            if (response.ok) {
                // Update last_reminder_sent timestamp
                await User.findByIdAndUpdate(user._id, {
                    last_reminder_sent: now
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Reminder emails sent to ${eligibleUsers.length} users`
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            { error: 'Failed to execute cron job' },
            { status: 500 }
        );
    }
}
