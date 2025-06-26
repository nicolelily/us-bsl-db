import { supabase } from '@/integrations/supabase/client';

export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  sanitizeString: (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
  },
  
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
};

export const securityChecks = {
  isAuthenticated: (): boolean => {
    return Boolean(supabase.auth.session);
  },
  
  hasValidSession: async (): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return Boolean(session);
    } catch {
      return false;
    }
  },
  
  checkRateLimiting: (key: string, limit: number = 10, window: number = 60000): boolean => {
    const now = Date.now();
    const windowKey = `${key}_${Math.floor(now / window)}`;
    
    const attempts = parseInt(localStorage.getItem(windowKey) || '0');
    
    if (attempts >= limit) {
      return false;
    }
    
    localStorage.setItem(windowKey, (attempts + 1).toString());
    return true;
  }
};

export const auditLog = {
  logAction: async (action: string, details?: any) => {
    try {
      console.log(`[AUDIT] ${action}:`, details);
      
      // In a production environment, you might want to send this to a logging service
      // For now, we'll just log to console and potentially store in local audit log
      
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details,
        user: (await supabase.auth.getUser()).data.user?.id
      };
      
      // Store in session storage for debugging (in production, send to server)
      const existingLogs = JSON.parse(sessionStorage.getItem('audit_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      sessionStorage.setItem('audit_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  }
};
