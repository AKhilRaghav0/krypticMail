'use client';

import { useState, useEffect } from 'react';
import { ClipboardIcon, ArrowPathIcon, EnvelopeIcon, ShieldCheckIcon, ClockIcon, LockClosedIcon, BoltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  from: string;
  subject: string;
  content: string;
  html?: string;
  receivedAt: string;
}

export default function Home() {
  const [email, setEmail] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emailStatus, setEmailStatus] = useState<'valid' | 'invalid' | 'checking' | null>(null);
  const [testEmailForm, setTestEmailForm] = useState({ subject: '', content: '' });
  const [sendingTest, setSendingTest] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [nextRefresh, setNextRefresh] = useState<number>(0);

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
      if (response.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setNextRefresh(10);
      } else {
        console.error('Invalid messages format:', data);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (email && emailStatus === 'valid') {
      fetchMessages();
      const interval = setInterval(() => {
        setNextRefresh(prev => {
          if (prev <= 0) {
            fetchMessages();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [email, emailStatus]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0118] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                KrypticMail
              </span>
            </div>
            <Link
              href="/testing"
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              Testing Interface →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 pb-2">
              Secure Temporary Email
            </h1>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Generate disposable email addresses instantly. Protect your privacy with self-destructing inboxes.
            </p>
          </div>

          {/* Email Generation Box */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      readOnly
                      value={email}
                      placeholder="No temporary email generated"
                      className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={generateEmail}
                    disabled={loading}
                    className="flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        <span>Loading...</span>
                      </>
                    ) : (
                      <>
                        <ArrowPathIcon className="h-5 w-5 mr-2" />
                        <span>New Email</span>
                      </>
                    )}
                  </button>
                </div>
                
                {email && (
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-4">
                      {emailStatus === 'checking' && (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          <span className="text-sm text-gray-400">Checking status...</span>
                        </div>
                      )}
                      {emailStatus === 'valid' && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            <span className="text-sm text-green-400">Active</span>
                          </div>
                          <span className="text-sm text-gray-400">•</span>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <ClockIcon className="h-4 w-4" />
                            <span>{timeLeft}</span>
                          </div>
                          <button
                            onClick={extendEmailTime}
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
                          >
                            + 24h
                          </button>
                        </div>
                      )}
                      {emailStatus === 'invalid' && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-red-400"></div>
                          <span className="text-sm text-red-400">Inactive</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors duration-200 relative"
                    >
                      <ClipboardIcon className="h-5 w-5 text-gray-400" />
                      <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}>
                        Copied!
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Feature Blocks */}
          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <LockClosedIcon className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-400">
                Your temporary email addresses are encrypted and automatically deleted after expiration.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <BoltIcon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-400">
                Generate disposable email addresses instantly with no registration required.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="bg-green-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-gray-400">
                Simple interface for managing your temporary emails and messages.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/10">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-400 mt-1">From: {selectedMessage.from}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Received: {new Date(selectedMessage.receivedAt).toLocaleString()}
                  </p>
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
                <div className="bg-black/20 rounded-lg p-6">
                  <ReactMarkdown 
                    children={selectedMessage.content}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="text-gray-300 whitespace-pre-wrap" {...props} />
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages Section */}
      {email && emailStatus === 'valid' && (
        <div className="mt-12 max-w-3xl mx-auto bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-900/30 w-10 h-10 rounded-lg flex items-center justify-center">
                <EnvelopeIcon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">Inbox</h3>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Refreshing in {nextRefresh}s
              </span>
              <button
                onClick={() => {
                  fetchMessages();
                  setNextRefresh(10);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200 group"
              >
                <ArrowPathIcon className="h-5 w-5 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-lg p-4 transition-all duration-200 cursor-pointer border border-white/5 hover:border-white/10"
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-white/90 truncate">{message.from}</p>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(message.receivedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 truncate">{message.subject}</p>
                    <div className="text-xs text-gray-500 mt-2 line-clamp-2 prose-sm">
                      <ReactMarkdown 
                        children={message.content}
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="prose-sm prose-invert" {...props} />
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                  <EnvelopeIcon className="h-8 w-8 text-gray-600" />
                </div>
                <p className="text-gray-500 text-sm">
                  Your inbox is empty. Messages will appear here when received.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
