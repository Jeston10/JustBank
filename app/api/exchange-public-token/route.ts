import { NextRequest, NextResponse } from 'next/server';
import { exchangePublicToken } from '@/lib/actions/user.actions';

export async function POST(req: NextRequest) {
  const { publicToken, user } = await req.json();
  try {
    const result = await exchangePublicToken({ publicToken, user });
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json({ success: false, error: error?.toString() }, { status: 500 });
  }
} 