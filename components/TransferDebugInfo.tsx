"use client";

import { useState, useEffect } from "react";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { getAccounts } from "@/lib/actions/bank.actions";
import { validateDwollaConfig } from "@/lib/utils";

interface TransferDebugInfoProps {
  className?: string;
}

const TransferDebugInfo = ({ className = "" }: TransferDebugInfoProps) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setIsLoading(true);
        
        // Get user info
        const user = await getLoggedInUser();
        
        // Get accounts
        const accounts = user ? await getAccounts({ userId: user.$id }) : null;
        
        // Check Dwolla config
        const dwollaConfig = validateDwollaConfig();
        
        // Check environment variables (client-side safe ones)
        const envInfo = {
          hasDwollaEnv: !!process.env.NEXT_PUBLIC_DWOLLA_ENV,
          hasPlaidEnv: !!process.env.NEXT_PUBLIC_PLAID_ENV,
        };

        setDebugInfo({
          user: user ? {
            id: user.$id,
            email: user.email,
            hasDwollaCustomerId: !!user.dwollaCustomerId,
            hasDwollaCustomerUrl: !!user.dwollaCustomerUrl,
          } : null,
          accounts: accounts?.data ? {
            count: accounts.data.length,
            accounts: accounts.data.map((acc: any) => ({
              id: acc.id,
              name: acc.name,
              appwriteItemId: acc.appwriteItemId,
              shareableId: acc.shareableId,
              hasFundingSource: acc.fundingSourceUrl !== "N/A",
            }))
          } : null,
          dwollaConfig,
          envInfo,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Failed to fetch debug info:", error);
        setDebugInfo({ error: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDebugInfo();
  }, []);

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
        <p>Loading debug information...</p>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-gray-100 rounded-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Transfer Debug Information
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          {isExpanded ? "Hide" : "Show"} Details
        </button>
      </div>

      {debugInfo?.error ? (
        <div className="text-red-600">
          <p><strong>Error:</strong> {debugInfo.error}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* User Info */}
          <div>
            <h4 className="font-medium text-gray-700">User Status:</h4>
            {debugInfo?.user ? (
              <div className="ml-4 text-sm">
                <p>✅ User logged in: {debugInfo.user.email}</p>
                <p>{debugInfo.user.hasDwollaCustomerId ? "✅" : "❌"} Dwolla Customer ID</p>
                <p>{debugInfo.user.hasDwollaCustomerUrl ? "✅" : "❌"} Dwolla Customer URL</p>
              </div>
            ) : (
              <p className="ml-4 text-sm text-red-600">❌ No user logged in</p>
            )}
          </div>

          {/* Accounts Info */}
          <div>
            <h4 className="font-medium text-gray-700">Bank Accounts:</h4>
            {debugInfo?.accounts ? (
              <div className="ml-4 text-sm">
                <p>📊 Total accounts: {debugInfo.accounts.count}</p>
                {debugInfo.accounts.accounts.map((acc: any, index: number) => (
                  <div key={index} className="ml-4 mt-1 p-2 bg-white rounded border">
                    <p><strong>{acc.name}</strong></p>
                    <p>ID: {acc.id}</p>
                    <p>Shareable ID: {acc.shareableId}</p>
                    <p>{acc.hasFundingSource ? "✅" : "❌"} Funding Source</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ml-4 text-sm text-red-600">❌ No accounts found</p>
            )}
          </div>

          {/* Dwolla Config */}
          <div>
            <h4 className="font-medium text-gray-700">Dwolla Configuration:</h4>
            <div className="ml-4 text-sm">
              <p>{debugInfo?.dwollaConfig?.isValid ? "✅" : "❌"} Configuration Valid</p>
              {!debugInfo?.dwollaConfig?.isValid && (
                <p className="text-red-600">
                  Missing: {debugInfo?.dwollaConfig?.missingVars?.join(", ")}
                </p>
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="mt-4 p-3 bg-white rounded border">
              <h4 className="font-medium text-gray-700 mb-2">Raw Debug Data:</h4>
              <pre className="text-xs overflow-auto max-h-64 bg-gray-50 p-2 rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}

          {/* Troubleshooting Tips */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• If Dwolla config is invalid, check your environment variables</li>
              <li>• If no funding source, reconnect your bank account</li>
              <li>• If no accounts, add a bank account first</li>
              <li>• Check browser console for detailed error logs</li>
              <li>• Ensure both sender and receiver have valid bank accounts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferDebugInfo;
