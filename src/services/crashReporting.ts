// Crash reporting abstraction. Vendor-agnostic so we can plug Sentry,
// Bugsnag, or another provider without touching call sites.
//
// To enable: install @sentry/react-native, set EXPO_PUBLIC_SENTRY_DSN,
// and uncomment the Sentry calls below.

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

let initialized = false;

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const ENV = process.env.APP_ENV ?? 'development';

export function initCrashReporting() {
  if (initialized) return;
  initialized = true;

  if (!DSN) {
    if (__DEV__) {
      console.log('[crashReporting] No DSN configured, skipping init');
    }
    return;
  }

  // import * as Sentry from '@sentry/react-native';
  // Sentry.init({
  //   dsn: DSN,
  //   environment: ENV,
  //   enableAutoSessionTracking: true,
  //   tracesSampleRate: ENV === 'production' ? 0.2 : 1.0,
  // });
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[crashReporting]', error, context);
  }
  if (!DSN) return;
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: SeverityLevel = 'info') {
  if (__DEV__) {
    console.log(`[crashReporting:${level}]`, message);
  }
  if (!DSN) return;
  // Sentry.captureMessage(message, level);
}

export function setUserContext(userId: string | null) {
  if (!DSN) return;
  // Sentry.setUser(userId ? { id: userId } : null);
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  if (!DSN) return;
  // Sentry.addBreadcrumb({ message, category, data, level: 'info' });
}

// Triggers a test crash. Wired to a 5-tap on version in Settings (debug aid).
export function triggerTestCrash() {
  throw new Error('Smemorandum test crash — crashReporting verification');
}
