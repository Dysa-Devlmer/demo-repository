"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Root Page - Redirects to login
 *
 * The root path (/) redirects users to the login page.
 * After successful authentication, users will be redirected to their appropriate dashboard.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('auth_token');
    const demoToken = localStorage.getItem('demo_token');
    const isDemoMode = localStorage.getItem('demo_mode') === 'true';
    const isAuthenticated = !!authToken || (isDemoMode && !!demoToken);

    if (isAuthenticated) {
      // If already authenticated, redirect to dashboard (main overview)
      router.replace('/dashboard');
    } else {
      // If not authenticated, redirect to login
      router.replace('/login');
    }
  }, [router]);

  // Show professional loading screen while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="text-center space-y-6">
        {/* Animated Logo/Spinner */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent animate-spin"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ChatBotDysa
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
            Cargando panel administrativo...
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="w-64 h-1 mx-auto bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-500 animate-[loading_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 50%;
            margin-left: 25%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
