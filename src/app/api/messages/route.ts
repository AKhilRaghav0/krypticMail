import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find the temporary email
    const tempEmail = await prisma.tempEmail.findUnique({
      where: { address: email },
      include: {
        messages: {
          orderBy: { receivedAt: 'desc' }
        }
      }
    });

    if (!tempEmail) {
      return NextResponse.json(
        { error: 'Email address not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ messages: tempEmail.messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
} 