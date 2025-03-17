import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Extract email data
    const {
      to,
      from,
      subject,
      text,
      html,
      attachments = []
    } = data;

    // Find the temporary email address
    const tempEmail = await prisma.tempEmail.findFirst({
      where: {
        address: to,
        expiresAt: {
          gt: new Date() // Only accept emails for non-expired addresses
        }
      }
    });

    if (!tempEmail) {
      return NextResponse.json(
        { error: 'Temporary email not found or expired' },
        { status: 404 }
      );
    }

    // Store the message
    const message = await prisma.message.create({
      data: {
        tempEmailId: tempEmail.id,
        from: from || 'unknown@example.com',
        subject: subject || '(No Subject)',
        content: text || '',
        html: html || null,
        attachments: attachments?.length > 0 ? attachments : []
      }
    });

    return NextResponse.json({ success: true, messageId: message.id });
  } catch (error) {
    console.error('Error processing incoming email:', error);
    return NextResponse.json(
      { error: 'Failed to process email' },
      { status: 500 }
    );
  }
} 