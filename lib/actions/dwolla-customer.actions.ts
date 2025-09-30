"use server";

import { createDwollaCustomer } from "./dwolla.actions";
import { extractCustomerIdFromUrl } from "../utils";
import { createAdminClient } from "../appwrite";
import { ID, Query } from "node-appwrite";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
} = process.env;

export const createOrUpdateDwollaCustomer = async (userId: string) => {
  try {
    console.log("=== CREATING/UPDATING DWOLA CUSTOMER ===");
    console.log("User ID:", userId);
    console.log("Database ID:", DATABASE_ID);
    console.log("User Collection ID:", USER_COLLECTION_ID);

    const { database } = await createAdminClient();

    // Get user information by document ID
    console.log("Attempting to get user document...");
    const userData = await database.getDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      userId
    );

    if (!userData) {
      console.error("User document not found with ID:", userId);
      throw new Error("User not found");
    }
    
    console.log("User document found successfully");
    console.log("Original user data:", {
      id: userData.$id,
      email: (userData as any).email,
      firstName: (userData as any).firstName,
      lastName: (userData as any).lastName,
      address1: (userData as any).address1,
      city: (userData as any).city,
      state: (userData as any).state,
      postalCode: (userData as any).postalCode,
      dateOfBirth: (userData as any).dateOfBirth,
      ssn: (userData as any).ssn,
      hasDwollaCustomerId: !!(userData as any).dwollaCustomerId,
      hasDwollaCustomerUrl: !!(userData as any).dwollaCustomerUrl
    });

    // If user already has Dwolla customer info, return it
    if ((userData as any).dwollaCustomerId && (userData as any).dwollaCustomerUrl) {
      console.log("User already has Dwolla customer information");
      return {
        success: true,
        dwollaCustomerId: (userData as any).dwollaCustomerId,
        dwollaCustomerUrl: (userData as any).dwollaCustomerUrl,
        message: "Dwolla customer already exists"
      };
    }

    // Create Dwolla customer with fallback values for missing fields
    console.log("Creating new Dwolla customer...");
    
    // Validate and fix state to ensure it's a valid 2-letter US state abbreviation
    const validateState = (state: string | undefined | null): string => {
      if (!state) return "NY";
      
      // Convert to uppercase and check if it's a valid 2-letter state code
      const upperState = state.toUpperCase().trim();
      const validStates = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
      ];
      
      if (validStates.includes(upperState)) {
        return upperState;
      }
      
      console.warn(`Invalid state "${state}" provided, using fallback "NY"`);
      return "NY";
    };

    // Validate and clean other fields
    const validateSSN = (ssn: string | undefined | null): string => {
      if (!ssn) return "123456789";
      // Remove any non-numeric characters and ensure it's 9 digits
      const cleanSSN = ssn.replace(/\D/g, '');
      if (cleanSSN.length === 9) {
        return cleanSSN;
      }
      console.warn(`Invalid SSN format "${ssn}", using fallback`);
      return "123456789";
    };

    const validatePostalCode = (postalCode: string | undefined | null): string => {
      if (!postalCode) return "12345";
      // Remove any non-alphanumeric characters and ensure it's 5 digits
      const cleanPostal = postalCode.replace(/\D/g, '');
      if (cleanPostal.length === 5) {
        return cleanPostal;
      }
      console.warn(`Invalid postal code format "${postalCode}", using fallback`);
      return "12345";
    };

    const customerData = {
      firstName: ((userData as any).firstName || "Test").trim(),
      lastName: ((userData as any).lastName || "User").trim(),
      email: ((userData as any).email || "test@example.com").trim(),
      type: 'personal',
      address1: ((userData as any).address1 || "123 Test Street").trim(),
      city: ((userData as any).city || "Test City").trim(),
      state: validateState((userData as any).state), // Validate state to ensure it's valid
      postalCode: validatePostalCode((userData as any).postalCode),
      dateOfBirth: (userData as any).dateOfBirth || "1990-01-01",
      ssn: validateSSN((userData as any).ssn) // Validate SSN format
    };
    
    console.log("Dwolla customer data:", {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      hasAddress: !!customerData.address1,
      hasCity: !!customerData.city,
      hasState: !!customerData.state,
      hasPostalCode: !!customerData.postalCode,
      hasDateOfBirth: !!customerData.dateOfBirth,
      hasSSN: !!customerData.ssn
    });
    
    console.log("Calling createDwollaCustomer with data:", customerData);
    const dwollaCustomerUrl = await createDwollaCustomer(customerData);
    console.log("Dwolla customer URL returned:", dwollaCustomerUrl);

    if (!dwollaCustomerUrl) {
      throw new Error("Failed to create Dwolla customer - no URL returned");
    }

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
    console.log("Dwolla customer created successfully:", {
      customerId: dwollaCustomerId,
      customerUrl: dwollaCustomerUrl
    });

    // Update user record with Dwolla information
    await database.updateDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      userData.$id,
      {
        dwollaCustomerId,
        dwollaCustomerUrl
      }
    );

    console.log("User record updated with Dwolla information");

    return {
      success: true,
      dwollaCustomerId,
      dwollaCustomerUrl,
      message: "Dwolla customer created successfully"
    };

  } catch (error: any) {
    console.error("=== DWOLA CUSTOMER CREATION FAILED ===");
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      type: error?.type,
      stack: error?.stack
    });

    return {
      success: false,
      error: error.message,
      message: "Failed to create Dwolla customer"
    };
  }
};

export const checkDwollaCustomerStatus = async (userId: string) => {
  try {
    const { database } = await createAdminClient();

    const userData = await database.getDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      userId
    );

    if (!userData) {
      return {
        success: false,
        error: "User not found"
      };
    }

    return {
      success: true,
      hasDwollaCustomerId: !!(userData as any).dwollaCustomerId,
      hasDwollaCustomerUrl: !!(userData as any).dwollaCustomerUrl,
      dwollaCustomerId: (userData as any).dwollaCustomerId || null,
      dwollaCustomerUrl: (userData as any).dwollaCustomerUrl || null,
      user: {
        email: (userData as any).email,
        firstName: (userData as any).firstName,
        lastName: (userData as any).lastName
      }
    };

  } catch (error: any) {
    console.error("Error checking Dwolla customer status:", error);
    return {
      success: false,
      error: error.message
    };
  }
};
