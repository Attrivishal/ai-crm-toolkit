import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './components/providers/theme-provider';
import { ErrorBoundary } from './components/providers/error-boundary';
import App from './App';
import './index.css';

// Create a client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider defaultTheme="light" storageKey="salesmind-theme">
            <AuthProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                  success: {
                    icon: '✅',
                    style: {
                      border: '1px solid hsl(142 76% 36%)',
                    },
                  },
                  error: {
                    icon: '❌',
                    style: {
                      border: '1px solid hsl(0 84% 60%)',
                    },
                  },
                }}
              />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
        {import.meta.env.DEV && <ReactQueryDevtools />}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);