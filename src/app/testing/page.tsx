'use client';

import { useState, useEffect } from 'react';
import { EnvelopeIcon, ArrowPathIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  html?: string;
  receivedAt: string;
}

export default function Testing() {
  const [email, setEmail] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emailStatus, setEmailStatus] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const [testEmailForm, setTestEmailForm] = useState({ subject: '', content: '' });
  const [sendingTest, setSendingTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const checkEmailStatus = async (email: string) => {
    if (!email) return;
    setEmailStatus('checking');
    try {
      const response = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      if (response.ok) {
        setEmailStatus('valid');
        if (data.expiresAt) {
          updateTimeLeft(new Date(data.expiresAt));
        }
      } else {
        setEmailStatus('invalid');
      }
    } catch (error) {
      console.error('Error checking email status:', error);
      setEmailStatus('invalid');
    }
  };

  const updateTimeLeft = (expiresAt: Date) => {
    const now = new Date();
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    if (timeLeftMs <= 0) {
      setTimeLeft('Expired');
      setEmailStatus('invalid');
      return;
    }
    
    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
    setTimeLeft(`${hours}h ${minutes}m`);
  };

  const extendEmailTime = async () => {
    if (!email) return;
    try {
      const response = await fetch('/api/extend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        const data = await response.json();
        updateTimeLeft(new Date(data.expiresAt));
      }
    } catch (error) {
      console.error('Error extending email time:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!email || !testEmailForm.subject || !testEmailForm.content) return;
    setSendingTest(true);
    try {
      const response = await fetch('/api/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: testEmailForm.subject,
          content: testEmailForm.content
        })
      });
      if (response.ok) {
        setTestEmailForm({ subject: '', content: '' });
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending test email:', error);
    }
    setSendingTest(false);
  };

  const generateEmail = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST'
      });
      const data = await response.json();
      setEmail(data.email);
      setMessages([]);
      checkEmailStatus(data.email);
    } catch (error) {
      console.error('Error generating email:', error);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (!email) return;
    try {
      const response = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (email) {
      const interval = setInterval(fetchMessages, 10000);
      return () => clearInterval(interval);
    }
  }, [email]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/50 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                <span>Back</span>
              </Link>
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-xl font-semibold">Testing Interface</h1>
            </div>
            <button
              onClick={generateEmail}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-white transition-all duration-200 flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>New Email</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Info & Test Form */}
          <div className="space-y-8">
            {/* Email Info */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Email Address</h2>
              {email ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-white/90">{email}</span>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 relative"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}>
                        Copied!
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400">{timeLeft}</span>
                      </div>
                      <button
                        onClick={extendEmailTime}
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                      >
                        + 24h
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {emailStatus === 'checking' && (
                        <span className="flex items-center text-yellow-500">
                          <div className="animate-spin h-4 w-4 border-2 border-yellow-500 border-t-transparent rounded-full mr-2"></div>
                          Checking...
                        </span>
                      )}
                      {emailStatus === 'valid' && (
                        <span className="flex items-center text-green-400">
                          <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
                          Active
                        </span>
                      )}
                      {emailStatus === 'invalid' && (
                        <span className="flex items-center text-red-400">
                          <div className="w-2 h-2 rounded-full bg-red-400 mr-2"></div>
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No temporary email generated</div>
              )}
            </div>

            {/* Test Email Form */}
            {email && emailStatus === 'valid' && (
              <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
                <h2 className="text-lg font-semibold mb-4">Send Test Email</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-400">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={testEmailForm.subject}
                      onChange={(e) => setTestEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="mt-1 block w-full bg-white/5 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter email subject..."
                    />
                  </div>
                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-400">
                      Content
                    </label>
                    <textarea
                      id="content"
                      value={testEmailForm.content}
                      onChange={(e) => setTestEmailForm(prev => ({ ...prev, content: e.target.value }))}
                      rows={4}
                      className="mt-1 block w-full bg-white/5 border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Type your message here..."
                    />
                  </div>
                  <button
                    onClick={sendTestEmail}
                    disabled={sendingTest || !testEmailForm.subject || !testEmailForm.content}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium text-white transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {sendingTest ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <EnvelopeIcon className="h-4 w-4" />
                        <span>Send Test Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold">Messages</h2>
              <button
                onClick={fetchMessages}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="divide-y divide-white/10">
              {(!messages || messages.length === 0) ? (
                <div className="p-8 text-center">
                  <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-600" />
                  <p className="mt-4 text-gray-400">No messages yet</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className="p-4 hover:bg-white/10 cursor-pointer transition-colors duration-200"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white/90">{message.from}</p>
                        <p className="text-sm text-gray-400 mt-1">{message.subject}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.receivedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-400 mt-1">From: {selectedMessage.from}</p>
                </div>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-lg p-2 text-gray-400 hover:text-gray-300 hover:bg-white/10 transition-colors duration-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6 prose prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedMessage.html || selectedMessage.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 