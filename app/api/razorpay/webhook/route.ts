import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { logAuditEntry } from '../../../../lib/auditLogger';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'sandbox_webhook_secret';

    const rawBody = await req.text();

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature header' }, { status: 400 });
    }

    // Verify HMAC-SHA256 Signature of Webhook Payload
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      await logAuditEntry({
        transactionId: `TXN-WEBHOOK-${Date.now()}`,
        merchantName: 'AuraSound Direct Merchant',
        amount: paymentEntity ? paymentEntity.amount / 100 : 0,
        currency: paymentEntity ? paymentEntity.currency : 'INR',
        status: 'RAZORPAY_SUCCESS',
        policyChecks: [
          {
            policyId: 'POL-WEBHOOK-001',
            ruleName: 'Razorpay Server Webhook HMAC Signature',
            passed: true,
            details: `Received verified asynchronous event: ${event}`,
            timestamp: new Date().toISOString(),
          },
        ],
        explanation: `Server Webhook confirmed event '${event}' for Order ${orderEntity?.id || 'N/A'}.`,
        razorpayOrderId: orderEntity?.id,
        razorpayPaymentId: paymentEntity?.id,
      });
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Webhook processing error' }, { status: 500 });
  }
}
