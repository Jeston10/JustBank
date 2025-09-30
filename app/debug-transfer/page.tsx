'use client';

import { useState, useEffect } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getBanks } from '@/lib/actions/bank.actions';
import { encryptId, decryptId } from '@/lib/utils';
import FixFundingSource from '@/components/FixFundingSource';

export default function DebugTransferPage() {
  const [user, setUser] = useState<any>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [testSharableId, setTestSharableId] = useState('');
  const [decryptResult, setDecryptResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getLoggedInUser();
        setUser(userData);
        
        if (userData) {
          const banksData = await getBanks({ userId: userData.$id });
          setBanks(banksData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const testDecryption = async () => {
    if (!testSharableId.trim()) {
      alert('Please enter a sharable ID to test');
      return;
    }

    setLoading(true);
    try {
      const decrypted = decryptId(testSharableId);
      setDecryptResult({
        success: true,
        originalId: testSharableId,
        decryptedId: decrypted
      });
      console.log('Decryption test result:', { original: testSharableId, decrypted });
    } catch (error) {
      setDecryptResult({
        success: false,
        originalId: testSharableId,
        error: error.message
      });
      console.error('Decryption test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Debug Transfer Issues</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">1. Current User</h2>
          {user ? (
            <div className="p-4 bg-gray-50 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  id: user.$id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  hasDwollaCustomerId: !!user.dwollaCustomerId,
                  hasDwollaCustomerUrl: !!user.dwollaCustomerUrl
                }, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Loading user data...</p>
          )}
        </div>

        {/* Fix Funding Sources */}
        {banks.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">2. Fix Bank Account Funding Sources</h2>
            <FixFundingSource 
              banks={banks} 
              onSuccess={() => {
                // Refresh bank data after successful fix
                const refreshBanks = async () => {
                  if (user) {
                    const banksData = await getBanks({ userId: user.$id });
                    setBanks(banksData.data || []);
                  }
                };
                refreshBanks();
              }}
            />
          </div>
        )}

        {/* Bank Accounts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">3. Your Bank Accounts</h2>
          {banks.length > 0 ? (
            <div className="space-y-4">
              {banks.map((bank, index) => (
                <div key={bank.$id} className="p-4 bg-gray-50 rounded">
                  <h3 className="font-medium">Account {index + 1}</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Account ID:</strong> {bank.accountId}</p>
                    <p><strong>Bank Name:</strong> {bank.bankName}</p>
                    <p><strong>Account Type:</strong> {bank.accountType}</p>
                    <p><strong>Has Funding Source:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        bank.fundingSourceUrl 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bank.fundingSourceUrl ? 'Yes' : 'No'}
                      </span>
                    </p>
                    {bank.fundingSourceUrl && (
                      <p><strong>Funding Source URL:</strong> 
                        <code className="bg-gray-200 px-2 py-1 rounded ml-2 text-xs">
                          {bank.fundingSourceUrl.substring(0, 50)}...
                        </code>
                      </p>
                    )}
                    <p><strong>Sharable ID:</strong> 
                      <code className="bg-gray-200 px-2 py-1 rounded ml-2">
                        {encryptId(bank.accountId)}
                      </code>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No bank accounts found. You need to connect a bank account first.</p>
          )}
        </div>

        {/* Test Decryption */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">4. Test Sharable ID Decryption</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter a sharable ID to test:
              </label>
              <input
                type="text"
                value={testSharableId}
                onChange={(e) => setTestSharableId(e.target.value)}
                placeholder="Paste a sharable ID here..."
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              onClick={testDecryption}
              disabled={loading || !testSharableId.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : 'Test Decryption'}
            </button>
            
            {decryptResult && (
              <div className="p-4 bg-gray-50 rounded">
                <h3 className="font-medium mb-2">Decryption Result:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(decryptResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold mb-4">How to Test Transfers:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure you have at least 2 bank accounts connected</li>
            <li>Copy a sharable ID from one of your accounts above</li>
            <li>Go to the payment transfer page</li>
            <li>Use the copied sharable ID as the recipient</li>
            <li>Try to transfer a small amount between your own accounts</li>
            <li>Check the browser console for detailed logs</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
