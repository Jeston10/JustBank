import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/appwrite';

export async function POST(request: NextRequest) {
  try {
    console.log("=== TESTING APPWRITE CONNECTION ===");
    
    // Check environment variables
    const envCheck = {
      hasEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      hasProjectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      hasApiKey: !!process.env.APPWRITE_API_KEY,
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "MISSING",
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "MISSING",
      apiKey: process.env.APPWRITE_API_KEY ? "SET" : "MISSING"
    };

    console.log("Environment check:", envCheck);

    if (!envCheck.hasEndpoint || !envCheck.hasProjectId || !envCheck.hasApiKey) {
      return NextResponse.json({
        success: false,
        error: "Missing required environment variables",
        envCheck
      });
    }

    // Test Appwrite connection
    const { database } = await createAdminClient();
    
    // Try to list databases to test connection
    const databases = await database.list();
    
    console.log("Appwrite connection successful");
    
    return NextResponse.json({
      success: true,
      message: "Appwrite connection successful",
      databasesCount: databases.total,
      envCheck
    });

  } catch (error: any) {
    console.error("Appwrite connection test failed:", error);
    
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
