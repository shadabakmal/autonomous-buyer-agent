import { Product } from './types';

export interface UpsellOffer {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  savingsPercentage: number;
  aovBoostAmount: number;
  badge: string;
}

export function generateUpsellOffersForProduct(product: Product): UpsellOffer[] {
  return [
    {
      id: `upsell-${product.id}-protect`,
      title: '2-Year Accidental Damage & Express Replacement Shield',
      description: 'Covers drops, spills, and electrical surge with 0 deductible and 24/7 priority agent support.',
      originalPrice: 49.99,
      bundlePrice: 29.99,
      savingsPercentage: 40,
      aovBoostAmount: 29.99,
      badge: 'HIGH MARGIN UPSELL',
    },
    {
      id: `upsell-${product.id}-bundle`,
      title: 'Pro Accessory Care & Premium Fast Charger Kit',
      description: 'Custom molded travel case + 100W braided nylon fast charging cable.',
      originalPrice: 39.99,
      bundlePrice: 24.99,
      savingsPercentage: 37,
      aovBoostAmount: 24.99,
      badge: 'TOP CONVERSION BUNDLE',
    },
  ];
}
