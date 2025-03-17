import { SMTPServer } from 'smtp-server';
import type { SMTPServerDataStream, SMTPServerSession } from 'smtp-server';
import { simpleParser } from 'mailparser';
import type { Attachment, AddressObject } from 'mailparser';
import nodeFetch from 'node-fetch';

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3000/api/receive-email';

const server = new SMTPServer({
  secure: false,
  authOptional: true,
  disabledCommands: ['STARTTLS'],
  
  async onData(stream: SMTPServerDataStream, session: SMTPServerSession, callback: (err?: Error) => void) {
    try {
      // Parse the incoming email
      const parsed = await simpleParser(stream);
      
      // Extract relevant information
      const toAddress = Array.isArray(parsed.to) ? parsed.to[0] : parsed.to;
      const fromAddress = Array.isArray(parsed.from) ? parsed.from[0] : parsed.from;
      
      const emailData = {
        to: toAddress?.value[0]?.address || '',
        from: fromAddress?.value[0]?.address || 'unknown@example.com',
        subject: parsed.subject || '(No Subject)',
        text: parsed.text || '',
        html: parsed.html || null,
        attachments: parsed.attachments?.map((attachment: Attachment) => ({
          filename: attachment.filename,
          contentType: attachment.contentType,
          size: attachment.size,
          content: attachment.content.toString('base64')
        })) || []
      };

      // Forward to our API
      const response = await nodeFetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API responded with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      callback();
    } catch (error) {
      console.error('Error processing email:', error);
      callback(new Error('Error processing email'));
    }
  }
});

const PORT = parseInt(process.env.SMTP_PORT || '2525', 10);
const HOST = process.env.SMTP_HOST || '0.0.0.0';

// Use correct types for server.listen
server.listen(PORT, () => {
  console.log(`SMTP Server running at ${HOST}:${PORT}`);
}); 