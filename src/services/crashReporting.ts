/**
 * Crash reporting bridge. Today logs to console; tomorrow swap in Sentry
 * (or Bugsnag/Crashlytics) by filling the three marked call sites below.
 *
 * Kept as a separate module so screens and ErrorBoundary never import the
 * vendor SDK directly — swapping provider later is a one-file change.
 */

let initialized = false;
let breadcrumbs: Array<{ ts: number; tag: string; msg: string }> = [];
const MAX_BREADCRUMBS = 30;

export function initCrashReporting(): void {
  if (initialized) return;
  initialized = true;

  // Global JS handler — catches errors that escape React render tree
  // (e.g. uncaught promise rejections, event handlers).
  const g = globalThis as unknown as {
    ErrorUtils?: {
      getGlobalHandler?: () => (err: unknown, isFatal?: boolean) => void;
      setGlobalHandler?: (h: (err: unknown, isFatal?: boolean) => void) => void;
    };
  };
  const prev = g.ErrorUtils?.getGlobalHandler?.();
  g.ErrorUtils?.setGlobalHandler?.((error, isFatal) => {
    captureException(error, isFatal ? 'fatal' : 'non-fatal');
    if (prev) prev(error, isFatal);
  });

  // TODO(sentry): Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, ... });
}

export function captureException(error: unknown, context?: string): void {
  const payload = normalize(error);
  if (context) payload.context = context;
  payload.breadcrumbs = [...breadcrumbs];

  // eslint-disable-next-line no-console
  console.error('[crash]', payload);

  // TODO(sentry): Sentry.captureException(error, { extra: payload });
}

export function captureMessage(message: string, tag = 'info'): void {
  // eslint-disable-next-line no-console
  console.log('[crash:msg]', tag, message);

  // TODO(sentry): Sentry.captureMessage(message, tag === 'error' ? 'error' : 'info');
}

export function addBreadcrumb(tag: string, msg: string): void {
  breadcrumbs.push({ ts: Date.now(), tag, msg });
  if (breadcrumbs.length > MAX_BREADCRUMBS) breadcrumbs.shift();
}

/** Force a synchronous render-time crash. Used by the hidden debug trigger. */
export function triggerDebugCrash(): never {
  throw new Error('Smemorandum debug crash (from Settings version tap)');
}

function normalize(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { value: String(error) };
}
