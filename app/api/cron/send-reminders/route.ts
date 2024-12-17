// import { NextResponse } from 'next/server';
// import { connectToDB } from '@/utils/connectDB';
// import User from '@/app/models/User';

// // Vercel cron job handler
// export const runtime = 'edge';
// export const dynamic = 'force-dynamic';
// export const maxDuration = 300;

// export async function GET(request: Request) {
//     try {
//         // Verify the request is from Vercel Cron
//         const authHeader = request.headers.get('authorization');
//         if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//             return new Response('Unauthorized', { status: 401 });
//         }

//         // Trigger email sending for all users
//         const response = await fetch(`${process.env.NEXTAUTH_URL}/api/email`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ type: 'batch-reminder' })
//         });

//         if (!response.ok) {
//             throw new Error('Failed to send reminder emails');
//         }

//         return NextResponse.json({
//             success: true,
//             message: 'Reminder emails triggered successfully'
//         });
//     } catch (error) {
//         console.error('Cron job error:', error);
//         return NextResponse.json(
//             { error: 'Failed to execute cron job' },
//             { status: 500 }
//         );
//     }
// }
