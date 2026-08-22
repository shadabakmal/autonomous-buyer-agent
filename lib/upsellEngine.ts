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
  const baseInrPrice = product.retailers[0]?.price || 25000;
  
  const protectPrice = Math.round(baseInrPrice * 0.08);
  const bundlePrice = Math.round(baseInrPrice * 0.06);

  return [
    {
      id: `upsell-${product.id}-protect`,
      title: '2-Year Official India Damage & Liquid Protection Shield',
      description: 'Covers drops, accidental spills, and voltage surges with 0 deductible and 24/7 brand service.',
      originalPrice: Math.round(protectPrice * 1.5),
      bundlePrice: protectPrice,
      savingsPercentage: 35,
      aovBoostAmount: protectPrice,
      badge: 'HIGH MARGIN UPSELL',
    },
    {
      id: `upsell-${product.id}-bundle`,
      title: 'Premium Fast Charging Kit & Braided Cable Bundle',
      description: '65W GaN Dual USB-C Fast Charger + 2M Military Grade Braided Cable.',
      originalPrice: Math.round(bundlePrice * 1.4),
      bundlePrice: bundlePrice,
      savingsPercentage: 30,
      aovBoostAmount: bundlePrice,
      badge: 'TOP CONVERSION BUNDLE',
    },
  ];
}
