import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Generate a random subdomain
    const randomSubdomain = randomBytes(8).toString('hex');
    const email = `${randomSubdomain}@krypticbit.io`;
    
    // Create temporary email in database
    const tempEmail = await prisma.tempEmail.create({
      data: {
        id: randomSubdomain,
        address: email,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    return NextResponse.json({ email: tempEmail.address });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: 'Failed to generate email address' },
      { status: 500 }
    );
  }
} 