import { NextRequest, NextResponse } from 'next/server';
import { getLoggedInUser } from '@/lib/actions/user.actions';

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTING AUTHENTICATION ===");
    
    const user = await getLoggedInUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: "User not authenticated or not found in database"
      });
    }

    console.log("Authentication test successful:", {
      id: user.$id,
      email: user.email,
      hasDwollaCustomerId: !!user.dwollaCustomerId,
      hasDwollaCustomerUrl: !!user.dwollaCustomerUrl
    });

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.$id,
        email: user.email,
        hasDwollaCustomerId: !!user.dwollaCustomerId,
        hasDwollaCustomerUrl: !!user.dwollaCustomerUrl
      }
    });

  } catch (error: any) {
    console.error("Authentication test failed:", error);
    
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
