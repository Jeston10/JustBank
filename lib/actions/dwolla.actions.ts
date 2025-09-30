"use server";

import { Client } from "dwolla-v2";

const getEnvironment = (): "production" | "sandbox" => {
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case "sandbox":
      return "sandbox";
    case "production":
      return "production";
    default:
      throw new Error(
        "Dwolla environment should either be set to `sandbox` or `production`"
      );
  }
};

// Validate Dwolla configuration
const validateDwollaConfig = () => {
  const key = process.env.DWOLLA_KEY;
  const secret = process.env.DWOLLA_SECRET;
  const env = process.env.DWOLLA_ENV;

  if (!key || !secret || !env) {
    throw new Error(`Missing Dwolla configuration: key=${!!key}, secret=${!!secret}, env=${!!env}`);
  }

  console.log("Dwolla configuration:", {
    environment: env,
    hasKey: !!key,
    hasSecret: !!secret,
    keyLength: key?.length,
    secretLength: secret?.length
  });
};

validateDwollaConfig();

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions
) => {
  try {
    console.log("=== CREATING DWOLA FUNDING SOURCE ===");
    console.log("Funding source options:", {
      customerId: options.customerId,
      fundingSourceName: options.fundingSourceName,
      hasPlaidToken: !!options.plaidToken,
      plaidTokenLength: options.plaidToken?.length
    });

    const response = await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      });

    const location = response.headers.get("location");
    
    console.log("Dwolla funding source creation response:", {
      status: response.status,
      location: location,
      hasLocation: !!location
    });

    if (!location) {
      throw new Error("Dwolla funding source creation succeeded but no location header returned");
    }

    console.log("=== FUNDING SOURCE CREATED SUCCESSFULLY ===");
    return location;
  } catch (err: any) {
    console.error("=== CREATING FUNDING SOURCE FAILED ===");
    console.error("Error details:", {
      message: err?.message,
      status: err?.status,
      body: err?.body,
      headers: err?.headers
    });
    
    // Enhanced error handling
    if (err?.status === 403) {
      throw new Error("Plaid processor token is invalid or expired. Please reconnect your bank account.");
    } else if (err?.status === 400) {
      throw new Error("Invalid funding source request. Please check your bank account details.");
    } else if (err?.status === 401) {
      throw new Error("Dwolla authentication failed. Please check your Dwolla configuration.");
    } else if (err?.status === 404) {
      throw new Error("Dwolla customer not found. Please verify your account setup.");
    }
    
    throw err;
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    // Check if we have a pre-generated ODA token
    const odaToken = process.env.DWOLLA_ODA_TOKEN;
    
    if (odaToken) {
      console.log("Using pre-generated ODA token");
      return {
        "on-demand-authorization": {
          "href": `https://api-sandbox.dwolla.com/on-demand-authorizations/${odaToken}`
        }
      };
    }
    
    // Fallback to creating a new ODA token
    console.log("Creating new ODA token");
    const onDemandAuthorization = await dwollaClient.post(
      "on-demand-authorizations"
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    console.error("Creating an On Demand Authorization Failed: ", err);
    throw err;
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams
) => {
  try {
    console.log("=== CREATING DWOLA CUSTOMER ===");
    console.log("Customer data:", {
      firstName: newCustomer.firstName,
      lastName: newCustomer.lastName,
      email: newCustomer.email,
      type: newCustomer.type,
      hasAddress: !!newCustomer.address1,
      hasCity: !!newCustomer.city,
      hasState: !!newCustomer.state,
      hasPostalCode: !!newCustomer.postalCode,
      hasDateOfBirth: !!newCustomer.dateOfBirth,
      hasSSN: !!newCustomer.ssn
    });

    const response = await dwollaClient.post("customers", newCustomer);
    const location = response.headers.get("location");
    
    console.log("Dwolla customer creation response:", {
      status: response.status,
      location: location,
      hasLocation: !!location
    });

    if (!location) {
      throw new Error("Dwolla customer creation succeeded but no location header returned");
    }

    return location;
  } catch (err: any) {
    console.error("=== DWOLA CUSTOMER CREATION FAILED ===");
    console.error("Error details:", {
      message: err?.message,
      status: err?.status,
      body: err?.body,
      headers: err?.headers
    });
    throw err; // Re-throw the error so it can be handled upstream
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    console.log("=== DWOLLA TRANSFER REQUEST STARTED ===");
    console.log("Transfer parameters:", {
      sourceFundingSourceUrl: sourceFundingSourceUrl?.substring(0, 50) + "...",
      destinationFundingSourceUrl: destinationFundingSourceUrl?.substring(0, 50) + "...",
      amount
    });

    // Validate input parameters
    if (!sourceFundingSourceUrl || !destinationFundingSourceUrl || !amount) {
      const error = new Error("Missing required transfer parameters");
      console.error("Validation failed:", { sourceFundingSourceUrl: !!sourceFundingSourceUrl, destinationFundingSourceUrl: !!destinationFundingSourceUrl, amount });
      throw error;
    }

    // Validate amount format
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      const error = new Error("Invalid transfer amount");
      console.error("Invalid amount:", amount);
      throw error;
    }

    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: "USD",
        value: amount,
      },
    };
    
    console.log("Dwolla transfer request body:", JSON.stringify(requestBody, null, 2));
    
    const response = await dwollaClient.post("transfers", requestBody);
    const transferLocation = response.headers.get("location");
    
    if (!transferLocation) {
      const error = new Error("No transfer location returned from Dwolla");
      console.error("No transfer location in response headers");
      throw error;
    }

    console.log("Dwolla transfer created successfully:", transferLocation);
    console.log("=== DWOLLA TRANSFER REQUEST COMPLETED ===");
    
    return transferLocation;
  } catch (err: any) {
    console.error("=== DWOLLA TRANSFER REQUEST FAILED ===");
    
    // Log detailed error information
    if (err?.body) {
      console.error("Dwolla error body:", JSON.stringify(err.body, null, 2));
    }
    if (err?.status) {
      console.error("Dwolla error status:", err.status);
    }
    if (err?.message) {
      console.error("Dwolla error message:", err.message);
    }
    
    console.error("Full Dwolla error:", err);
    
    // Enhance error with more context
    let enhancedError = err;
    if (err?.body?.message) {
      enhancedError.message = `Dwolla API Error: ${err.body.message}`;
    } else if (err?.status === 400) {
      enhancedError.message = "Invalid transfer request. Please check your account details.";
    } else if (err?.status === 401) {
      enhancedError.message = "Authentication failed. Please check your Dwolla configuration.";
    } else if (err?.status === 403) {
      enhancedError.message = "Transfer not authorized. Please check your account permissions.";
    } else if (err?.status === 404) {
      enhancedError.message = "Account not found. Please verify the recipient's account information.";
    } else if (err?.status >= 500) {
      enhancedError.message = "Dwolla service temporarily unavailable. Please try again later.";
    }
    
    throw enhancedError;
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    console.error("Transfer fund failed: ", err);
  }
};
