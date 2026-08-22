import { NextResponse } from 'next/server';
import { getAuthenticatedUserContext } from '../../../../lib/auth';
import { checkRateLimit } from '../../../../lib/rateLimit';
import { executeBoundedFinancialPipeline } from '../../../../lib/financialPipeline';

export async function POST(req: Request) {
  try {
    // 1. Server-Side Authentication & User Lookup
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized: Session authentication required', errorCode: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Sliding Window Rate Limit Check
    const rateLimit = checkRateLimit(authContext.user.id, 10, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Rate limit exceeded.', errorCode: 'RATE_LIMITED' }, { status: 429 });
    }

    // 3. Read Body Parameters (ONLY product/amount/merchant metadata — NEVER spend limits!)
    const body = await req.json();
    const { amount, currency = 'INR', merchantName = 'AuraSound Direct Merchant', merchantId } = body;

    const idempotencyKey = req.headers.get('x-idempotency-key') || undefined;

    // 4. Execute Bounded Financial Pipeline (Spend limits are strictly fetched from authContext.settings)
    const result = await executeBoundedFinancialPipeline(
      {
        amount: Number(amount),
        currency,
        merchantId,
        merchantName,
        idempotencyKey,
      },
      authContext
    );

    if (!result.success) {
      return NextResponse.json(result, { status: result.errorCode === 'POLICY_BLOCKED' ? 400 : 500 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error', errorCode: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
