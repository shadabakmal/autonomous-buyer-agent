import crypto from 'crypto';

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export async function createRazorpayTestOrder(
  amountInUnits: number,
  currency: string = 'INR',
  receiptId?: string
): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const amountInSmallestUnit = Math.round(amountInUnits * 100);

  if (keyId && keySecret) {
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInSmallestUnit,
          currency: currency.toUpperCase(),
          receipt: receiptId || `rcpt_${Date.now()}`,
          notes: {
            agentic_commerce: 'true',
            protocol: 'ACP/UAP-v1',
          },
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.error('Razorpay API error:', err);
    }
  }

  // Fallback test order generator when API keys are pending setup
  return {
    id: `order_${Math.random().toString(36).substring(2, 12)}`,
    entity: 'order',
    amount: amountInSmallestUnit,
    currency: currency.toUpperCase(),
    receipt: receiptId || `rcpt_${Date.now()}`,
    status: 'created',
    created_at: Math.floor(Date.now() / 1000),
  };
}

export function generateRazorpayTestSignature(orderId: string, paymentId: string, secret: string = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret_key'): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  return hmac.digest('hex');
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  keySecret: string = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret_key'
): boolean {
  if (!orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');
    
    // Constant time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (e) {
    return false;
  }
}
