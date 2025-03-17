import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Extract the ID from the email address (everything before @)
    const id = email.split('@')[0];

    // Find the temporary email and extend its expiration time
    const tempEmail = await prisma.tempEmail.update({
      where: { id },
      data: {
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Add 24 hours
      }
    });

    return NextResponse.json({
      message: 'Email expiration time extended',
      expiresAt: tempEmail.expiresAt
    });
  } catch (error) {
    console.error('Error extending email time:', error);
    return NextResponse.json(
      { error: 'Failed to extend email expiration time' },
      { status: 500 }
    );
  }
} 