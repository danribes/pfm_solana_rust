import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA meta tags */}
        <meta name="theme-color" content="#3B82F6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PFM Member" />
        
        {/* Container-aware meta tags */}
        <meta name="container-mode" content={process.env.NEXT_PUBLIC_CONTAINER_MODE || 'false'} />
        <meta name="service-type" content="member-portal" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 