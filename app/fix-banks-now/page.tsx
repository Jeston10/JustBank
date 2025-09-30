'use client';

import { useState, useEffect } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks } from '@/lib/actions/bank.actions';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function FixBanksNowPage() {
  const [user, setUser] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userData = await getLoggedInUser();
      setUser(userData);
      
      if (userData) {
        const banksData = await getBanks({ userId: userData.$id });
        setBanks(banksData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fixBankFundingSource = async (bankId: string) => {
    setFixing(bankId);
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

      if (data.success) {
        // Reload data to show updated state
        await loadData();
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
      setFixing(null);
    }
  };

  const fixAllBanks = async () => {
    const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
    
    for (const bank of banksNeedingFix) {
      await fixBankFundingSource(bank.$id);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your bank accounts...</p>
        </div>
      </div>
    );
  }

  const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
  const banksReady = banks.filter(bank => bank.fundingSourceUrl);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🚨 URGENT: Fix Bank Transfer Setup</h1>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* User Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Your Account Status</h2>
        {user ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p><strong>Dwolla Customer:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user.dwollaCustomerId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.dwollaCustomerId ? '✅ Ready' : '❌ Missing'}
                </span>
              </p>
              {user.dwollaCustomerId && (
                <p className="text-xs text-gray-600 mt-1">
                  ID: {user.dwollaCustomerId.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-red-600">❌ Not signed in</p>
        )}
      </div>

      {/* Quick Fix Section */}
      {banksNeedingFix.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">⚠️ URGENT: Fix Required</h2>
          </div>
          
          <p className="text-red-700 mb-4">
            You have <strong>{banksNeedingFix.length}</strong> bank account(s) that need funding sources to enable transfers.
          </p>

          <div className="flex gap-4">
            <Button 
              onClick={fixAllBanks}
              disabled={fixing !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {fixing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Fixing All Banks...
                </>
              ) : (
                <>
                  🔧 Fix All Banks Now
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Bank Accounts */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Your Bank Accounts</h2>
        
        {banks.length === 0 ? (
          <p className="text-gray-600">No bank accounts found. You need to connect a bank account first.</p>
        ) : (
          <div className="space-y-4">
            {banks.map((bank, index) => (
              <div key={bank.$id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-lg">
                      {bank.bankName} - {bank.accountType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Account ID: {bank.accountId.substring(0, 12)}...
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bank.fundingSourceUrl 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bank.fundingSourceUrl ? '✅ Ready for Transfers' : '❌ Needs Fix'}
                    </div>
                  </div>
                </div>

                {!bank.fundingSourceUrl && (
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <p className="text-sm text-gray-700">
                        This bank account needs a funding source to enable transfers.
                      </p>
                      {!bank.plaidProcessorToken && (
                        <p className="text-sm text-red-600 mt-1">
                          ⚠️ Missing Plaid token - may need to reconnect
                        </p>
                      )}
                    </div>
                    
                    <Button
                      onClick={() => fixBankFundingSource(bank.$id)}
                      disabled={fixing === bank.$id}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {fixing === bank.$id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Fixing...
                        </>
                      ) : (
                        '🔧 Fix Now'
                      )}
                    </Button>
                  </div>
                )}

                {results[bank.$id] && (
                  <div className="mt-3 p-3 rounded">
                    {results[bank.$id].success ? (
                      <div className="flex items-center text-green-700 bg-green-50 p-3 rounded">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <div>
                          <p className="font-medium">✅ Fixed Successfully!</p>
                          <p className="text-sm">Funding source created and bank is ready for transfers.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-700 bg-red-50 p-3 rounded">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <div>
                          <p className="font-medium">❌ Fix Failed</p>
                          <p className="text-sm">{results[bank.$id].error}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      {banksReady.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold text-green-800">✅ Ready for Transfers!</h2>
          </div>
          
          <p className="text-green-700 mb-4">
            You have <strong>{banksReady.length}</strong> bank account(s) ready for transfers.
          </p>
          
          <div className="space-y-2">
            {banksReady.map(bank => (
              <div key={bank.$id} className="text-sm text-green-700">
                ✅ {bank.bankName} - {bank.accountType}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <a 
              href="/payment-transfer" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 Go to Transfer Page
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
