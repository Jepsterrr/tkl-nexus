const FETCH_TIMEOUT_MS = 6000;

/**
 * Race a promise against a timeout.
 * Rejects with an error after FETCH_TIMEOUT_MS, causing the caller's .catch()
 * handler to fire so the UI can show an error state with a retry button.
 */
export function withFetchTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Fetch timeout')), FETCH_TIMEOUT_MS),
    ),
  ]);
}
