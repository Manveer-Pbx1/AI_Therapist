import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getWelcomeEmailTemplate, getReminderEmailTemplate } from '@/utils/emailTemplates';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // Use App Password instead of regular password
    },
});

export async function POST(request: Request) {
    try {
        // Handle CORS
        if (request.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        const { email, name, type } = await request.json();

        if (!email || !name || !type) {
            throw new Error('Missing required fields');
        }

        let subject, htmlContent;
        if (type === 'welcome') {
            subject = 'Welcome to AI Therapy Companion! 🌟';
            htmlContent = getWelcomeEmailTemplate(name);
        } else if (type === 'reminder') {
            subject = 'Time for Your Mental Wellness Check-in 💭';
            htmlContent = getReminderEmailTemplate(name);
        }

        const mailOptions = {
            from: `AI Therapy <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        return NextResponse.json({ 
            success: true,
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Email sending error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
