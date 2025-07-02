'use client';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, UserCheck } from 'lucide-react';

export default function MembersPage() {
  return (
    <>
      <Head><title>Member Management - PFM Community</title></Head>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Member Management</h1>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Users className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">User Authentication</h3>
              <p className="text-gray-600">Secure login and registration system</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <Shield className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">Control permissions by member roles</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg text-center">
              <UserCheck className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Identity Verification</h3>
              <p className="text-gray-600">Multi-factor authentication options</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
