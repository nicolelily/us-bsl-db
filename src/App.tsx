
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import * as Sentry from "@sentry/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { WelcomeFlowProvider } from "@/components/WelcomeFlowProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import MapView from "./pages/MapView";
import Stats from "./pages/Stats";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Submit from "./pages/Submit";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import SubmissionManagement from "./pages/SubmissionManagement";
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
        <AuthProvider>
          <WelcomeFlowProvider>
            <Toaster />
            <Sonner />
            <Analytics />
            <SpeedInsights />
            <BrowserRouter>
            <SentryRoutes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Index />} />
              <Route path="/map" element={<MapView />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/submissions" element={<SubmissionManagement />} />
              <Route path="/submissions/:submissionId" element={<SubmissionManagement />} />
              <Route path="/submissions/:submissionId/edit" element={<SubmissionManagement />} />
              <Route path="*" element={<NotFound />} />
            </SentryRoutes>
          </BrowserRouter>
        </WelcomeFlowProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
