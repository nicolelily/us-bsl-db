
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as Sentry from "@sentry/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import MapView from "./pages/MapView";
import Stats from "./pages/Stats";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error: any) => {
        // Capture query errors in Sentry with context
        Sentry.captureException(error, {
          level: 'error',
          tags: { type: 'react-query-error' },
          extra: {
            errorType: 'query',
            message: error?.message || 'Unknown query error',
          },
        });
      },
    },
    mutations: {
      onError: (error: any) => {
        // Capture mutation errors in Sentry with context
        Sentry.captureException(error, {
          level: 'error',
          tags: { type: 'react-query-mutation' },
          extra: {
            errorType: 'mutation',
            message: error?.message || 'Unknown mutation error',
          },
        });
      },
    },
  },
});

// Create Sentry-wrapped Router components for better error tracking
const SentryRoutes = Sentry.withSentryRouting(Routes);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics />
        <SpeedInsights />
        <BrowserRouter>
          <SentryRoutes>
            <Route path="/" element={<Index />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </SentryRoutes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
