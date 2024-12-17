import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getWelcomeEmailTemplate, getReminderEmailTemplate } from '@/utils/emailTemplates';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function POST(request: Request) {
    try {
        const { email, name, type } = await request.json();

        let subject, htmlContent;
        if (type === 'welcome') {
            subject = 'Welcome to AI Therapy Companion! 🌟';
            htmlContent = getWelcomeEmailTemplate(name);
        } else if (type === 'reminder') {
            subject = 'Time for Your Mental Wellness Check-in 💭';
            htmlContent = getReminderEmailTemplate(name);
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            html: htmlContent,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        );
    }
}
