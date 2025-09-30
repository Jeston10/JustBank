import { NextRequest, NextResponse } from 'next/server';
import { createOrUpdateDwollaCustomer } from '@/lib/actions/dwolla-customer.actions';

export async function POST(request: NextRequest) {
  try {
    console.log("=== API: CREATE DWOLA CUSTOMER ===");
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: "User ID is required"
      });
    }

    const result = await createOrUpdateDwollaCustomer(userId);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API: Create Dwolla customer failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to create Dwolla customer"
    });
  }
}
