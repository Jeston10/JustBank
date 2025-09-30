import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { createOrUpdateDwollaCustomer } from '@/lib/actions/dwolla-customer.actions';

export async function POST(request: NextRequest) {
  try {
    console.log("=== API: FIX DWOLA CUSTOMER ===");
    
    // Get the current logged-in user
    const user = await getLoggedInUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not authenticated"
      });
    }

    console.log("Current user:", {
      id: user.$id,
      email: user.email,
      hasDwollaCustomerId: !!user.dwollaCustomerId,
      hasDwollaCustomerUrl: !!user.dwollaCustomerUrl
    });

    // If user already has Dwolla customer info, return it
    if (user.dwollaCustomerId && user.dwollaCustomerUrl) {
      return NextResponse.json({
        success: true,
        message: "Dwolla customer already exists",
        dwollaCustomerId: user.dwollaCustomerId,
        dwollaCustomerUrl: user.dwollaCustomerUrl
      });
    }

    // Create Dwolla customer using the user's Appwrite ID
    const result = await createOrUpdateDwollaCustomer(user.$id);
    
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("API: Fix Dwolla customer failed:", error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Failed to fix Dwolla customer"
    });
  }
}
