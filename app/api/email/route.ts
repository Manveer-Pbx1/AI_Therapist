// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';
// import { connectToDB } from '@/utils/connectDB';
// import User from '@/app/models/User';

// const positiveMessages = [
//     "Remember: You are stronger than you think. Take a moment to breathe deeply.",
//     "Your mental health matters. Have you taken a mindful break today?",
//     "Small steps lead to big changes. Celebrate your progress, no matter how small.",
//     "You're not alone in this journey. Reach out when you need support.",
//     "Take a moment to appreciate yourself today. You're doing great!",
// ];

// const getRandomMessage = () => positiveMessages[Math.floor(Math.random() * positiveMessages.length)];

// // Create a reusable transporter
// const createTransporter = () => {
//     return nodemailer.createTransport({
//         service: "Gmail",
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });
// };

// // Function to send reminders to all users
// const sendRemindersToAllUsers = async () => {
//     try {
//         console.log('Starting reminder emails...');
//         await connectToDB();
//         const users = await User.find({}, { email: 1, username: 1 });
//         const transporter = createTransporter();

//         for (const user of users) {
//             const mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: user.email,
//                 subject: "Your Mental Health Check-in",
//                 text: `Hello ${user.username},\n\n${getRandomMessage()}\n\nRemember, our therapy chatbot is always here to listen and support you.\n\nTake care,\nYour Therapy Chatbot Team`,
//             };

//             await transporter.sendMail(mailOptions);
//             console.log(`Reminder sent to ${user.email}`);
//         }
//         return { success: true, message: "Reminders sent to all users." };
//     } catch (error) {
//         console.error('Error sending reminder emails:', error);
//         return { success: false, error: (error as Error).message };
//     }
// };

// // API endpoint to trigger sending reminders manually or via an external scheduler
// export async function POST(req: Request) {
//     try {
//         const { email, name, type = 'welcome' } = await req.json();

//         if (type === 'batch-reminder') {
//             return await handleBatchReminders();
//         }

//         // Handle individual emails
//         return await handleIndividualEmail(email, name, type);
//     } catch (error) {
//         console.error("Error in email route:", error);
//         return NextResponse.json(
//             { error: "Failed to send email" },
//             { status: 500 }
//         );
//     }
// }

// async function handleBatchReminders() {
//     try {
//         console.log('Starting batch reminder emails...');
//         await connectToDB();
//         const users = await User.find({}, { email: 1, username: 1 });
//         const transporter = createTransporter();

//         for (const user of users) {
//             const mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: user.email,
//                 subject: "Your Mental Health Check-in",
//                 text: `Hello ${user.username},\n\n${getRandomMessage()}\n\nRemember, our therapy chatbot is always here to listen and support you.\n\nTake care,\nYour Therapy Chatbot Team`,
//             };

//             await transporter.sendMail(mailOptions);
//             console.log(`Reminder sent to ${user.email}`);
//         }

//         return NextResponse.json({
//             success: true,
//             message: 'Batch reminders sent successfully'
//         });
//     } catch (error) {
//         throw error;
//     }
// }

// async function handleIndividualEmail(email: string, name: string, type: string) {
//     try {
//         console.log('Attempting to send email:', { email, name, type });

//         if (!email) {
//             throw new Error('Email is required');
//         }

//         const transporter = createTransporter();

//         // Test the connection
//         await transporter.verify();
//         console.log('SMTP connection verified');

//         let mailOptions;
//         if (type === 'reminder') {
//             mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: email,
//                 subject: "Your Mental Health Check-in",
//                 text: `Hello ${name},\n\n${getRandomMessage()}\n\nRemember, our therapy chatbot is always here to listen and support you.\n\nTake care,\nYour Therapy Chatbot Team`,
//             };
//         } else {
//             mailOptions = {
//                 from: process.env.EMAIL_USER,
//                 to: email,
//                 subject: "Welcome to Therapy Chatbot",
//                 text: `Hello ${name}, welcome to our Therapy Chatbot!`,
//             };
//         }

//         const info = await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully:', info.response);

//         return NextResponse.json({ 
//             success: true, 
//             message: `${type} email sent successfully`,
//             messageId: info.messageId 
//         });
//     } catch (error) {
//         console.error("Detailed error sending email:", error);
//         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//         return NextResponse.json(
//             { 
//                 error: "Failed to send email", 
//                 details: errorMessage 
//             },
//             { status: 500 }
//         );
//     }
// }
