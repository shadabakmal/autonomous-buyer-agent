import { NextResponse } from 'next/server';
import { searchRealLiveProducts } from '../../../lib/realDataEngine';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || 'laptops';

  try {
    const products = await searchRealLiveProducts(query);
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
