import React from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

// Global app wrapper for Next.js
function AdminPortalApp({ Component, pageProps }: AppProps) {
  return (
    <div className="font-sans">
      <Component {...pageProps} />
    </div>
  );
}

export default AdminPortalApp; 