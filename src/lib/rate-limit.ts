/**
 * Placeholder rate-limit interface — always allows today. Swap the body for
 * a real limiter (e.g. Upstash Ratelimit, keyed on IP or email) later
 * without touching any call site.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- key will be used once a real limiter backs this
export async function checkRateLimit(key: string): Promise<{ success: boolean }> {
  return { success: true };
}
