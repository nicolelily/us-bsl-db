# Sentry Setup Guide

This guide covers the setup and configuration of Sentry for error tracking and performance monitoring in the US BSL Database application.

## What's Been Implemented

### 1. Error Tracking
- Automatic capture of JavaScript errors and unhandled promise rejections
- React error boundaries with user-friendly fallback UI
- Error context with user information and session data
- Source map support for production debugging

### 2. Performance Monitoring
- Browser performance metrics (page load, navigation)
- React component render tracking
- API request monitoring
- Custom transaction tracking for critical operations

### 3. Session Replay
- Video-like reproduction of user sessions
- Captures 10% of normal sessions
- Captures 100% of sessions with errors
- Helps debug user-reported issues

### 4. Integration Points
- React Router integration for navigation tracking
- React Query error capture for API failures
- User context tracking via Supabase Auth
- Custom error boundaries for graceful degradation

## Setup Instructions

### Step 1: Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (5,000 errors/month)
3. Create a new project:
   - Platform: **React**
   - Project name: `us-bsl-db` (or your preference)

### Step 2: Get Your DSN

1. After creating the project, copy your **DSN** (Data Source Name)
   - It looks like: `https://[key]@[organization].ingest.sentry.io/[project-id]`
2. You can find it later in: **Settings → Projects → [Your Project] → Client Keys (DSN)**

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` if you haven't already:
   ```bash
   cp .env.example .env
   ```

2. Add your Sentry DSN to `.env`:
   ```env
   VITE_SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id
   ```

3. (Optional) Enable Sentry in development mode:
   ```env
   VITE_SENTRY_DEBUG=true
   ```

### Step 4: Configure Vercel Environment Variables

For production deployment on Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:
   - **Name:** `VITE_SENTRY_DSN`
   - **Value:** Your Sentry DSN
   - **Environments:** Production, Preview (optional)

### Step 5: Enable Source Maps (Recommended)

Source maps help Sentry show you the actual source code in error stack traces:

1. Install Sentry Vite plugin:
   ```bash
   yarn add -D @sentry/vite-plugin
   ```

2. Update `vite.config.ts`:
   ```typescript
   import { sentryVitePlugin } from "@sentry/vite-plugin";
   
   export default defineConfig({
     // ... existing config
     build: {
       sourcemap: true, // Enable source maps
     },
     plugins: [
       // ... existing plugins
       sentryVitePlugin({
         org: "your-sentry-org",
         project: "us-bsl-db",
         authToken: process.env.SENTRY_AUTH_TOKEN,
       }),
     ],
   });
   ```

3. Create a Sentry auth token:
   - Go to: **Settings → Account → API → Auth Tokens**
   - Create token with: `project:releases` scope
   - Add to Vercel: `SENTRY_AUTH_TOKEN`

## Configuration Options

### Sampling Rates

Current configuration (in `src/main.tsx`):

```typescript
{
  tracesSampleRate: 0.1,        // 10% of transactions (adjust for volume)
  replaysSessionSampleRate: 0.1, // 10% of normal sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
}
```

**For 1000 MAU:**
- Expected errors: ~50-200/month (well within free tier)
- Expected transactions: ~10,000/month (within free tier)
- Replays: ~100-300/month (within free tier)

### Adjusting for Scale

If you exceed free tier limits:

1. **Reduce traces sampling:**
   ```typescript
   tracesSampleRate: 0.05, // 5% instead of 10%
   ```

2. **Reduce replay sampling:**
   ```typescript
   replaysSessionSampleRate: 0.05, // 5% instead of 10%
   ```

3. **Filter events:**
   ```typescript
   beforeSend(event, hint) {
     // Don't send specific errors
     if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
       return null;
     }
     return event;
   }
   ```

## Features & Usage

### Custom Error Tracking

Use the `useSentryTracking` hook in your components:

```typescript
import { useSentryTracking } from '@/hooks/useSentryTracking';

function MyComponent() {
  const { captureException, trackAction } = useSentryTracking();
  
  const handleAction = async () => {
    try {
      trackAction('user_clicked_submit', { formType: 'legislation' });
      await submitForm();
    } catch (error) {
      captureException(error, { context: 'form_submission' });
    }
  };
}
```

### Performance Tracking

```typescript
const { startTransaction } = useSentryTracking();

const transaction = startTransaction('data-import', 'task');
try {
  await importData();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### User Context

User context is automatically set when users authenticate. You can add additional context:

```typescript
const { setContext, setTag } = useSentryTracking();

// Add custom context
setContext('submission', {
  municipalityId: '123',
  legislationType: 'ban',
});

// Add tags for filtering
setTag('feature', 'data-submission');
```

## Monitoring & Alerts

### Recommended Alert Rules

Set up alerts in Sentry dashboard:

1. **Error Rate Alert:**
   - Condition: Error rate > 5% over 1 hour
   - Action: Email notification

2. **New Issue Alert:**
   - Condition: New issue appears
   - Action: Email notification

3. **Performance Degradation:**
   - Condition: P95 response time > 3s
   - Action: Email notification

### Key Metrics to Monitor

In the Sentry dashboard, watch:

1. **Issues tab:**
   - New vs. recurring errors
   - Error frequency and impact
   - Affected users

2. **Performance tab:**
   - Page load times (LCP, FID, CLS)
   - API response times
   - Slow transactions

3. **Releases tab:**
   - New errors introduced in deployments
   - Performance regressions

## Testing

### Test Error Tracking

Add a temporary button to trigger a test error:

```typescript
<Button onClick={() => {
  throw new Error('Test Sentry error!');
}}>
  Test Sentry
</Button>
```

Click it and verify the error appears in Sentry within 1-2 minutes.

### Test Performance

Performance data appears automatically as users navigate your app.

## Troubleshooting

### Errors Not Appearing

1. Check DSN is set: `console.log(import.meta.env.VITE_SENTRY_DSN)`
2. Verify environment: Sentry disabled in dev by default
3. Check browser console for Sentry initialization messages
4. Review `beforeSend` filter logic

### Too Many Events

1. Lower sampling rates (see Configuration Options)
2. Filter common errors (e.g., browser extensions)
3. Use `ignoreErrors` option for known issues

### Source Maps Not Working

1. Verify `sourcemap: true` in `vite.config.ts`
2. Check Sentry auth token has correct permissions
3. Ensure source maps uploaded to correct release

## Cost Estimation

### Free Tier (Current Setup)
- 5,000 errors/month
- 10,000 transactions/month
- 50 session replays/month
- **Cost: $0/month**

### Team Plan (If Needed)
At 1,000 MAU, you likely won't exceed free tier, but if you do:
- 50,000 errors/month
- 100,000 transactions/month
- 500 session replays/month
- **Cost: $26/month**

## Next Steps

1. ✅ Set up Sentry account
2. ✅ Add DSN to environment variables
3. ✅ Deploy to Vercel with new env vars
4. ⬜ Configure alert rules
5. ⬜ Set up source maps (recommended)
6. ⬜ Monitor dashboard for first week
7. ⬜ Adjust sampling rates based on volume

## Resources

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Source Maps](https://docs.sentry.io/platforms/javascript/sourcemaps/)
