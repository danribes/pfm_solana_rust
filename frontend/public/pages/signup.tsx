'use client';

import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Users, Shield, Zap } from 'lucide-react';

const SignupPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign Up - PFM Community Voting Platform</title>
        <meta name="description" content="Get started with secure blockchain voting for your community." />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                PFM Community
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Start Your <span className="bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Free Trial</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Join thousands of communities using secure blockchain voting. No setup fees, cancel anytime.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-12 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                <span className="text-yellow-800 font-semibold text-lg">Development Notice</span>
              </div>
              <p className="text-yellow-700">
                This is a development environment. The signup functionality is currently being built. 
                Please check back soon or contact our team for early access.
              </p>
              <div className="mt-4">
                <Link href="/" className="inline-flex items-center px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Homepage
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: <Shield className="h-8 w-8" />,
                  title: "Enterprise Security",
                  description: "Military-grade encryption with blockchain verification"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Easy Setup",
                  description: "Get your community voting in under 10 minutes"
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: "Instant Results",
                  description: "Real-time vote counting with transparent results"
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-8 border border-primary-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What's included in your free trial:</h3>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  "30-day free trial",
                  "Up to 100 members", 
                  "Unlimited votes",
                  "24/7 support",
                  "No setup fees",
                  "Cancel anytime"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default SignupPage; 