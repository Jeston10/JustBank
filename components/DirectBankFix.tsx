'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Wrench, CheckCircle, AlertCircle } from 'lucide-react';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks, updateBank } from '@/lib/actions/user.actions';
import { createFundingSource } from '@/lib/actions/dwolla.actions';
import { createAdminClient } from '@/lib/appwrite';

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export default function DirectBankFix() {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [step, setStep] = useState('');

  const fixAllBanksDirectly = async () => {
    setFixing(true);
    setResult(null);
    setStep('Getting user data...');

    try {
      // Step 1: Get user data
      const user = await getLoggedInUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!user.dwollaCustomerId) {
        throw new Error('User does not have Dwolla customer ID. Please create Dwolla customer first.');
      }

      setStep('Getting bank accounts...');

      // Step 2: Get bank accounts
      const banks = await getBanks({ userId: user.$id });

      if (banks.length === 0) {
        throw new Error('No bank accounts found');
      }

      const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
      
      if (banksNeedingFix.length === 0) {
        setResult({
          success: true,
          message: 'All banks already have funding sources',
          fixedBanks: 0,
          totalBanks: banks.length
        });
        return;
      }

      setStep(`Fixing ${banksNeedingFix.length} bank accounts...`);

      // Step 3: Create admin client
      const { database } = await createAdminClient();
      const results = [];

      // Step 4: Fix each bank
      for (let i = 0; i < banksNeedingFix.length; i++) {
        const bank = banksNeedingFix[i];
        setStep(`Fixing bank ${i + 1}/${banksNeedingFix.length}: ${bank.bankName}`);

        try {
          if (!bank.plaidProcessorToken) {
            results.push({
              bankId: bank.$id,
              bankName: bank.bankName,
              success: false,
              error: "Missing Plaid processor token - bank needs to be reconnected"
            });
            continue;
          }

          // Create funding source
          const fundingSourceUrl = await createFundingSource({
            customerId: user.dwollaCustomerId,
            fundingSourceName: `${bank.bankName} - ${bank.accountType}`,
            plaidToken: bank.plaidProcessorToken
          });

          if (!fundingSourceUrl) {
            results.push({
              bankId: bank.$id,
              bankName: bank.bankName,
              success: false,
              error: "Failed to create funding source"
            });
            continue;
          }

          // Update bank record
          await database.updateDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            bank.$id,
            {
              fundingSourceUrl: fundingSourceUrl
            }
          );

          results.push({
            bankId: bank.$id,
            bankName: bank.bankName,
            success: true,
            fundingSourceUrl: fundingSourceUrl
          });

        } catch (error: any) {
          results.push({
            bankId: bank.$id,
            bankName: bank.bankName,
            success: false,
            error: error.message
          });
        }
      }

      const successfulFixes = results.filter(r => r.success).length;
      const failedFixes = results.filter(r => !r.success).length;

      setResult({
        success: true,
        message: `Fixed ${successfulFixes} out of ${banksNeedingFix.length} banks`,
        fixedBanks: successfulFixes,
        totalBanks: banks.length,
        results: results
      });

      setStep('Fix completed!');

      // Refresh the page after successful fix
      if (successfulFixes > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      });
      setStep('');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">
            🔧 Direct Bank Fix (No API Required)
          </h3>
          <p className="text-sm text-yellow-700">
            This fix works directly in your browser session and doesn't require API authentication.
          </p>
          {step && (
            <p className="text-sm text-blue-600 mt-1">
              {step}
            </p>
          )}
        </div>
        
        <Button
          onClick={fixAllBanksDirectly}
          disabled={fixing}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {fixing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Fixing...
            </>
          ) : (
            <>
              <Wrench className="h-4 w-4 mr-2" />
              Fix All Banks
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-3 p-3 rounded">
          {result.success ? (
            <div className="text-green-700 bg-green-50 p-3 rounded">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                <p className="font-medium">✅ Fix Successful!</p>
              </div>
              <p className="text-sm mb-2">
                {result.message}
              </p>
              {result.fixedBanks > 0 && (
                <p className="text-sm">
                  Page will refresh in 3 seconds to show updated bank status...
                </p>
              )}
              {result.results && (
                <div className="mt-2 text-xs">
                  {result.results.map((r: any, i: number) => (
                    <div key={i} className="flex items-center">
                      {r.success ? (
                        <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span>{r.bankName}: {r.success ? 'Fixed' : r.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-red-700 bg-red-50 p-3 rounded">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <p className="font-medium">❌ Fix Failed</p>
              </div>
              <p className="text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
