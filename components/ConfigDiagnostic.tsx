"use client";

import { useState, useEffect } from "react";

const ConfigDiagnostic = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        setIsLoading(true);
        
        // Check client-side environment variables
        const clientEnvCheck = {
          hasAppwriteEndpoint: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
          hasAppwriteProjectId: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
          appwriteEndpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "MISSING",
          appwriteProjectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "MISSING",
        };

        // Test Appwrite connection
        let appwriteTest = { success: false, error: null };
        try {
          const response = await fetch('/api/test-appwrite', { method: 'POST' });
          const result = await response.json();
          appwriteTest = result;
        } catch (error) {
          appwriteTest = { success: false, error: error.message };
        }

        // Test authentication
        let authTest = { success: false, error: null, user: null };
        try {
          const response = await fetch('/api/test-auth', { method: 'POST' });
          const result = await response.json();
          authTest = result;
        } catch (error) {
          authTest = { success: false, error: error.message };
        }

        setDiagnostics({
          clientEnvCheck,
          appwriteTest,
          authTest,
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
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Running Configuration Diagnostics...</h3>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-blue-200 rounded w-3/4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          <div className="h-4 bg-blue-200 rounded w-2/3"></div>
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration Diagnostics</h3>
      
      {/* Client Environment Variables */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Client Environment Variables:</h4>
        <div className="bg-white p-3 rounded border">
          <div className="space-y-1 text-sm">
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">
                {diagnostics?.clientEnvCheck?.hasAppwriteEndpoint ? "✅" : "❌"}
              </span>
              <span>NEXT_PUBLIC_APPWRITE_ENDPOINT: {diagnostics?.clientEnvCheck?.appwriteEndpoint}</span>
            </div>
            <div className="flex items-center">
              <span className="w-4 h-4 mr-2">
                {diagnostics?.clientEnvCheck?.hasAppwriteProjectId ? "✅" : "❌"}
              </span>
              <span>NEXT_PUBLIC_APPWRITE_PROJECT_ID: {diagnostics?.clientEnvCheck?.appwriteProjectId}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appwrite Connection Test */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Appwrite Connection Test:</h4>
        <div className={`p-3 rounded border ${diagnostics?.appwriteTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 mr-2">
              {diagnostics?.appwriteTest?.success ? "✅" : "❌"}
            </span>
            <span className={diagnostics?.appwriteTest?.success ? 'text-green-800' : 'text-red-800'}>
              {diagnostics?.appwriteTest?.success ? 'Connection Successful' : 'Connection Failed'}
            </span>
          </div>
          {diagnostics?.appwriteTest?.error && (
            <p className="text-red-600 text-sm">{diagnostics.appwriteTest.error}</p>
          )}
        </div>
      </div>

      {/* Authentication Test */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-2">Authentication Test:</h4>
        <div className={`p-3 rounded border ${diagnostics?.authTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center mb-2">
            <span className="w-4 h-4 mr-2">
              {diagnostics?.authTest?.success ? "✅" : "❌"}
            </span>
            <span className={diagnostics?.authTest?.success ? 'text-green-800' : 'text-red-800'}>
              {diagnostics?.authTest?.success ? 'Authentication Working' : 'Authentication Failed'}
            </span>
          </div>
          {diagnostics?.authTest?.error && (
            <p className="text-red-600 text-sm">{diagnostics.authTest.error}</p>
          )}
          {diagnostics?.authTest?.user && (
            <div className="mt-2 text-sm text-green-700">
              <p>User: {diagnostics.authTest.user.email}</p>
              <p>ID: {diagnostics.authTest.user.$id}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Recommendations:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          {!diagnostics?.clientEnvCheck?.hasAppwriteEndpoint && (
            <li>• Add NEXT_PUBLIC_APPWRITE_ENDPOINT to your .env.local file</li>
          )}
          {!diagnostics?.clientEnvCheck?.hasAppwriteProjectId && (
            <li>• Add NEXT_PUBLIC_APPWRITE_PROJECT_ID to your .env.local file</li>
          )}
          {!diagnostics?.appwriteTest?.success && (
            <li>• Check your Appwrite project ID and endpoint URL</li>
          )}
          {!diagnostics?.authTest?.success && (
            <li>• Make sure you're signed in to the application</li>
          )}
          <li>• Restart your development server after changing environment variables</li>
          <li>• Check that your .env.local file is in the project root directory</li>
        </ul>
      </div>

      {/* Raw Data */}
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
          Show Raw Diagnostic Data
        </summary>
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-64">
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default ConfigDiagnostic;
