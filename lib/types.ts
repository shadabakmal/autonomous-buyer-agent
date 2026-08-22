export interface RetailerListing {
  id: string;
  name: 'Amazon India' | 'Flipkart' | 'Croma' | 'Reliance Digital' | 'Tata CLiQ' | 'Keychron India' | string;
  logo: string;
  price: number;
  originalPrice: number;
  shipping: string;
  shippingCost: number;
  deliveryEstimate: string;
  inStock: boolean;
  stockCount?: number;
  sellerRating: number;
  returnPolicy: string;
  url: string;
  isBestValue?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  isVerified: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  retailer: string;
  helpfulCount: number;
  flaggedFake?: boolean;
}

export interface ReviewSentiment {
  overallScore: number; // 0-100
  trustScore: number; // 0-100 (fake review detector)
  verifiedPercentage: number;
  pros: string[];
  cons: string[];
  featureRatings: {
    feature: string;
    score: number; // 1-5
  }[];
  summaryText: string;
  verdict: 'Must Buy' | 'Good Value' | 'Consider Alternatives' | 'Avoid';
}

export interface PricePoint {
  date: string;
  price: number;
  retailer: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  image: string;
  description: string;
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  retailers: RetailerListing[];
  sentiment: ReviewSentiment;
  priceHistory: PricePoint[];
  predictedPriceDrop?: {
    expectedPrice: number;
    daysAway: number;
    confidence: number;
  };
}

export interface AgentStep {
  id: string;
  timestamp: string;
  stepName: 'searching_stores' | 'scraping_reviews' | 'fake_detection' | 'analyzing_sentiment' | 'checking_guardrails' | 'purchasing' | 'completed' | 'failed';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'warning' | 'failed';
  data?: any;
}

export interface AgentTask {
  id: string;
  query: string;
  createdAt: string;
  status: 'analyzing' | 'recommendation_ready' | 'waiting_approval' | 'purchased' | 'failed';
  targetCategory?: string;
  targetMaxPrice?: number;
  autoBuyIfUnder?: number;
  matchedProduct?: Product;
  selectedRetailer?: RetailerListing;
  steps: AgentStep[];
  logs: string[];
}

export interface AutoBuyRule {
  id: string;
  productName: string;
  category: string;
  targetPrice: number;
  currentLowestPrice: number;
  maxBudget: number;
  requireApproval: boolean;
  minRating: number;
  status: 'active' | 'triggered' | 'paused' | 'expired';
  createdAt: string;
  lastChecked: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  productId: string;
  productName: string;
  productImage: string;
  retailer: string;
  pricePaid: number;
  shippingCost: number;
  tax: number;
  total: number;
  purchasedAt: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'delivered';
  trackingNumber: string;
  estimatedDelivery: string;
  agentReasoning: string;
  autoPurchased: boolean;
}

export interface UserSettings {
  maxSingleItemLimit: number;
  monthlySpendLimit: number;
  monthlySpent: number;
  requireApprovalOver: number;
  autoBuyEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  preferredStores: string[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: {
    type: string;
    last4: string;
    expiry: string;
    brand: string;
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
