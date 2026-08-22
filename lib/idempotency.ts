import { prisma } from './db';

export async function checkAndSaveIdempotencyKey(key: string, responsePayload?: any): Promise<{ isDuplicate: boolean; cachedResponse?: any }> {
  if (!key) return { isDuplicate: false };

  const existing = await prisma.idempotencyKey.findUnique({
    where: { key },
  });

  if (existing) {
    try {
      return { isDuplicate: true, cachedResponse: JSON.parse(existing.response) };
    } catch (e) {
      return { isDuplicate: true };
    }
  }

  if (responsePayload) {
    await prisma.idempotencyKey.create({
      data: {
        key,
        response: JSON.stringify(responsePayload),
      },
    });
  }

  return { isDuplicate: false };
}
