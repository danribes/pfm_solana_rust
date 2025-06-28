'use client';

import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import { useWallet } from '../../hooks/useWallet';
import clsx from 'clsx';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  title = 'Connect Wallet',
  description = 'Select a wallet to connect to the application.'
}) => {
  const {
    installedWallets,
    availableWallets,
    connecting,
    connect,
    error,
    getWalletDownloadUrl
  } = useWallet();

  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const handleWalletSelect = async (walletName: string) => {
    try {
      setSelectedWallet(walletName);
      await connect(walletName);
      onClose();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setSelectedWallet(null);
    }
  };

  const handleInstallWallet = (walletName: string) => {
    const downloadUrl = getWalletDownloadUrl(walletName);
    if (downloadUrl) {
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const WalletItem: React.FC<{
    wallet: any;
    installed: boolean;
    onSelect?: () => void;
    onInstall?: () => void;
  }> = ({ wallet, installed, onSelect, onInstall }) => {
    const isConnecting = connecting && selectedWallet === wallet.name;

    return (
      <div
        className={clsx(
          'flex items-center justify-between p-4 rounded-lg border transition-colors',
          installed
            ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
            : 'border-gray-100 bg-gray-50 cursor-default'
        )}
        onClick={installed ? onSelect : undefined}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <img
              src={wallet.icon}
              alt={`${wallet.name} icon`}
              className="h-8 w-8 rounded-full"
              onError={(e) => {
                e.currentTarget.src = '/wallets/default.svg';
              }}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              {wallet.name}
            </h3>
            <p className="text-xs text-gray-500">
              {installed ? 'Installed' : 'Not installed'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {installed ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
              }}
              disabled={isConnecting}
              className={clsx(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                isConnecting
                  ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              )}
            >
              {isConnecting ? (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin h-3 w-3">
                    <div className="h-full w-full border border-current border-t-transparent rounded-full" />
                  </div>
                  <span>Connecting</span>
                </div>
              ) : (
                'Connect'
              )}
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInstall?.();
              }}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              <span>Install</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {description && (
                  <p className="text-sm text-gray-500 mb-6">
                    {description}
                  </p>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                      <p className="text-sm text-red-800">{error.message}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {installedWallets.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Installed Wallets
                      </h4>
                      <div className="space-y-2">
                        {installedWallets.map((wallet) => (
                          <WalletItem
                            key={wallet.name}
                            wallet={wallet}
                            installed={true}
                            onSelect={() => handleWalletSelect(wallet.name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {availableWallets.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Available Wallets
                      </h4>
                      <div className="space-y-2">
                        {availableWallets.map((wallet) => (
                          <WalletItem
                            key={wallet.name}
                            wallet={wallet}
                            installed={false}
                            onInstall={() => handleInstallWallet(wallet.name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {installedWallets.length === 0 && availableWallets.length === 0 && (
                    <div className="text-center py-8">
                      <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No wallets detected
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Please install a supported wallet to continue.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default WalletModal; 