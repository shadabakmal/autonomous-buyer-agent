import { describe, it, expect } from 'vitest';
import { evaluateMoneyAction } from '../lib/policyEngine';

describe('Financial Policy Engine Security & Guardrails', () => {
  it('should approve transactions within single cap and monthly budget', () => {
    const result = evaluateMoneyAction({
      amount: 150,
      currency: 'INR',
      merchantId: 'm-1',
      merchantName: 'AuraSound',
      buyerAgentId: 'agent-1',
      userMaxCap: 500,
      monthlyRemaining: 2000,
      isTestMode: true,
    });

    expect(result.approved).toBe(true);
    expect(result.checks.length).toBe(4);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });

  it('should BLOCK transactions exceeding single item spend ceiling', () => {
    const result = evaluateMoneyAction({
      amount: 650,
      currency: 'INR',
      merchantId: 'm-1',
      merchantName: 'AuraSound',
      buyerAgentId: 'agent-1',
      userMaxCap: 500,
      monthlyRemaining: 2000,
      isTestMode: true,
    });

    expect(result.approved).toBe(false);
    const failedCheck = result.checks.find((c) => c.policyId === 'POL-001');
    expect(failedCheck).toBeDefined();
    expect(failedCheck?.passed).toBe(false);
  });

  it('should BLOCK transactions exceeding remaining monthly budget ceiling', () => {
    const result = evaluateMoneyAction({
      amount: 300,
      currency: 'INR',
      merchantId: 'm-1',
      merchantName: 'AuraSound',
      buyerAgentId: 'agent-1',
      userMaxCap: 500,
      monthlyRemaining: 150,
      isTestMode: true,
    });

    expect(result.approved).toBe(false);
    const failedCheck = result.checks.find((c) => c.policyId === 'POL-002');
    expect(failedCheck).toBeDefined();
    expect(failedCheck?.passed).toBe(false);
  });

  it('should BLOCK transactions with unverified merchant credentials', () => {
    const result = evaluateMoneyAction({
      amount: 100,
      currency: 'INR',
      merchantId: '',
      merchantName: '',
      buyerAgentId: 'agent-1',
      userMaxCap: 500,
      monthlyRemaining: 1000,
      isTestMode: true,
    });

    expect(result.approved).toBe(false);
    const failedCheck = result.checks.find((c) => c.policyId === 'POL-003');
    expect(failedCheck).toBeDefined();
    expect(failedCheck?.passed).toBe(false);
  });
});
