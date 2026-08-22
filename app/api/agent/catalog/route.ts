import { NextResponse } from 'next/server';
import { generateAgenticCatalogResponse } from '../../../../lib/agenticCatalog';

export async function GET() {
  const catalog = await generateAgenticCatalogResponse();
  return NextResponse.json(catalog, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'X-Agentic-Commerce-Protocol': 'ACP/AP2/x402-v1.0',
    },
  });
}
