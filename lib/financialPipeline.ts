import { evaluateMoneyAction, PolicyCheckResult } from './policyEngine';
import { logAuditEntry } from './auditLogger';
import { createRazorpayTestOrder, RazorpayOrderResponse } from './razorpay';
import { checkAndSaveIdempotencyKey } from './idempotency';
import { AuthenticatedUserContext } from './auth';

export interface FinancialPipelineRequest {
  amount: number;
  currency?: string;
  merchantId?: string;
  merchantName?: string;
  idempotencyKey?: string;
}

export interface FinancialPipelineResponse {
  success: boolean;
  errorCode?: 'IDEMPOTENT_REPLAY' | 'POLICY_BLOCKED' | 'GATEWAY_ERROR' | 'UNAUTHORIZED' | 'RATE_LIMITED';
  approved: boolean;
  order?: RazorpayOrderResponse;
  checks: PolicyCheckResult[];
  explanation: string;
}

export async function executeBoundedFinancialPipeline(
  req: FinancialPipelineRequest,
  authContext: AuthenticatedUserContext
): Promise<FinancialPipelineResponse> {
  const { amount, currency = 'INR', merchantId = 'merch-aurasound-india-001', merchantName = 'AuraSound Direct Merchant', idempotencyKey } = req;

  // 1. Idempotency Check
  if (idempotencyKey) {
    const { isDuplicate, cachedResponse } = await checkAndSaveIdempotencyKey(idempotencyKey);
    if (isDuplicate && cachedResponse) {
      return cachedResponse;
    }
  }

  // 2. Evaluate Policy Engine using Trusted Server-Side User Settings
  const policyResult = evaluateMoneyAction({
    amount,
    currency,
    merchantId,
    merchantName,
    buyerAgentId: `agent-user-${authContext.user.id}`,
    userMaxCap: authContext.settings.maxSingleItemLimit,
    monthlyRemaining: authContext.settings.monthlySpendLimit - authContext.settings.monthlySpent,
    isTestMode: true,
  });

  if (!policyResult.approved) {
    await logAuditEntry({
      userId: authContext.user.id,
      transactionId: `TXN-${Date.now()}`,
      merchantName,
      amount,
      currency,
      status: 'BLOCKED_BY_POLICY',
      policyChecks: policyResult.checks,
      explanation: policyResult.explanation,
      failureReason: 'Financial Policy Guardrail Violation',
      recoveryAction: 'Interception triggered: 1-tap manual user authorization required.',
    });

    const responsePayload: FinancialPipelineResponse = {
      success: false,
      errorCode: 'POLICY_BLOCKED',
      approved: false,
      checks: policyResult.checks,
      explanation: policyResult.explanation,
    };

    if (idempotencyKey) {
      await checkAndSaveIdempotencyKey(idempotencyKey, responsePayload);
    }

    return responsePayload;
  }

  // 3. Create Order via Gateway
  try {
    const order = await createRazorpayTestOrder(amount, currency);

    await logAuditEntry({
      userId: authContext.user.id,
      transactionId: `TXN-${Date.now()}`,
      merchantName,
      amount,
      currency,
      status: 'AUTHORIZED',
      policyChecks: policyResult.checks,
      explanation: 'Authorized by Policy Engine. Razorpay Test Order Created.',
      razorpayOrderId: order.id,
    });

    const responsePayload: FinancialPipelineResponse = {
      success: true,
      approved: true,
      order,
      checks: policyResult.checks,
      explanation: 'Order authorized & created successfully.',
    };

    if (idempotencyKey) {
      await checkAndSaveIdempotencyKey(idempotencyKey, responsePayload);
    }

    return responsePayload;
  } catch (err: any) {
    const responsePayload: FinancialPipelineResponse = {
      success: false,
      errorCode: 'GATEWAY_ERROR',
      approved: true,
      checks: policyResult.checks,
      explanation: `Payment gateway error: ${err.message}`,
    };

    return responsePayload;
  }
}
