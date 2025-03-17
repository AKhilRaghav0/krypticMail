import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 2525,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    const { to, subject, content } = await request.json();

    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email using local SMTP server
    await transporter.sendMail({
      from: 'test@example.com',
      to,
      subject,
      text: content,
    });

    return NextResponse.json({ status: 'sent' });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 