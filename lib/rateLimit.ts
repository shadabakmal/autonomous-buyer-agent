const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ipOrUserId: string, maxRequests: number = 10, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ipOrUserId);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ipOrUserId, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxRequests - record.count };
}
