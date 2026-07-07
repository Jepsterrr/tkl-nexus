const FETCH_TIMEOUT_MS = 6000;

/**
 * Race a promise against a timeout.
 * Rejects with an error after FETCH_TIMEOUT_MS, causing the caller's .catch()
 * handler to fire so the UI can show an error state with a retry button.
 * Timern städas när racet avgjorts — annars lever den kvar i onödan.
 */
export function withFetchTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('Fetch timeout')), FETCH_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}
