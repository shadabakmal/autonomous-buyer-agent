import { MOCK_PRODUCTS } from './mockData';

export interface AgenticCatalogProtocolSpec {
  '@context': string;
  protocol: 'ACP/AP2/x402';
  version: '1.0.0';
  merchant: {
    id: string;
    name: string;
    trustScore: number;
    supportedPaymentGateways: string[];
    razorpayTestModeSupported: boolean;
    currency: string;
    policyRulesEndpoint: string;
  };
  products: {
    id: string;
    name: string;
    category: string;
    brand: string;
    price: {
      amount: number;
      currency: string;
      originalAmount: number;
    };
    agentIncentiveDiscount: string;
    upsellRecommendations: {
      id: string;
      name: string;
      discountPrice: number;
      revenueAovBoostPercentage: number;
    }[];
    specifications: Record<string, string>;
    availability: {
      inStock: boolean;
      stockLevel: number;
    };
    aiSentimentVerdict: string;
    verificationBadge: string;
  }[];
}

export function generateAgenticCatalogResponse(): AgenticCatalogProtocolSpec {
  return {
    '@context': 'https://schema.org/AgenticCommerceProtocol',
    protocol: 'ACP/AP2/x402',
    version: '1.0.0',
    merchant: {
      id: 'merch-aurasound-india-001',
      name: 'AuraSound Direct Merchant',
      trustScore: 98,
      supportedPaymentGateways: ['Razorpay Test Mode', 'NPCI UAP', 'UPI AutoPay'],
      razorpayTestModeSupported: true,
      currency: 'INR',
      policyRulesEndpoint: '/api/agent/catalog',
    },
    products: MOCK_PRODUCTS.map((prod) => ({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: {
        amount: prod.retailers[0].price,
        currency: 'INR',
        originalAmount: prod.retailers[0].originalPrice,
      },
      agentIncentiveDiscount: '5% Instant Agent Bundle Rebate',
      upsellRecommendations: [
        {
          id: `upsell-${prod.id}-warranty`,
          name: `${prod.brand} 2-Year Damage Protection Plan`,
          discountPrice: 29.99,
          revenueAovBoostPercentage: 12,
        },
        {
          id: `upsell-${prod.id}-case`,
          name: 'Premium Rigid Carrying Shell & Braided Cable',
          discountPrice: 19.99,
          revenueAovBoostPercentage: 8,
        },
      ],
      specifications: prod.specs,
      availability: {
        inStock: true,
        stockLevel: 45,
      },
      aiSentimentVerdict: prod.sentiment.verdict,
      verificationBadge: 'Verified Cryptographic Merchant',
    })),
  };
}
