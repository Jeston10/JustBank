import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { createFundingSource } from '@/lib/actions/dwolla.actions';
import { createAdminClient } from '@/lib/appwrite';
import { ID, Query } from 'node-appwrite';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export async function POST(request: NextRequest) {
  try {
    console.log("=== CREATE FUNDING SOURCE API ===");
    
    const loggedInUser = await getLoggedInUser();
    
    if (!loggedInUser) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { bankId } = await request.json();
    
    if (!bankId) {
      return NextResponse.json({ error: "Bank ID is required" }, { status: 400 });
    }

    console.log("Creating funding source for bank:", bankId);

    // Get the bank account
    const { database } = await createAdminClient();
    const bank = await database.getDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      bankId
    );

    if (!bank) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    // Check if user owns this bank account
    if (bank.userId !== loggedInUser.$id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if funding source already exists
    if (bank.fundingSourceUrl) {
      return NextResponse.json({ 
        success: true, 
        message: "Funding source already exists",
        fundingSourceUrl: bank.fundingSourceUrl 
      });
    }

    // Check if user has Dwolla customer ID
    if (!loggedInUser.dwollaCustomerId) {
      return NextResponse.json({ 
        error: "User does not have Dwolla customer ID. Please create Dwolla customer first." 
      }, { status: 400 });
    }

    // Check if we have a valid processor token, if not try to create one
    let processorToken = bank.plaidProcessorToken;
    
    if (!processorToken && bank.accessToken) {
      console.log("No processor token found, creating new one from access token");
      
      try {
        // Create processor token using Plaid API
        const plaidResponse = await fetch('https://production.plaid.com/processor/token/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
            'PLAID-SECRET': process.env.PLAID_SECRET!,
          },
          body: JSON.stringify({
            access_token: bank.accessToken,
            account_id: bank.accountId,
            processor: 'dwolla'
          })
        });

        if (!plaidResponse.ok) {
          const errorData = await plaidResponse.json();
          console.error("Failed to create processor token:", errorData);
          return NextResponse.json({ 
            error: `Failed to create processor token: ${errorData.error_message || 'Unknown error'}. Please reconnect the bank account.` 
          }, { status: 400 });
        }

        const plaidData = await plaidResponse.json();
        processorToken = plaidData.processor_token;
        
        // Update bank with new processor token
        await database.updateDocument(
          DATABASE_ID!,
          BANK_COLLECTION_ID!,
          bankId,
          { plaidProcessorToken: processorToken }
        );
        
        console.log("Processor token created and saved successfully");
      } catch (error: any) {
        console.error("Error creating processor token:", error);
        return NextResponse.json({ 
          error: `Failed to create processor token: ${error.message}. Please reconnect the bank account.` 
        }, { status: 400 });
      }
    }
    
    if (!processorToken) {
      return NextResponse.json({ 
        error: "Bank account missing Plaid processor token and access token. Please reconnect the bank account." 
      }, { status: 400 });
    }

    console.log("Creating funding source with:", {
      customerId: loggedInUser.dwollaCustomerId,
      bankName: bank.bankName,
      accountId: bank.accountId,
      hasProcessorToken: !!processorToken
    });

    const fundingSourceUrl = await createFundingSource({
      customerId: loggedInUser.dwollaCustomerId,
      fundingSourceName: `${bank.bankName} - ${bank.accountType}`,
      plaidToken: processorToken
    });

    if (!fundingSourceUrl) {
      return NextResponse.json({ 
        error: "Failed to create funding source" 
      }, { status: 500 });
    }

    // Update the bank account with the funding source URL
    const updatedBank = await database.updateDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      bankId,
      {
        fundingSourceUrl: fundingSourceUrl
      }
    );

    console.log("Funding source created successfully:", {
      bankId: bankId,
      fundingSourceUrl: fundingSourceUrl
    });

    return NextResponse.json({
      success: true,
      message: "Funding source created successfully",
      fundingSourceUrl: fundingSourceUrl,
      bank: {
        id: updatedBank.$id,
        bankName: updatedBank.bankName,
        accountType: updatedBank.accountType,
        fundingSourceUrl: updatedBank.fundingSourceUrl
      }
    });

  } catch (error: any) {
    console.error("API Error creating funding source:", error);
    return NextResponse.json({ 
      error: "Failed to create funding source", 
      details: error.message 
    }, { status: 500 });
  }
}
