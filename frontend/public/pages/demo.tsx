'use client';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function DemoPage() {
  return (
    <>
      <Head><title>Schedule Demo - PFM Community</title></Head>
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
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Schedule Your Demo</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-800 font-semibold mb-2">Development Notice</p>
            <p className="text-yellow-700">Demo scheduling is being set up. Please contact us directly.</p>
            <a href="mailto:demo@pfm-community.app" className="inline-block mt-4 px-4 py-2 bg-yellow-200 text-yellow-800 rounded-lg hover:bg-yellow-300">
              Email for Demo
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
