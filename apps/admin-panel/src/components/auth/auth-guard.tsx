"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Check for auth token in localStorage
      const authToken = localStorage.getItem('auth_token');
      const demoToken = localStorage.getItem('demo_token');
      const isDemoMode = localStorage.getItem('demo_mode') === 'true';

      // Usuario autenticado si tiene token real O está en modo demo con demo_token
      const isAuthenticated = !!authToken || (isDemoMode && !!demoToken);

      if (isAuthenticated) {
        const mode = isDemoMode ? 'DEMO' : 'PRODUCCIÓN';
        console.log(`🔐 Usuario autenticado en modo ${mode}`);
        setIsAuthenticated(true);
      } else {
        // No auth token, redirect to login
        console.log('❌ No autenticado - redirigiendo a login');
        router.push('/login');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-dysa-purple"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}