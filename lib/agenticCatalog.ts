import { searchRealLiveProducts } from './realDataEngine';
import { MOCK_PRODUCTS } from './mockData';

export async function generateAgenticCatalogResponse() {
  let products = await searchRealLiveProducts('electronics');
  if (!products || products.length === 0) {
    products = MOCK_PRODUCTS;
  }

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
    products: products.map((prod) => ({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand,
      price: {
        amount: prod.retailers[0]?.price || 100,
        currency: 'INR',
        originalAmount: prod.retailers[0]?.originalPrice || 120,
      },
      agentIncentiveDiscount: '5% Instant Agent Bundle Rebate',
      upsellRecommendations: [
        {
          id: `upsell-${prod.id}-warranty`,
          name: `${prod.brand} 2-Year Protection Plan`,
          discountPrice: 29.99,
          revenueAovBoostPercentage: 12,
        },
        {
          id: `upsell-${prod.id}-case`,
          name: 'Pro Accessory Kit & Fast Cable',
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
