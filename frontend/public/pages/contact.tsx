'use client';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <>
      <Head><title>Contact Support - PFM Community</title></Head>
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="text-2xl font-bold text-blue-600">PFM Community</div>
          </div>
        </header>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Contact Support</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <Mail className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Email Support</h3>
              <p className="text-gray-600 mb-4">Get help with your questions via email</p>
              <a href="mailto:support@pfm-community.app" className="text-blue-600 hover:text-blue-700 font-semibold">
                support@pfm-community.app
              </a>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <MessageCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Live Chat</h3>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <div className="text-yellow-700 text-sm">Coming soon in development</div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
