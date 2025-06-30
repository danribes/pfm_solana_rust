// User Verification Badge Component
import React from 'react';

export enum VerificationLevel {
  UNVERIFIED = 'unverified',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  IDENTITY_VERIFIED = 'identity_verified',
  FULLY_VERIFIED = 'fully_verified'
}

interface UserVerificationBadgeProps {
  level: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const UserVerificationBadge: React.FC<UserVerificationBadgeProps> = ({
  level,
  size = 'md',
  showText = true
}) => {
  const getBadgeConfig = (level: VerificationLevel) => {
    const configs = {
      [VerificationLevel.UNVERIFIED]: {
        color: 'bg-gray-100 text-gray-800',
        icon: '❌',
        text: 'Unverified'
      },
      [VerificationLevel.EMAIL_VERIFIED]: {
        color: 'bg-blue-100 text-blue-800',
        icon: '📧',
        text: 'Email Verified'
      },
      [VerificationLevel.PHONE_VERIFIED]: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: '📱',
        text: 'Phone Verified'
      },
      [VerificationLevel.IDENTITY_VERIFIED]: {
        color: 'bg-green-100 text-green-800',
        icon: '🆔',
        text: 'ID Verified'
      },
      [VerificationLevel.FULLY_VERIFIED]: {
        color: 'bg-green-100 text-green-800',
        icon: '✅',
        text: 'Fully Verified'
      }
    };
    return configs[level];
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = getBadgeConfig(level);

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${config.color} ${sizeClasses[size]}`}>
      <span className="mr-1">{config.icon}</span>
      {showText && <span>{config.text}</span>}
    </span>
  );
};
