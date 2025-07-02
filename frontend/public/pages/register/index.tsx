// Task 7.1.3: Public User Registration & Wallet Connection
// Main registration page

import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import RegistrationFlow from '@/components/Registration/RegistrationFlow';
import { UserRegistrationData } from '@/types/registration';

const RegisterPage: NextPage = () => {
  const router = useRouter();

  const handleRegistrationComplete = (userData: UserRegistrationData) => {
    // Redirect to dashboard after successful registration
    router.push('/dashboard');
  };

  const handleRegistrationCancel = () => {
    // Redirect back to home page
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Register - PFM Platform</title>
        <meta
          name="description"
          content="Join PFM Platform and participate in the future of participatory financial management. Create your account with secure wallet integration."
        />
        <meta name="keywords" content="registration, signup, account, wallet, blockchain, governance" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL}/register`} />
        
        {/* Open Graph */}
        <meta property="og:title" content="Register - PFM Platform" />
        <meta property="og:description" content="Join the future of participatory financial management" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}/register`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Register - PFM Platform" />
        <meta name="twitter:description" content="Join the future of participatory financial management" />
      </Head>

      <RegistrationFlow
        initialStep="entry"
        onComplete={handleRegistrationComplete}
        onCancel={handleRegistrationCancel}
        showProgress={true}
        allowSkipSteps={true}
      />
    </>
  );
};

export default RegisterPage; 