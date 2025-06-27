'use client';

import React from 'react';
import { WalletIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../../hooks/useWallet';
import { formatWalletAddress } from '../../utils/wallet';
import clsx from 'clsx';

interface WalletButtonProps {
  className?: string;
  showDropdown?: boolean;
  showBalance?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const WalletButton: React.FC<WalletButtonProps> = ({
  className,
  showDropdown = true,
  showBalance = false,
  variant = 'primary',
  size = 'md',
  onClick
}) => {
  const {
    connected,
    connecting,
    publicKey,
    walletName,
    connect,
    shortAddress
  } = useWallet();

  const handleClick = async () => {
    if (onClick) {
      onClick();
      return;
    }

    if (!connected && !connecting) {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect wallet:', error);
      }
    }
  };

  const baseClasses = clsx(
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    {
      // Size variants
      'px-3 py-2 text-sm': size === 'sm',
      'px-4 py-2.5 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
      
      // Style variants - connected state
      'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500': 
        connected && variant === 'primary',
      'bg-green-100 text-green-800 hover:bg-green-200 focus:ring-green-500 border border-green-300': 
        connected && variant === 'secondary',
      'bg-transparent text-green-600 border border-green-600 hover:bg-green-50 focus:ring-green-500': 
        connected && variant === 'outline',
      
      // Style variants - disconnected state
      'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400': 
        !connected && variant === 'primary',
      'bg-blue-100 text-blue-800 hover:bg-blue-200 focus:ring-blue-500 border border-blue-300 disabled:bg-blue-50': 
        !connected && variant === 'secondary',
      'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-300 disabled:text-blue-400': 
        !connected && variant === 'outline',
      
      // Disabled state
      'cursor-not-allowed opacity-60': connecting,
      'cursor-pointer': !connecting
    }
  );

  const buttonContent = () => {
    if (connecting) {
      return (
        <>
          <div className="animate-spin h-4 w-4 mr-2">
            <div className="h-full w-full border-2 border-current border-t-transparent rounded-full" />
          </div>
          Connecting...
        </>
      );
    }

    if (connected && publicKey) {
      return (
        <>
          <WalletIcon className="h-4 w-4 mr-2" />
          <span className="flex items-center">
            {walletName && (
              <span className="mr-2 font-medium">{walletName}</span>
            )}
            <span className="font-mono text-xs opacity-80">
              {shortAddress}
            </span>
          </span>
          {showDropdown && (
            <ChevronDownIcon className="h-4 w-4 ml-2" />
          )}
        </>
      );
    }

    return (
      <>
        <WalletIcon className="h-4 w-4 mr-2" />
        Connect Wallet
      </>
    );
  };

  return (
    <button
      className={clsx(baseClasses, className)}
      onClick={handleClick}
      disabled={connecting}
      type="button"
    >
      {buttonContent()}
    </button>
  );
};

export default WalletButton; 