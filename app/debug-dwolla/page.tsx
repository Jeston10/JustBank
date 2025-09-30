'use client';

import { useState } from 'react';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { createOrUpdateDwollaCustomer } from '@/lib/actions/dwolla-customer.actions';

export default function DebugDwollaPage() {
  const [user, setUser] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await getLoggedInUser();
      setUser(userData);
      console.log('User data:', userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const createDwollaCustomer = async () => {
    if (!user) {
      alert('Please fetch user first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('Creating Dwolla customer for user ID:', user.$id);
      const result = await createOrUpdateDwollaCustomer(user.$id);
      setResult(result);
      console.log('Dwolla creation result:', result);
    } catch (error) {
      console.error('Error creating Dwolla customer:', error);
      setResult({
        success: false,
        error: error.message,
        message: 'Failed to create Dwolla customer'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Debug Dwolla Customer Creation</h1>
      
      <div className="space-y-6">
        {/* Fetch User Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">1. Fetch Current User</h2>
          <button 
            onClick={fetchUser}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Fetch User Data
          </button>
          
          {user && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">User Information:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  id: user.$id,
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  hasDwollaCustomerId: !!user.dwollaCustomerId,
                  hasDwollaCustomerUrl: !!user.dwollaCustomerUrl,
                  dwollaCustomerId: user.dwollaCustomerId,
                  dwollaCustomerUrl: user.dwollaCustomerUrl
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Create Dwolla Customer Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">2. Create Dwolla Customer</h2>
          <button 
            onClick={createDwollaCustomer}
            disabled={!user || loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Dwolla Customer'}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-lg font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Fetch User Data" to see your current user information</li>
            <li>Check if you already have Dwolla customer ID and URL</li>
            <li>If not, click "Create Dwolla Customer" to create one</li>
            <li>Check the browser console for detailed logs</li>
            <li>If there are errors, copy the result and share it</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
