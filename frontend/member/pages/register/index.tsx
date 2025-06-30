'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import RegistrationWizard from '../../components/Registration/RegistrationWizard';
import { UserProfile } from '../../types/profile';

const RegisterPage: React.FC = () => {
  const router = useRouter();

  const handleRegistrationComplete = (profile: UserProfile) => {
    console.log('Registration completed:', profile);
    
    // Show success message and redirect to profile
    setTimeout(() => {
      router.push('/member/profile');
    }, 2000);
  };

  const handleRegistrationCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <RegistrationWizard
        onComplete={handleRegistrationComplete}
        onCancel={handleRegistrationCancel}
      />
    </div>
  );
};

export default RegisterPage;
