import { NextRequest, NextResponse } from 'next/server';
import { getAccounts } from '@/lib/actions/bank.actions';

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTING ACCOUNTS ===");
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      });
    }

    const accounts = await getAccounts({ userId });
    
    if (!accounts || !accounts.data) {
      return NextResponse.json({
        success: false,
        error: "No accounts found",
        accounts: []
      });
    }

    console.log("Accounts test successful:", {
      count: accounts.data.length,
      accounts: accounts.data.map((acc: any) => ({
        name: acc.name,
        hasFundingSource: acc.fundingSourceUrl !== "N/A"
      }))
    });

    return NextResponse.json({
      success: true,
      message: "Accounts retrieved successfully",
      accounts: accounts.data.map((acc: any) => ({
        name: acc.name,
        id: acc.id,
        hasFundingSource: acc.fundingSourceUrl !== "N/A"
      }))
    });

  } catch (error: any) {
    console.error("Accounts test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        type: error.type,
        response: error.response
      }
    });
  }
}
