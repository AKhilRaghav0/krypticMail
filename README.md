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
- **Backend**: Node.js, SMTP Server
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with custom animations
- **Icons**: Heroicons

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/krypticmail.git
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
