import { PubSub } from 'graphql-subscriptions';
import prisma from '@/lib/prisma';
import { generateId } from '@/lib/utils';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    tempEmail: async (_, { email }) => {
      const id = email.split('@')[0];
      const tempEmail = await prisma.tempEmail.findUnique({
        where: { id },
        include: { messages: true }
      });
      return tempEmail;
    },
    messages: async (_, { email }) => {
      const id = email.split('@')[0];
      const messages = await prisma.message.findMany({
        where: { tempEmailId: id },
        orderBy: { receivedAt: 'desc' }
      });
      return messages;
    }
  },

  Mutation: {
    generateEmail: async () => {
      const id = generateId();
      const email = `${id}@krypticbit.io`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const tempEmail = await prisma.tempEmail.create({
        data: {
          id,
          email,
          expiresAt
        },
        include: { messages: true }
      });

      return tempEmail;
    },

    extendEmailTime: async (_, { email }) => {
      const id = email.split('@')[0];
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Extend by 24 hours

      const tempEmail = await prisma.tempEmail.update({
        where: { id },
        data: { expiresAt },
        include: { messages: true }
      });

      return tempEmail;
    },

    sendTestEmail: async (_, { to, subject, content }) => {
      try {
        const response = await fetch('http://localhost:3000/api/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to, subject, content })
        });
        return response.ok;
      } catch (error) {
        console.error('Error sending test email:', error);
        return false;
      }
    }
  },

  Subscription: {
    newMessage: {
      subscribe: (_, { email }) => {
        const id = email.split('@')[0];
        return pubsub.asyncIterator(`NEW_MESSAGE_${id}`);
      }
    }
  }
}; 