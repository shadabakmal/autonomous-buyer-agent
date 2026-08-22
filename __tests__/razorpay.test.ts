import { describe, it, expect } from 'vitest';
import { generateRazorpayTestSignature, verifyRazorpaySignature } from '../lib/razorpay';

describe('Razorpay HMAC-SHA256 Signature Verification', () => {
  const secret = 'test_secret_key_99';
  const orderId = 'order_ABC12345';
  const paymentId = 'pay_XYZ67890';

  it('should verify valid HMAC-SHA256 signature', () => {
    const validSig = generateRazorpayTestSignature(orderId, paymentId, secret);
    const result = verifyRazorpaySignature(orderId, paymentId, validSig, secret);
    expect(result).toBe(true);
  });

  it('should REJECT invalid/tampered signature', () => {
    const invalidSig = 'tampered_signature_string';
    const result = verifyRazorpaySignature(orderId, paymentId, invalidSig, secret);
    expect(result).toBe(false);
  });

  it('should REJECT hardcoded bypass strings', () => {
    const bypassSig = 'rzp_test_sig_fake';
    const result = verifyRazorpaySignature(orderId, paymentId, bypassSig, secret);
    expect(result).toBe(false);
  });
});
