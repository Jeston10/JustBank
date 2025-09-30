'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Loader2, Wrench } from 'lucide-react';

export default function QuickFixButton() {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fixAllBanks = async () => {
    setFixing(true);
    setResult(null);

    try {
      const response = await fetch('/api/fix-all-banks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        // Refresh the page after successful fix
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error occurred'
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-yellow-800 mb-1">
            🔧 Quick Fix for Transfer Issues
          </h3>
          <p className="text-sm text-yellow-700">
            If you're getting "bank not fully set up" errors, click the button to fix all your bank accounts automatically.
          </p>
        </div>
        
        <Button
          onClick={fixAllBanks}
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
              <p className="font-medium">✅ Fix Successful!</p>
              <p className="text-sm">
                Fixed {result.fixedBanks} out of {result.totalBanks} bank accounts.
                Page will refresh in a moment...
              </p>
            </div>
          ) : (
            <div className="text-red-700 bg-red-50 p-3 rounded">
              <p className="font-medium">❌ Fix Failed</p>
              <p className="text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
