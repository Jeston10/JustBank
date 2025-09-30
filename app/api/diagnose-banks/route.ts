import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks } from '@/lib/actions/bank.actions';

export async function GET() {
  try {
    console.log("=== BANK DIAGNOSTIC API ===");
    
    const loggedInUser = await getLoggedInUser();
    
    if (!loggedInUser) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    console.log("User:", {
      id: loggedInUser.$id,
      email: loggedInUser.email,
      hasDwollaCustomerId: !!loggedInUser.dwollaCustomerId,
      hasDwollaCustomerUrl: !!loggedInUser.dwollaCustomerUrl
    });

    const banksData = await getBanks({ userId: loggedInUser.$id });
    const banks = banksData.data || [];

    console.log("Banks found:", banks.length);

    const bankDiagnostics = banks.map(bank => ({
      id: bank.$id,
      bankName: bank.bankName,
      accountType: bank.accountType,
      accountId: bank.accountId,
      hasFundingSourceUrl: !!bank.fundingSourceUrl,
      fundingSourceUrl: bank.fundingSourceUrl,
      hasPlaidProcessorToken: !!bank.plaidProcessorToken,
      userId: bank.userId
    }));

    console.log("Bank diagnostics:", bankDiagnostics);

    return NextResponse.json({
      success: true,
      user: {
        id: loggedInUser.$id,
        email: loggedInUser.email,
        hasDwollaCustomerId: !!loggedInUser.dwollaCustomerId,
        hasDwollaCustomerUrl: !!loggedInUser.dwollaCustomerUrl,
        dwollaCustomerId: loggedInUser.dwollaCustomerId,
        dwollaCustomerUrl: loggedInUser.dwollaCustomerUrl
      },
      banks: bankDiagnostics,
      summary: {
        totalBanks: banks.length,
        banksWithFundingSource: banks.filter(b => b.fundingSourceUrl).length,
        banksWithoutFundingSource: banks.filter(b => !b.fundingSourceUrl).length,
        banksWithPlaidToken: banks.filter(b => b.plaidProcessorToken).length
      }
    });

  } catch (error: any) {
    console.error("Bank diagnostic failed:", error);
    return NextResponse.json({ 
      error: "Failed to diagnose banks", 
      details: error.message 
    }, { status: 500 });
  }
}
