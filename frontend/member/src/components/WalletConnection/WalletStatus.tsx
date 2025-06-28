'use client';

import React from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, SignalIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../../hooks/useWallet';
import clsx from 'clsx';

interface WalletStatusProps {
  className?: string;
  showNetwork?: boolean;
  showAddress?: boolean;
  variant?: 'full' | 'minimal' | 'badge';
}

export const WalletStatus: React.FC<WalletStatusProps> = ({
  className,
  showNetwork = true,
  showAddress = true,
  variant = 'full'
}) => {
  const {
    connected,
    connecting,
    disconnecting,
    walletName,
    shortAddress,
    networkDisplayName,
    error
  } = useWallet();

  if (variant === 'badge') {
    return (
      <div className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        connected 
          ? 'bg-green-100 text-green-800' 
          : connecting 
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-gray-100 text-gray-800',
        className
      )}>
        <div className={clsx(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          connected 
            ? 'bg-green-400' 
            : connecting 
            ? 'bg-yellow-400 animate-pulse'
            : 'bg-gray-400'
        )} />
        {connected ? 'Connected' : connecting ? 'Connecting' : 'Disconnected'}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={clsx('flex items-center space-x-2 text-sm', className)}>
        {connected ? (
          <CheckCircleIcon className="h-4 w-4 text-green-500" />
        ) : error ? (
          <ExclamationCircleIcon className="h-4 w-4 text-red-500" />
        ) : (
          <div className="h-4 w-4 bg-gray-300 rounded-full" />
        )}
        <span className={clsx(
          'font-medium',
          connected ? 'text-green-600' : error ? 'text-red-600' : 'text-gray-600'
        )}>
          {connected ? `${walletName} Connected` : error ? 'Connection Failed' : 'Not Connected'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx(
      'bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'flex items-center justify-center w-8 h-8 rounded-full',
            connected 
              ? 'bg-green-100' 
              : connecting 
              ? 'bg-yellow-100'
              : error 
              ? 'bg-red-100'
              : 'bg-gray-100'
          )}>
            {connected ? (
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            ) : connecting ? (
              <div className="animate-spin h-4 w-4">
                <div className="h-full w-full border-2 border-yellow-600 border-t-transparent rounded-full" />
              </div>
            ) : error ? (
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
            ) : (
              <div className="h-3 w-3 bg-gray-400 rounded-full" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h3 className={clsx(
                'text-sm font-medium',
                connected ? 'text-green-600' : error ? 'text-red-600' : 'text-gray-600'
              )}>
                {connected ? 'Wallet Connected' : 
                 connecting ? 'Connecting...' :
                 disconnecting ? 'Disconnecting...' :
                 error ? 'Connection Failed' : 'Not Connected'}
              </h3>
              
              {connected && walletName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {walletName}
                </span>
              )}
            </div>

            {showAddress && connected && shortAddress && (
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {shortAddress}
              </p>
            )}

            {error && (
              <p className="text-xs text-red-600 mt-0.5">
                {error.message}
              </p>
            )}
          </div>
        </div>

        {showNetwork && (
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <SignalIcon className="h-3 w-3" />
            <span>{networkDisplayName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletStatus; 