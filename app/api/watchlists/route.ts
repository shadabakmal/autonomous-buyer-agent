import { NextResponse } from 'next/server';
import { getAuthenticatedUserContext } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export async function GET(req: Request) {
  try {
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ rules: [] });
    }

    const rules = await prisma.autoBuyRule.findMany({
      where: { userId: authContext.user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (rules.length === 0) {
      // Seed default real active trigger rules in SQLite DB
      const r1 = await prisma.autoBuyRule.create({
        data: {
          userId: authContext.user.id,
          productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
          category: 'Audio',
          targetPrice: 24990,
          currentLowestPrice: 26990,
          maxBudget: 30000,
          requireApproval: false,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
        },
      });

      const r2 = await prisma.autoBuyRule.create({
        data: {
          userId: authContext.user.id,
          productName: 'Keychron Q1 Pro Mechanical Keyboard',
          category: 'Peripherals',
          targetPrice: 14500,
          currentLowestPrice: 15999,
          maxBudget: 18000,
          requireApproval: true,
          status: 'active',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
        },
      });

      return NextResponse.json({ rules: [r1, r2] });
    }

    return NextResponse.json({ rules });
  } catch (err: any) {
    return NextResponse.json({ rules: [] });
  }
}

export async function POST(req: Request) {
  try {
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const newRule = await prisma.autoBuyRule.create({
      data: {
        userId: authContext.user.id,
        productName: body.productName,
        category: body.category || 'Electronics',
        targetPrice: Number(body.targetPrice),
        currentLowestPrice: Number(body.targetPrice) + 1500,
        maxBudget: Number(body.maxBudget || 50000),
        requireApproval: Boolean(body.requireApproval),
        status: 'active',
        image: body.image || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80',
      },
    });

    return NextResponse.json({ rule: newRule });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
