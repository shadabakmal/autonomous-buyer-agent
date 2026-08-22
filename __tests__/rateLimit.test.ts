import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../lib/rateLimit';

describe('Sliding Window Rate Limiter', () => {
  it('should allow requests within limit and throttle when limit is reached', () => {
    const userKey = `user-${Date.now()}`;
    const maxReqs = 3;

    expect(checkRateLimit(userKey, maxReqs, 5000).allowed).toBe(true);
    expect(checkRateLimit(userKey, maxReqs, 5000).allowed).toBe(true);
    expect(checkRateLimit(userKey, maxReqs, 5000).allowed).toBe(true);

    const fourthReq = checkRateLimit(userKey, maxReqs, 5000);
    expect(fourthReq.allowed).toBe(false);
    expect(fourthReq.remaining).toBe(0);
  });
});
