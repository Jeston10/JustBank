/* eslint-disable no-prototype-builtins */
import { type ClassValue, clsx } from "clsx";
import qs from "query-string";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// FORMAT DATE TIME
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    month: "short", // abbreviated month name (e.g., 'Oct')
    day: "numeric", // numeric day of the month (e.g., '25')
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const dateDayOptions: Intl.DateTimeFormatOptions = {
    weekday: "short", // abbreviated weekday name (e.g., 'Mon')
    year: "numeric", // numeric year (e.g., '2023')
    month: "2-digit", // abbreviated month name (e.g., 'Oct')
    day: "2-digit", // numeric day of the month (e.g., '25')
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: "short", // abbreviated month name (e.g., 'Oct')
    year: "numeric", // numeric year (e.g., '2023')
    day: "numeric", // numeric day of the month (e.g., '25')
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric", // numeric hour (e.g., '8')
    minute: "numeric", // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };

  const formattedDateTime: string = new Date(dateString).toLocaleString(
    "en-US",
    dateTimeOptions
  );

  const formattedDateDay: string = new Date(dateString).toLocaleString(
    "en-US",
    dateDayOptions
  );

  const formattedDate: string = new Date(dateString).toLocaleString(
    "en-US",
    dateOptions
  );

  const formattedTime: string = new Date(dateString).toLocaleString(
    "en-US",
    timeOptions
  );

  return {
    dateTime: formattedDateTime,
    dateDay: formattedDateDay,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export function formatAmount(amount: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  return formatter.format(amount);
}

export const parseStringify = (value: any) => {
  if (value === undefined || value === null) {
    return null;
  }
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (error) {
    console.error('Error in parseStringify:', error);
    return null;
  }
};

export const removeSpecialCharacters = (value: string) => {
  return value.replace(/[^\w\s]/gi, "");
};

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export function formUrlQuery({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function getAccountTypeColors(type: AccountTypes) {
  switch (type) {
    case "depository":
      return {
        bg: "bg-blue-25",
        lightBg: "bg-blue-100",
        title: "text-blue-900",
        subText: "text-blue-700",
      };

    case "credit":
      return {
        bg: "bg-success-25",
        lightBg: "bg-success-100",
        title: "text-success-900",
        subText: "text-success-700",
      };

    default:
      return {
        bg: "bg-green-25",
        lightBg: "bg-green-100",
        title: "text-green-900",
        subText: "text-green-700",
      };
  }
}

export function countTransactionCategories(
  transactions: Transaction[]
): CategoryCount[] {
  const categoryData: { [category: string]: { count: number; amount: number } } = {};
  let totalCount = 0;

  transactions &&
    transactions.forEach((transaction) => {
      const category = transaction.category;
      if (categoryData.hasOwnProperty(category)) {
        categoryData[category].count++;
        categoryData[category].amount += Math.abs(transaction.amount); // sum absolute values
      } else {
        categoryData[category] = { count: 1, amount: Math.abs(transaction.amount) };
      }
      totalCount++;
    });

  const aggregatedCategories: CategoryCount[] = Object.keys(categoryData).map(
    (category) => ({
      name: category,
      count: categoryData[category].count,
      totalCount,
      amount: categoryData[category].amount,
    })
  );

  aggregatedCategories.sort((a, b) => b.amount - a.amount); // sort by amount

  return aggregatedCategories;
}

export function extractCustomerIdFromUrl(url: string) {
  // Split the URL string by '/'
  const parts = url.split("/");

  // Extract the last part, which represents the customer ID
  const customerId = parts[parts.length - 1];

  return customerId;
}

export function encryptId(id: string) {
  return btoa(id);
}

export function decryptId(id: string) {
  return atob(id);
}

export const getTransactionStatus = (date: Date) => {
  const today = new Date();
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  return date > twoDaysAgo ? "Processing" : "Success";
};

export const authFormSchema = (type: string) => z.object({
  // sign up
  firstName: type === 'sign-in' ? z.string().optional() : z.string().min(3),
  lastName: type === 'sign-in' ? z.string().optional() : z.string().min(3),
  address1: type === 'sign-in' ? z.string().optional() : z.string().max(50),
  city: type === 'sign-in' ? z.string().optional() : z.string().max(50),
  state: type === 'sign-in' ? z.string().optional() : z.string().min(2).max(2),
  postalCode: type === 'sign-in' ? z.string().optional() : z.string().min(3).max(6),
  dateOfBirth: type === 'sign-in' ? z.string().optional() : z.string().min(3),
  ssn: type === 'sign-in' ? z.string().optional() : z.string().min(3),
  // both
  email: z.string().email(),
  password: z.string().min(8),
})

// Validation function for Dwolla configuration
export const validateDwollaConfig = () => {
  // Only check client-accessible environment variables
  // DWOLLA_KEY and DWOLLA_SECRET are server-side only
  const requiredEnvVars = [
    'NEXT_PUBLIC_DWOLLA_ENV' // This should be the client-accessible version
  ];
  
  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    // On client side, we can't access server-side env vars
    // Just check if we have the public environment variable
    const dwollaEnv = process.env.NEXT_PUBLIC_DWOLLA_ENV;
    
    if (!dwollaEnv) {
      console.warn('Dwolla environment not set for client side');
      return {
        isValid: false,
        missingVars: ['NEXT_PUBLIC_DWOLLA_ENV'],
        message: 'Dwolla environment not configured for client side.'
      };
    }
    
    return {
      isValid: true,
      missingVars: [],
      message: 'Dwolla configuration is valid.'
    };
  } else {
    // On server side, check all required variables
    const serverRequiredVars = [
      'DWOLLA_ENV',
      'DWOLLA_KEY', 
      'DWOLLA_SECRET'
    ];
    
    const missingVars = serverRequiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('Missing Dwolla environment variables:', missingVars);
      return {
        isValid: false,
        missingVars,
        message: 'Dwolla is not properly configured. Some features may not work.'
      };
    }
    
    return {
      isValid: true,
      missingVars: [],
      message: 'Dwolla configuration is valid.'
    };
  }
}

// Validation function for funding source URLs
export const validateFundingSourceUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') {
    console.log('validateFundingSourceUrl: Invalid URL type or null/undefined:', url);
    return false;
  }
  
  // Check for placeholder values
  if (url === 'N/A' || url === 'null' || url === 'undefined' || url.trim() === '') {
    console.log('validateFundingSourceUrl: Placeholder or empty value:', url);
    return false;
  }
  
  console.log('validateFundingSourceUrl: Checking URL:', url);
  
  const validPatterns = [
    'https://api-sandbox.dwolla.com/funding-sources/',
    'https://api.dwolla.com/funding-sources/',
    'https://api-sandbox.dwolla.com/funding-sources', // Without trailing slash
    'https://api.dwolla.com/funding-sources' // Without trailing slash
  ];
  
  const isValid = validPatterns.some(pattern => url.startsWith(pattern));
  console.log('validateFundingSourceUrl: URL validation result:', isValid);
  
  return isValid;
}