import React from 'react';
import type { AppProps } from 'next/app';
import { WalletProvider } from '../../../shared/contexts/WalletContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
}

export default MyApp; 