import { NextResponse } from 'next/server';
import { getAuthenticatedUserContext } from '../../../lib/auth';
import { prisma } from '../../../lib/db';

export async function GET(req: Request) {
  try {
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ settings: authContext.settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authContext = await getAuthenticatedUserContext(req);
    if (!authContext) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await prisma.userSettings.update({
      where: { userId: authContext.user.id },
      data: {
        maxSingleItemLimit: Number(body.maxSingleItemLimit || 50000),
        monthlySpendLimit: Number(body.monthlySpendLimit || 250000),
        requireApprovalOver: Number(body.requireApprovalOver || 15000),
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
