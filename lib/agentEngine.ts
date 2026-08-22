import { Product, AgentTask, AgentStep, RetailerListing, UserSettings } from './types';
import { MOCK_PRODUCTS, INITIAL_USER_SETTINGS } from './mockData';

export function findMatchingProducts(query: string): Product[] {
  const q = query.toLowerCase();
  
  if (q.includes('headphone') || q.includes('sony') || q.includes('audio') || q.includes('canceling') || q.includes('noise')) {
    return [MOCK_PRODUCTS[0], MOCK_PRODUCTS[1]];
  }
  if (q.includes('keyboard') || q.includes('keychron') || q.includes('mechanical') || q.includes('type')) {
    return [MOCK_PRODUCTS[1], MOCK_PRODUCTS[0]];
  }
  if (q.includes('tv') || q.includes('lg') || q.includes('oled') || q.includes('display') || q.includes('screen')) {
    return [MOCK_PRODUCTS[2]];
  }
  if (q.includes('power bank') || q.includes('charger') || q.includes('battery') || q.includes('anker')) {
    return [MOCK_PRODUCTS[3]];
  }
  
  // Default return sorted list
  return MOCK_PRODUCTS;
}

export function parseQueryConstraints(query: string): { maxPrice?: number; minRating?: number; category?: string } {
  const constraints: { maxPrice?: number; minRating?: number; category?: string } = {};
  
  // Extract budget like "under $200" or "below 300 dollars"
  const priceMatch = query.match(/(?:under|below|less than|\$)\s*(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    constraints.maxPrice = parseInt(priceMatch[1], 10);
  }

  // Extract rating expectation
  if (query.includes('best rated') || query.includes('high rating')) {
    constraints.minRating = 4.5;
  }

  return constraints;
}

export async function runAgentTaskSimulation(
  query: string,
  userSettings: UserSettings = INITIAL_USER_SETTINGS,
  onStepUpdate?: (step: AgentStep, allSteps: AgentStep[]) => void
): Promise<{ task: AgentTask; matchedProduct: Product; selectedRetailer: RetailerListing; autoPurchased: boolean }> {
  const steps: AgentStep[] = [];
  const logs: string[] = [];

  const addStep = (
    stepName: AgentStep['stepName'],
    title: string,
    description: string,
    status: AgentStep['status'] = 'in_progress',
    data?: any
  ): AgentStep => {
    const step: AgentStep = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      stepName,
      title,
      description,
      status,
      data,
    };
    steps.push(step);
    logs.push(`[${step.timestamp}] ${title}: ${description}`);
    if (onStepUpdate) onStepUpdate(step, [...steps]);
    return step;
  };

  const updateStepStatus = (id: string, status: AgentStep['status'], extraDesc?: string) => {
    const s = steps.find((x) => x.id === id);
    if (s) {
      s.status = status;
      if (extraDesc) s.description += ` — ${extraDesc}`;
      if (onStepUpdate) onStepUpdate(s, [...steps]);
    }
  };

  // Step 1: Searching storefronts
  const s1 = addStep(
    'searching_stores',
    'Querying Retailers',
    `Searching Amazon, Best Buy, eBay, Target, & B&H Photo for "${query}"...`
  );

  const matchedProducts = findMatchingProducts(query);
  const matchedProduct = matchedProducts[0] || MOCK_PRODUCTS[0];
  const constraints = parseQueryConstraints(query);

  updateStepStatus(
    s1.id,
    'completed',
    `Found ${matchedProducts.length} matching candidate models across 5 stores.`
  );

  // Step 2: Extracting & Filtering Reviews
  const s2 = addStep(
    'scraping_reviews',
    'Review Extraction & Verification',
    `Extracting ${matchedProduct.reviewCount} customer reviews from Amazon, Best Buy, and enthusiast forums...`
  );

  updateStepStatus(
    s2.id,
    'completed',
    `Cross-verified ${matchedProduct.sentiment.verifiedPercentage}% verified buyer reviews.`
  );

  // Step 3: Fake Review Detection
  const s3 = addStep(
    'fake_detection',
    'Fake Review & Bot Filter',
    `Running NLP anomaly check on review sentiment & cluster distributions...`
  );

  updateStepStatus(
    s3.id,
    'completed',
    `Trust score ${matchedProduct.sentiment.trustScore}/100. Low bot/fake review probability.`
  );

  // Step 4: Price & Value Matrix
  const s4 = addStep(
    'analyzing_sentiment',
    'Cross-Store Price & Shipping Matrix',
    `Comparing total price (including taxes, fast shipping, and return policies)...`
  );

  // Pick best value listing
  const selectedRetailer = matchedProduct.retailers.find((r) => r.isBestValue) || matchedProduct.retailers[0];

  updateStepStatus(
    s4.id,
    'completed',
    `Best offer found on ${selectedRetailer.name} for $${selectedRetailer.price.toFixed(2)} (${selectedRetailer.shipping}).`
  );

  // Step 5: Guardrails & Autonomous Purchasing Check
  const s5 = addStep(
    'checking_guardrails',
    'Safety Guardrail & Budget Check',
    `Evaluating user spending caps ($${userSettings.maxSingleItemLimit} single cap, $${userSettings.monthlySpendLimit} monthly limit)...`
  );

  const price = selectedRetailer.price;
  const isWithinSingleLimit = price <= userSettings.maxSingleItemLimit;
  const isWithinMonthlyLimit = (userSettings.monthlySpent + price) <= userSettings.monthlySpendLimit;
  const requiresManualApproval = userSettings.requireApprovalOver ? price > userSettings.requireApprovalOver : false;

  let autoPurchased = false;
  let finalTaskStatus: AgentTask['status'] = 'recommendation_ready';

  if (!isWithinSingleLimit) {
    updateStepStatus(
      s5.id,
      'warning',
      `Exceeds maximum single item spend limit ($${userSettings.maxSingleItemLimit}). User approval required.`
    );
    finalTaskStatus = 'waiting_approval';
  } else if (!isWithinMonthlyLimit) {
    updateStepStatus(
      s5.id,
      'warning',
      `Would exceed monthly remaining budget. User confirmation required.`
    );
    finalTaskStatus = 'waiting_approval';
  } else if (requiresManualApproval) {
    updateStepStatus(
      s5.id,
      'warning',
      `Price ($${price.toFixed(2)}) is higher than instant auto-buy threshold ($${userSettings.requireApprovalOver}). Confirmation requested.`
    );
    finalTaskStatus = 'waiting_approval';
  } else {
    updateStepStatus(
      s5.id,
      'completed',
      `All safety guardrails passed! Authorized for instant autonomous checkout.`
    );

    // Step 6: Purchasing
    const s6 = addStep(
      'purchasing',
      'Autonomous Checkout Execution',
      `Submitting order to ${selectedRetailer.name} using Visa ending in ${userSettings.paymentMethod.last4}...`
    );

    updateStepStatus(
      s6.id,
      'completed',
      `Order confirmed! Tracking code generated.`
    );

    autoPurchased = true;
    finalTaskStatus = 'purchased';
  }

  const task: AgentTask = {
    id: `task-${Date.now()}`,
    query,
    createdAt: new Date().toISOString(),
    status: finalTaskStatus,
    targetCategory: matchedProduct.category,
    targetMaxPrice: constraints.maxPrice,
    matchedProduct,
    selectedRetailer,
    steps,
    logs,
  };

  return { task, matchedProduct, selectedRetailer, autoPurchased };
}
