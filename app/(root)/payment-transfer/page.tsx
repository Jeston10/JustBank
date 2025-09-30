'use client';

import HeaderBox from '@/components/HeaderBox'
import PaymentTransferForm from '@/components/PaymentTransferForm'
import DwollaCustomerSetup from '@/components/DwollaCustomerSetup'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React, { useEffect, useState } from 'react'

const Transfer = () => {
  const [loggedIn, setLoggedIn] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getLoggedInUser();
        setLoggedIn(user);
        
        if (user) {
          const userAccounts = await getAccounts({ userId: user.$id });
          setAccounts(userAccounts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!loggedIn) {
    console.error("User not authenticated - redirecting to sign in");
    return (
      <section className="payment-transfer">
        <HeaderBox 
          title="Authentication Required"
          subtext="Please sign in to access the payment transfer feature"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-gray-600 mb-4">You need to be signed in to make transfers.</p>
          <a 
            href="/sign-in" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
        </div>
      </section>
    );
  }

  // Check if user has required Dwolla information
  if (!loggedIn.dwollaCustomerId || !loggedIn.dwollaCustomerUrl) {
    console.error("User missing Dwolla customer information");
    return (
      <section className="payment-transfer">
        <HeaderBox 
          title="Account Setup Required"
          subtext="Your account needs to be fully set up to make transfers"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            Your account is not fully set up for transfers. Please set up your Dwolla customer account below.
          </p>
        </div>
        
        {/* Dwolla Customer Setup */}
        <div className="max-w-2xl mx-auto">
          <DwollaCustomerSetup 
            onSuccess={() => {
              // Refresh the page after successful setup
              window.location.reload();
            }}
          />
        </div>
        
        <div className="flex flex-col items-center justify-center py-8">
          <div className="space-x-4">
            <a 
              href="/sign-in" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In Again
            </a>
            <a 
              href="/" 
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </section>
    );
  }


  if(!accounts || !accounts.data || accounts.data.length === 0) {
    console.error("No accounts found for user");
    return (
      <section className="payment-transfer">
        <HeaderBox 
          title="No Bank Accounts"
          subtext="You need to connect a bank account to make transfers"
        />
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-lg text-gray-600 mb-4">
            You don't have any bank accounts connected. Please connect a bank account first.
          </p>
          <a 
            href="/" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Bank Account
          </a>
        </div>
      </section>
    );
  }
  
  const accountsData = accounts.data;

  return (
    <section className="payment-transfer">
      <HeaderBox 
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to the payment transfer"
      />

      <section className="size-full pt-5">
        <PaymentTransferForm accounts={accountsData} />
      </section>
    </section>
  )
}

export default Transfer