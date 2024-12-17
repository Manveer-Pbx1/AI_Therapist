import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getWelcomeEmailTemplate, getReminderEmailTemplate } from '@/utils/emailTemplates';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password instead of regular password
    },
});

// Verify transporter
transporter.verify(function (error, success) {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Connection Success');
    }
});

export async function POST(request: Request) {
    try {
        // Validate environment variables
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('Email configuration missing');
        }

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

        // Enhanced validation
        if (!email || !name || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!['welcome', 'reminder'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid email type' },
                { status: 400 }
            );
        }

        let subject, htmlContent;
        if (type === 'welcome') {
            subject = 'Welcome to AI Therapy Companion! 🌟';
            htmlContent = getWelcomeEmailTemplate(name);
        } else {
            subject = 'Time for Your Mental Wellness Check-in 💭';
            htmlContent = getReminderEmailTemplate(name);
        }

        const mailOptions = {
            from: `AI Therapy <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: htmlContent,
        };

        console.log('Attempting to send email to:', email);
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        return NextResponse.json({ 
            success: true,
            messageId: info.messageId
        });
    } catch (error) {
        console.error('Detailed email sending error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
        return NextResponse.json(
            { 
                error: errorMessage,
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined 
            },
            { status: 500 }
        );
    }
}
