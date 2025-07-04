import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
// Temporarily comment out shared imports
// import { AuthProvider } from '../../shared/contexts/AuthContext';
// import { WalletConnectionProvider } from '../../shared/components/WalletConnection/WalletConnectionProvider';
// import { NotificationProvider } from '../../shared/contexts/NotificationContext';
// import { SessionProvider } from '../../shared/contexts/SessionContext';
// import { OfflineProvider } from '../../shared/contexts/OfflineContext';
// import { AnalyticsProvider } from '../../shared/contexts/AnalyticsContext';
import '../styles/globals.css';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/voting',
  '/communities',
  '/analytics'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/help',
  '/',
  '/onboarding'
];

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Route protection logic
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Check if route requires authentication
      const isProtectedRoute = protectedRoutes.some(route => 
        url.startsWith(route)
      );
      
      const isPublicRoute = publicRoutes.some(route => 
        url === route || url.startsWith(route)
      );

      // Redirect to login for protected routes without authentication
      // This will be handled by the AuthContext, but we can add additional logic here
      if (isProtectedRoute && !isPublicRoute) {
        // AuthContext will handle the actual redirect
        console.log('Accessing protected route:', url);
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class">
        {/* Temporarily comment out all shared providers */}
        {/* <AuthProvider>
          <WalletConnectionProvider>
            <NotificationProvider>
              <SessionProvider>
                <OfflineProvider>
                  <AnalyticsProvider> */}
                    <Component {...pageProps} />
                    <Toaster position="bottom-right" />
                  {/* </AnalyticsProvider>
                </OfflineProvider>
              </SessionProvider>
            </NotificationProvider>
          </WalletConnectionProvider>
        </AuthProvider> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default MyApp; 