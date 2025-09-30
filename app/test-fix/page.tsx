'use client';

import { useState, useEffect } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks } from '@/lib/actions/user.actions';
import DirectBankFix from '@/components/DirectBankFix';

export default function TestFixPage() {
  const [user, setUser] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await getLoggedInUser();
      setUser(userData);
      
      if (userData) {
        const banksData = await getBanks({ userId: userData.$id });
        setBanks(banksData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const banksNeedingFix = banks.filter(bank => !bank.fundingSourceUrl);
  const banksReady = banks.filter(bank => bank.fundingSourceUrl);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">🧪 Test Bank Fix</h1>
      
      {/* User Status */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">User Status</h2>
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

      {/* Direct Fix Component */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Direct Bank Fix</h2>
        <DirectBankFix />
      </div>

      {/* Bank Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Bank Account Status</h2>
        
        {banks.length === 0 ? (
          <p className="text-gray-600">No bank accounts found.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="font-medium text-green-800">Ready for Transfers</h3>
                <p className="text-2xl font-bold text-green-600">{banksReady.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <h3 className="font-medium text-red-800">Need Fixing</h3>
                <p className="text-2xl font-bold text-red-600">{banksNeedingFix.length}</p>
              </div>
            </div>

            {banks.map((bank, index) => (
              <div key={bank.$id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {bank.bankName} - {bank.accountType}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Account ID: {bank.accountId.substring(0, 12)}...
                    </p>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bank.fundingSourceUrl 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bank.fundingSourceUrl ? '✅ Ready' : '❌ Needs Fix'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-6 text-center">
        <a 
          href="/payment-transfer" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          🚀 Go to Transfer Page
        </a>
      </div>
    </div>
  );
}
