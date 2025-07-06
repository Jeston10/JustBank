'use server';

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";

import { plaidClient } from '@/lib/plaid';
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: getUserInfoProps) => {
  try {
    // Validate userId before making the query
    if (!userId || userId.trim() === '') {
      console.log('Invalid userId provided to getUserInfo:', userId);
      return null;
    }

    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    )

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log('Error in getUserInfo:', error);
    return null;
  }
}

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);
    console.log('Session created successfully:', session.userId);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId })
    console.log('User info retrieved:', user);

    if (!user) {
      console.log('User not found in database, checking if user exists in Appwrite...');
      // Try to get user directly from Appwrite
      try {
        const appwriteUser = await account.get();
        console.log('Appwrite user exists:', appwriteUser);
        throw new Error('User exists in Appwrite but not in database. Please sign up again.');
      } catch (appwriteError) {
        console.log('Appwrite user check failed:', appwriteError);
        throw new Error('User not found. Please check your credentials or sign up.');
      }
    }

    return parseStringify(user);
  } catch (error: any) {
    console.log('Sign in error:', error);
    
    // Handle specific Appwrite errors
    if (error.code === 401) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }
    
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An error occurred during sign in. Please try again.');
  }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  const { email, firstName, lastName } = userData;
  
  let newUserAccount;

  try {
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(), 
      email, 
      password, 
      `${firstName} ${lastName}`
    );

    if(!newUserAccount) throw new Error('Error creating user')

    // Try to create Dwolla customer, but don't fail if it doesn't work
    let dwollaCustomerUrl = null;
    let dwollaCustomerId = null;
    
    try {
      dwollaCustomerUrl = await createDwollaCustomer({
        ...userData,
        type: 'personal'
      });

      if(dwollaCustomerUrl) {
        dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
      }
    } catch (dwollaError) {
      console.log('Dwolla customer creation failed (this is okay for development):', dwollaError);
      // Continue without Dwolla for now
    }

    const newUser = await database.createDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId: dwollaCustomerId || "",
        dwollaCustomerUrl: dwollaCustomerUrl || ""
      }
    )

    console.log('Creating session...');
    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();
    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    console.log('Sign up completed successfully');
    return parseStringify(newUser);
  } catch (error: any) {
    console.error('Sign up error:', error);
    
    // Handle specific Appwrite errors
    if (error.code === 409) {
      throw new Error('A user with this email already exists. Please try signing in instead.');
    }
    
    // Handle other errors
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An error occurred during sign up. Please try again.');
  }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const result = await account.get();

    const user = await getUserInfo({ userId: result.$id})

    return parseStringify(user);
  } catch (error) {
    console.log(error)
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    const cookieStore = await cookies();
    cookieStore.delete('appwrite-session');

    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    }

    const response = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: response.data.link_token })
  } catch (error) {
    console.log(error);
  }
}

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId,
}: createBankAccountProps) => {
  try {
    if (!userId) {
      console.warn('[createBankAccount] No userId provided! Aborting.');
      return null;
    }
    console.log('[createBankAccount] Creating bank account with data:', {
      userId,
      bankId,
      accountId,
      accessToken: accessToken ? '***' : 'MISSING',
      fundingSourceUrl,
      shareableId,
    });

    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl: fundingSourceUrl || "N/A",
        shareableId,
      }
    )

    console.log('[createBankAccount] Bank account created successfully:', bankAccount.$id);
    return parseStringify(bankAccount);
  } catch (error) {
    console.error('[createBankAccount] Error creating bank account:', error);
    return null;
  }
}

export const exchangePublicToken = async ({
  publicToken,
  user,
}: exchangePublicTokenProps) => {
  try {
    console.log('[exchangePublicToken] Called with user:', user);
    if (!user || !user.$id) {
      console.warn('[exchangePublicToken] No user or user.$id provided! Aborting.');
      return;
    }
    // Exchange public token for access token and item ID
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    console.log('[exchangePublicToken] Got accessToken and itemId:', accessToken ? '***' : 'MISSING', itemId);
    // Get account information from Plaid using the access token
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountsResponse.data.accounts[0];
    console.log('[exchangePublicToken] accountData:', accountData);

    // Create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });
    console.log('[exchangePublicToken] fundingSourceUrl:', fundingSourceUrl);

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl: fundingSourceUrl || "N/A",
      shareableId: encryptId(accountData.account_id),
    });

    // Revalidate the path to reflect the changes
    revalidatePath("/");

    // Return a success message
    return parseStringify({
      publicTokenExchange: "complete",
    });
  } catch (error) {
    console.error("[exchangePublicToken] An error occurred while exchanging token:", error);
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  try {
    if (!userId) {
      console.warn('[getBanks] No userId provided! Aborting.');
      return [];
    }
    // Validate userId before making the query
    if (!userId || userId.trim() === '') {
      console.log('[getBanks] Invalid userId provided to getBanks:', userId);
      return [];
    }

    console.log('[getBanks] Fetching banks for userId:', userId);

    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    )

    console.log(`[getBanks] Found ${banks.total} banks for user ${userId}:`, banks.documents.map(b => ({ id: b.$id, accountId: b.accountId })));
    return parseStringify(banks.documents);
  } catch (error) {
    console.log('[getBanks] Error in getBanks:', error);
    return [];
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    // Validate documentId before making the query
    if (!documentId || documentId.trim() === '') {
      console.log('Invalid documentId provided to getBank:', documentId);
      return null;
    }

    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('$id', documentId)]
    )

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log('Error in getBank:', error);
    return null;
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    // Validate accountId before making the query
    if (!accountId || accountId.trim() === '') {
      console.log('Invalid accountId provided to getBankByAccountId:', accountId);
      return null;
    }

    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('accountId', accountId)]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log('Error in getBankByAccountId:', error);
    return null;
  }
}