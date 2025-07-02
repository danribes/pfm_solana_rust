'use client';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Key } from 'lucide-react';

export default function SecurityPage() {
  return (
    <>
      <Head><title>Security - PFM Community</title></Head>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Blockchain Security</h1>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Immutable Records</h3>
              <p className="text-gray-600">Votes are permanently recorded on the blockchain</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Lock className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600">Military-grade encryption protects all data</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Key className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Cryptographic Verification</h3>
              <p className="text-gray-600">Each vote is cryptographically signed and verified</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Security Features</h2>
            <ul className="space-y-3 text-gray-700">
              <li>✓ SOC 2 Type II Certified</li>
              <li>✓ GDPR Compliant</li>
              <li>✓ Multi-factor Authentication</li>
              <li>✓ Regular Security Audits</li>
              <li>✓ Zero-knowledge Proofs</li>
              <li>✓ Transparent Audit Trails</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
