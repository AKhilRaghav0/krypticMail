import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  try {
    const localPart = email.split('@')[0];
    const tempEmail = await prisma.tempEmail.findUnique({
      where: {
        id: localPart,
      },
    });

    if (!tempEmail) {
      return NextResponse.json({ error: 'Email not found' }, { status: 404 });
    }

    // Check if email has expired
    if (new Date() > tempEmail.expiresAt) {
      return NextResponse.json({ error: 'Email has expired' }, { status: 404 });
    }

    return NextResponse.json({ status: 'valid' });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 