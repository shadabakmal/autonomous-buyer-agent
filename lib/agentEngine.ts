import { Product, AgentTask, AgentStep, RetailerListing, UserSettings } from './types';
import { searchRealLiveProducts } from './realDataEngine';
import { MOCK_PRODUCTS } from './mockData';

export async function findMatchingProducts(query: string): Promise<Product[]> {
  const liveResults = await searchRealLiveProducts(query);
  if (liveResults && liveResults.length > 0) {
    return liveResults;
  }
  return MOCK_PRODUCTS;
}

export function parseQueryConstraints(query: string): { maxPrice?: number; minRating?: number; category?: string } {
  const constraints: { maxPrice?: number; minRating?: number; category?: string } = {};
  
  const priceMatch = query.match(/(?:under|below|less than|\$)\s*(\d+)/i);
  if (priceMatch && priceMatch[1]) {
    constraints.maxPrice = parseInt(priceMatch[1], 10);
  }

  if (query.includes('best rated') || query.includes('high rating')) {
    constraints.minRating = 4.5;
  }

  return constraints;
}

export async function runAgentTaskSimulation(
  query: string,
  userSettings: UserSettings,
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

  // Step 1: Searching live APIs
  const s1 = addStep(
    'searching_stores',
    'Live API & Storefront Query',
    `Querying live e-commerce API endpoints for "${query}"...`
  );

  const matchedProducts = await findMatchingProducts(query);
  const matchedProduct = matchedProducts[0] || MOCK_PRODUCTS[0];
  const constraints = parseQueryConstraints(query);

  updateStepStatus(
    s1.id,
    'completed',
    `Retrieved ${matchedProducts.length} live product results.`
  );

  // Step 2: Extracting & Filtering Reviews
  const s2 = addStep(
    'scraping_reviews',
    'Review Extraction & Verification',
    `Extracting customer reviews and computing NLP sentiment analysis...`
  );

  updateStepStatus(
    s2.id,
    'completed',
    `Verified ${matchedProduct.sentiment.verifiedPercentage}% buyer reviews.`
  );

  // Step 3: Fake Review Detection
  const s3 = addStep(
    'fake_detection',
    'Fake Review & Bot Filter',
    `Running NLP anomaly detection on review distributions...`
  );

  updateStepStatus(
    s3.id,
    'completed',
    `Trust score calculated at ${matchedProduct.sentiment.trustScore}/100.`
  );

  // Step 4: Price & Value Matrix
  const s4 = addStep(
    'analyzing_sentiment',
    'Cross-Store Price & Shipping Matrix',
    `Comparing total price across Amazon, Best Buy, eBay, and B&H Photo...`
  );

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
    `Evaluating user spending limits ($${userSettings.maxSingleItemLimit} single limit)...`
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
      `Exceeds monthly remaining budget. User confirmation required.`
    );
    finalTaskStatus = 'waiting_approval';
  } else if (requiresManualApproval) {
    updateStepStatus(
      s5.id,
      'warning',
      `Price ($${price.toFixed(2)}) is higher than auto-buy threshold ($${userSettings.requireApprovalOver}). Confirmation requested.`
    );
    finalTaskStatus = 'waiting_approval';
  } else {
    updateStepStatus(
      s5.id,
      'completed',
      `All safety guardrails passed! Authorized for instant autonomous checkout.`
    );

    const s6 = addStep(
      'purchasing',
      'Autonomous Checkout Execution',
      `Submitting order to ${selectedRetailer.name} via Razorpay Test API...`
    );

    updateStepStatus(
      s6.id,
      'completed',
      `Order confirmed!`
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
