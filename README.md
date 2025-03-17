# 📧 KrypticMail

A modern, secure temporary email service built with Next.js and TypeScript. Generate disposable email addresses instantly and protect your privacy with self-destructing inboxes.

![KrypticMail Screenshot](public/screenshot.png)

## ✨ Features

- **🔒 Secure & Private**: Temporary email addresses with automatic deletion
- **⚡ Instant Access**: No registration required
- **🎯 Easy to Use**: Clean, modern interface
- **📬 Real-time Updates**: Instant email notifications
- **⏱️ Flexible Duration**: 24-hour validity with extension option
- **🔍 Markdown Support**: Full markdown rendering for emails
- **🌐 SMTP Integration**: Built-in SMTP server for testing

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Node.js, SMTP Server, GraphQL API
- **Database**: PostgreSQL with Prisma ORM
- **API**: GraphQL with Apollo Client
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Heroicons

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/AKhilRaghav0/krypticMail.git
cd krypticmail
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/krypticmail"
SMTP_HOST="0.0.0.0"
SMTP_PORT="2525"
DOMAIN="your-domain.com"
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

## 💻 Development

1. Start the development server:
```bash
npm run dev
```

2. In a separate terminal, start the SMTP server:
```bash
npm run email-server
```

The application will be available at:
- Web Interface: http://localhost:3000
- SMTP Server: localhost:2525

## 📧 Testing Emails

You can test sending emails in several ways:

1. **Using the Web Interface**:
   - Generate a temporary email
   - Use the built-in test form

2. **Using Postman**:
   ```http
   POST http://localhost:3000/api/send-test
   Content-Type: application/json

   {
     "to": "your-temp-email@krypticbit.io",
     "subject": "Test Email",
     "content": "Hello from KrypticMail!"
   }
   ```

3. **Using Telnet**:
   ```bash
   telnet localhost 2525
   ```

## 🌟 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://heroicons.com/)
- [Prisma](https://www.prisma.io/)

## 📡 GraphQL API

KrypticMail uses GraphQL for efficient data fetching and real-time updates. The GraphQL endpoint is available at `/api/graphql`.

### Example Queries

1. **Generate Email**
```graphql
mutation {
  generateEmail {
    email
    expiresAt
  }
}
```

2. **Check Email Status**
```graphql
query {
  tempEmail(email: "your-email@krypticbit.io") {
    email
    expiresAt
    messages {
      subject
      from
      content
    }
  }
}
```

3. **Subscribe to New Messages**
```graphql
subscription {
  newMessage(email: "your-email@krypticbit.io") {
    from
    subject
    content
    receivedAt
  }
}
```

### Using GraphQL in Development

1. Access GraphQL Playground at `http://localhost:3000/api/graphql`
2. Use Apollo Client in your components:
```typescript
import { useQuery, gql } from '@apollo/client';

const GET_MESSAGES = gql`
  query GetMessages($email: String!) {
    messages(email: $email) {
      from
      subject
      content
    }
  }
`;

function Messages({ email }) {
  const { loading, data } = useQuery(GET_MESSAGES, {
    variables: { email }
  });

  if (loading) return <div>Loading...</div>;
  return (
    <div>
      {data.messages.map(message => (
        <MessageCard key={message.id} message={message} />
      ))}
    </div>
  );
}
```
