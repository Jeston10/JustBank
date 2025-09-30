import { NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks } from '@/lib/actions/bank.actions';
import { createFundingSource } from '@/lib/actions/dwolla.actions';
import { createAdminClient } from '@/lib/appwrite';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export async function POST() {
  try {
    console.log("=== FIX ALL BANKS API ===");
    
    const loggedInUser = await getLoggedInUser();
    
    if (!loggedInUser) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    if (!loggedInUser.dwollaCustomerId) {
      return NextResponse.json({ 
        error: "User does not have Dwolla customer ID. Please create Dwolla customer first." 
      }, { status: 400 });
    }

    console.log("User has Dwolla customer ID:", loggedInUser.dwollaCustomerId);

    const banksData = await getBanks({ userId: loggedInUser.$id });
    const banks = banksData.data || [];

    console.log("Found banks:", banks.length);

    const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
    console.log("Banks needing fix:", banksNeedingFix.length);

    if (banksNeedingFix.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All banks already have funding sources",
        fixedBanks: 0,
        totalBanks: banks.length
      });
    }

    const { database } = await createAdminClient();
    const results = [];

    for (const bank of banksNeedingFix) {
      try {
        console.log(`Fixing bank: ${bank.bankName} - ${bank.accountType}`);

        if (!bank.plaidProcessorToken) {
          results.push({
            bankId: bank.$id,
            bankName: bank.bankName,
            success: false,
            error: "Missing Plaid processor token - bank needs to be reconnected"
          });
          continue;
        }

        // Create funding source
        const fundingSourceUrl = await createFundingSource({
          customerId: loggedInUser.dwollaCustomerId,
          fundingSourceName: `${bank.bankName} - ${bank.accountType}`,
          plaidToken: bank.plaidProcessorToken
        });

        if (!fundingSourceUrl) {
          results.push({
            bankId: bank.$id,
            bankName: bank.bankName,
            success: false,
            error: "Failed to create funding source"
          });
          continue;
        }

        // Update bank record
        await database.updateDocument(
          DATABASE_ID!,
          BANK_COLLECTION_ID!,
          bank.$id,
          {
            fundingSourceUrl: fundingSourceUrl
          }
        );

        results.push({
          bankId: bank.$id,
          bankName: bank.bankName,
          success: true,
          fundingSourceUrl: fundingSourceUrl
        });

        console.log(`Successfully fixed bank: ${bank.bankName}`);

      } catch (error: any) {
        console.error(`Failed to fix bank ${bank.bankName}:`, error);
        results.push({
          bankId: bank.$id,
          bankName: bank.bankName,
          success: false,
          error: error.message
        });
      }
    }

    const successfulFixes = results.filter(r => r.success).length;
    const failedFixes = results.filter(r => !r.success).length;

    console.log(`Fix complete: ${successfulFixes} successful, ${failedFixes} failed`);

    return NextResponse.json({
      success: true,
      message: `Fixed ${successfulFixes} out of ${banksNeedingFix.length} banks`,
      fixedBanks: successfulFixes,
      totalBanks: banks.length,
      results: results
    });

  } catch (error: any) {
    console.error("Fix all banks failed:", error);
    return NextResponse.json({ 
      error: "Failed to fix banks", 
      details: error.message 
    }, { status: 500 });
  }
}
