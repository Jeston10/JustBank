"use client";

import { useState } from "react";
import { Button } from "./ui/button";

interface DwollaCustomerSetupProps {
  userId?: string;
  onSuccess?: () => void;
}

const DwollaCustomerSetup = ({ userId, onSuccess }: DwollaCustomerSetupProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCreateDwollaCustomer = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Use the fix-dwolla-customer endpoint which works with the current session
      const response = await fetch('/api/fix-dwolla-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred',
        message: 'Failed to create Dwolla customer'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Setup Dwolla Customer Account
      </h3>
      
      <p className="text-gray-600 mb-4">
        Your account needs to be set up with Dwolla to enable money transfers. 
        This will create a Dwolla customer account using your personal information.
      </p>

      <div className="mb-4">
        <Button 
          onClick={handleCreateDwollaCustomer}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Creating Dwolla Account..." : "Create Dwolla Customer Account"}
        </Button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${
          result.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 mr-2">
              {result.success ? "✅" : "❌"}
            </span>
            <span className={`font-medium ${
              result.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {result.success ? "Success!" : "Error"}
            </span>
          </div>
          
          <p className={`text-sm ${
            result.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {result.message}
          </p>

          {result.success && result.dwollaCustomerId && (
            <div className="mt-2 text-sm text-green-700">
              <p><strong>Dwolla Customer ID:</strong> {result.dwollaCustomerId}</p>
              <p><strong>Status:</strong> Account created successfully</p>
            </div>
          )}

          {result.error && (
            <div className="mt-2 text-sm text-red-700">
              <p><strong>Error:</strong> {result.error}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">What this does:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Creates a Dwolla customer account using your personal information</li>
          <li>• Enables money transfer functionality</li>
          <li>• Links your bank accounts for transfers</li>
          <li>• Required for sending and receiving money</li>
        </ul>
      </div>
    </div>
  );
};

export default DwollaCustomerSetup;
