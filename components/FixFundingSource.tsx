'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface BankAccount {
  $id: string;
  bankName: string;
  accountType: string;
  accountId: string;
  fundingSourceUrl?: string;
  plaidProcessorToken?: string;
}

interface FixFundingSourceProps {
  banks: BankAccount[];
  onSuccess?: () => void;
}

const FixFundingSource = ({ banks, onSuccess }: FixFundingSourceProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const fixBankFundingSource = async (bankId: string) => {
    setLoading(bankId);
    setResults(prev => ({ ...prev, [bankId]: null }));

    try {
      const response = await fetch('/api/create-funding-source', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bankId }),
      });

      const data = await response.json();
      setResults(prev => ({ ...prev, [bankId]: data }));

      if (data.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [bankId]: { 
          success: false, 
          error: 'Network error occurred' 
        } 
      }));
    } finally {
      setLoading(null);
    }
  };

  const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
  const banksWithFundingSource = banks.filter(bank => bank.fundingSourceUrl);

  if (banksNeedingFix.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded p-4">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <h3 className="font-semibold text-green-800">All Bank Accounts Ready</h3>
        </div>
        <p className="text-sm text-green-700 mt-1">
          All your bank accounts have funding sources and are ready for transfers.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
      <div className="flex items-center mb-4">
        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
        <h3 className="font-semibold text-yellow-800">Fix Bank Account Funding Sources</h3>
      </div>
      
      <p className="text-sm text-yellow-700 mb-4">
        Some of your bank accounts are missing funding sources. Click the buttons below to create them.
      </p>

      <div className="space-y-3">
        {banksNeedingFix.map((bank) => (
          <div key={bank.$id} className="bg-white p-3 rounded border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-800">
                  {bank.bankName} - {bank.accountType}
                </h4>
                <p className="text-sm text-gray-600">
                  Account ID: {bank.accountId.substring(0, 8)}...
                </p>
                {!bank.plaidProcessorToken && (
                  <p className="text-sm text-red-600">
                    ⚠️ Missing Plaid processor token - may need to reconnect
                  </p>
                )}
              </div>
              
              <Button
                onClick={() => fixBankFundingSource(bank.$id)}
                disabled={loading === bank.$id}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                {loading === bank.$id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Funding Source'
                )}
              </Button>
            </div>

            {results[bank.$id] && (
              <div className="mt-2 p-2 rounded text-sm">
                {results[bank.$id].success ? (
                  <div className="text-green-700 bg-green-50 p-2 rounded">
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    {results[bank.$id].message}
                  </div>
                ) : (
                  <div className="text-red-700 bg-red-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    {results[bank.$id].error}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {banksWithFundingSource.length > 0 && (
        <div className="mt-4 pt-4 border-t border-yellow-300">
          <h4 className="font-medium text-yellow-800 mb-2">Ready for Transfers:</h4>
          <div className="space-y-1">
            {banksWithFundingSource.map((bank) => (
              <div key={bank.$id} className="text-sm text-green-700">
                ✅ {bank.bankName} - {bank.accountType}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FixFundingSource;
