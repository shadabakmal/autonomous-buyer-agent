import { NextResponse } from 'next/server';
import { fetchRecentAuditLogs } from '../../../lib/auditLogger';

export async function GET() {
  try {
    const logs = await fetchRecentAuditLogs(30);
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ logs: [] });
  }
}
