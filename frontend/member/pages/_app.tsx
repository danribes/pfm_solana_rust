import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AuthProvider } from '../../shared/contexts/AuthContext';
import { WalletConnectionProvider } from '../../shared/components/WalletConnection/WalletConnectionProvider';
import { NotificationProvider } from '../../shared/contexts/NotificationContext';
import { SessionProvider } from '../../shared/contexts/SessionContext';
import { OfflineProvider } from '../../shared/contexts/OfflineContext';
import { AnalyticsProvider } from '../../shared/contexts/AnalyticsContext';
import '../styles/globals.css';

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
    <AnalyticsProvider>
      <OfflineProvider>
        <NotificationProvider>
          <SessionProvider>
            <WalletConnectionProvider>
              <AuthProvider>
                <Component {...pageProps} />
              </AuthProvider>
            </WalletConnectionProvider>
          </SessionProvider>
        </NotificationProvider>
      </OfflineProvider>
    </AnalyticsProvider>
  );
}

export default MyApp; 