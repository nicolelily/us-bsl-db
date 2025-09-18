import React from 'react';
import { useWelcomeFlow } from '@/hooks/useWelcomeFlow';

interface WelcomeFlowProviderProps {
  children: React.ReactNode;
}

export function WelcomeFlowProvider({ children }: WelcomeFlowProviderProps) {
  // This component automatically triggers the welcome flow when appropriate
  useWelcomeFlow();
  
  return <>{children}</>;
}