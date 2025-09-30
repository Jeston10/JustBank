"use client";

import { useState, useEffect } from "react";
import DwollaCustomerSetup from "./DwollaCustomerSetup";

const TransferStatusDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setIsLoading(true);
        
        // Test authentication
        let authTest = { success: false, error: null, user: null };
        try {
          const response = await fetch('/api/test-auth', { method: 'POST' });
          const result = await response.json();
          authTest = result;
        } catch (error) {
          authTest = { success: false, error: error.message };
        }

        // Test accounts
        let accountsTest = { success: false, error: null, accounts: null };
        if (authTest.success && authTest.user) {
          try {
            const response = await fetch('/api/test-accounts', { 
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: authTest.user.id })
            });
            const result = await response.json();
            accountsTest = result;
          } catch (error) {
            accountsTest = { success: false, error: error.message };
          }
        }

        setDiagnostics({
          authTest,
          accountsTest,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        setDiagnostics({ error: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    runDiagnostics();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Running Transfer Status Diagnostics...</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (diagnostics?.error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-4">Diagnostic Error</h3>
        <p className="text-red-600">{diagnostics.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Transfer Status Diagnostics</h3>
      
      {/* Authentication Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Authentication Status:</h4>
        <div className={`p-3 rounded border ${diagnostics?.authTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 mr-2">
              {diagnostics?.authTest?.success ? "✅" : "❌"}
            </span>
            <span className={diagnostics?.authTest?.success ? 'text-green-800' : 'text-red-800'}>
              {diagnostics?.authTest?.success ? 'User is authenticated' : 'User is not authenticated'}
            </span>
          </div>
          {diagnostics?.authTest?.error && (
            <p className="text-red-600 text-sm">{diagnostics.authTest.error}</p>
          )}
          {diagnostics?.authTest?.user && (
            <div className="mt-2 text-sm text-green-700">
              <p>Email: {diagnostics.authTest.user.email}</p>
              <p>Has Dwolla Customer ID: {diagnostics.authTest.user.hasDwollaCustomerId ? "✅" : "❌"}</p>
              <p>Has Dwolla Customer URL: {diagnostics.authTest.user.hasDwollaCustomerUrl ? "✅" : "❌"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Accounts Status */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Bank Accounts Status:</h4>
        <div className={`p-3 rounded border ${diagnostics?.accountsTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 mr-2">
              {diagnostics?.accountsTest?.success ? "✅" : "❌"}
            </span>
            <span className={diagnostics?.accountsTest?.success ? 'text-green-800' : 'text-red-800'}>
              {diagnostics?.accountsTest?.success ? 'Bank accounts found' : 'No bank accounts found'}
            </span>
          </div>
          {diagnostics?.accountsTest?.error && (
            <p className="text-red-600 text-sm">{diagnostics.accountsTest.error}</p>
          )}
          {diagnostics?.accountsTest?.accounts && (
            <div className="mt-2 text-sm text-green-700">
              <p>Number of accounts: {diagnostics.accountsTest.accounts.length}</p>
              {diagnostics.accountsTest.accounts.map((acc: any, index: number) => (
                <div key={index} className="ml-4 mt-1">
                  <p>• {acc.name} - {acc.hasFundingSource ? "✅" : "❌"} Funding Source</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dwolla Customer Setup */}
      {diagnostics?.authTest?.success && !diagnostics?.authTest?.user?.hasDwollaCustomerId && (
        <div className="mb-6">
          <DwollaCustomerSetup 
            onSuccess={() => {
              // Refresh diagnostics after successful setup
              window.location.reload();
            }}
          />
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Why you might not see the transfer button:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {!diagnostics?.authTest?.success && (
            <li>• You need to sign in to your account</li>
          )}
          {diagnostics?.authTest?.success && !diagnostics?.authTest?.user?.hasDwollaCustomerId && (
            <li>• Your account is missing Dwolla customer information (use the setup above)</li>
          )}
          {diagnostics?.authTest?.success && !diagnostics?.accountsTest?.success && (
            <li>• You need to connect a bank account first</li>
          )}
          {diagnostics?.accountsTest?.success && diagnostics?.accountsTest?.accounts?.length === 0 && (
            <li>• You have no bank accounts connected</li>
          )}
          <li>• Check the browser console for detailed error messages</li>
        </ul>
      </div>
    </div>
  );
};

export default TransferStatusDiagnostic;
