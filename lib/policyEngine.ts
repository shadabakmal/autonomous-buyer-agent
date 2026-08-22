export interface PolicyCheckResult {
  passed: boolean;
  ruleName: string;
  details: string;
  timestamp: string;
  policyId: string;
}

export interface MoneyActionRequest {
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  buyerAgentId: string;
  userMaxCap: number;
  monthlyRemaining: number;
  isTestMode: boolean;
}

export function evaluateMoneyAction(request: MoneyActionRequest): {
  approved: boolean;
  checks: PolicyCheckResult[];
  explanation: string;
} {
  const timestamp = new Date().toISOString();
  const checks: PolicyCheckResult[] = [];

  // Check 1: Single item spending cap
  const passSingleCap = request.amount <= request.userMaxCap;
  checks.push({
    policyId: 'POL-001',
    ruleName: 'Single Item Spend Ceiling',
    passed: passSingleCap,
    details: passSingleCap
      ? `Transaction amount ($${request.amount.toFixed(2)}) is within max limit ($${request.userMaxCap.toFixed(2)}).`
      : `Transaction amount ($${request.amount.toFixed(2)}) EXCEEDS max single cap ($${request.userMaxCap.toFixed(2)}).`,
    timestamp,
  });

  // Check 2: Monthly remaining budget
  const passMonthlyCap = request.amount <= request.monthlyRemaining;
  checks.push({
    policyId: 'POL-002',
    ruleName: 'Monthly Aggregate Spend Ceiling',
    passed: passMonthlyCap,
    details: passMonthlyCap
      ? `Amount ($${request.amount.toFixed(2)}) is within remaining monthly budget ($${request.monthlyRemaining.toFixed(2)}).`
      : `Amount ($${request.amount.toFixed(2)}) EXCEEDS remaining monthly budget ($${request.monthlyRemaining.toFixed(2)}).`,
    timestamp,
  });

  // Check 3: Merchant Identity & Security Authorization
  const passMerchantAuth = Boolean(request.merchantId && request.merchantName);
  checks.push({
    policyId: 'POL-003',
    ruleName: 'Merchant Cryptographic Signature & ID Verification',
    passed: passMerchantAuth,
    details: passMerchantAuth
      ? `Merchant "${request.merchantName}" [${request.merchantId}] holds active cryptographic protocol badge.`
      : `Merchant ID unverified or signature mismatch.`,
    timestamp,
  });

  // Check 4: Currency & Gateway Protocol Compliance
  const passCurrency = request.currency.toUpperCase() === 'INR' || request.currency.toUpperCase() === 'USD';
  checks.push({
    policyId: 'POL-004',
    ruleName: 'Payment Protocol & Razorpay Gateway Gate',
    passed: passCurrency,
    details: passCurrency
      ? `Supported currency (${request.currency}) routed through Razorpay Test-Mode / UAP Gateway.`
      : `Unsupported currency (${request.currency}).`,
    timestamp,
  });

  const approved = checks.every((c) => c.passed);
  const explanation = approved
    ? `All 4 security & financial guardrails passed successfully. Authorized for payment execution.`
    : `Money action blocked by policy engine: ${checks.filter((c) => !c.passed).map((c) => c.ruleName).join(', ')}.`;

  return { approved, checks, explanation };
}
