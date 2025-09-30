'use client';

import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox'
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React, { useState, useEffect } from 'react'

const MyBanks = () => {
  const [loggedIn, setLoggedIn] = useState<any>(null);
  const [accounts, setAccounts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getLoggedInUser();
        const userAccounts = await getAccounts({ 
          userId: user.$id 
        });
        
        setLoggedIn(user);
        setAccounts(userAccounts);
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
      <section className='flex'>
        <div className="my-banks">
          <HeaderBox 
            title="My Bank Accounts"
            subtext="Effortlessly manage your banking activites."
          />
          <div className="space-y-4 pb-8">
            <h2 className="header-2">Your cards</h2>
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Loading your bank accounts...</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!accounts || !accounts.data || accounts.data.length === 0) {
    return (
      <section className='flex'>
        <div className="my-banks">
          <HeaderBox 
            title="My Bank Accounts"
            subtext="Effortlessly manage your banking activites."
          />
          <div className="space-y-4 pb-8">
            <h2 className="header-2">Your cards</h2>
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">No bank accounts found. Connect a bank to get started.</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Pagination logic
  const totalCards = accounts.data.length;
  const totalPages = Math.ceil(totalCards / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentCards = accounts.data.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <section className='flex main-content'>
      <div className="my-banks">
        <HeaderBox 
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activites."
        />

        <div className="space-y-4 pb-16">
          <h2 className="header-2">
            Your cards
          </h2>
          
          {/* Bank Cards Grid */}
          <div className="flex flex-wrap gap-6 mb-8">
            {currentCards.map((a: Account, idx: number) => (
              <BankCard 
                key={a.appwriteItemId || a.id || idx}
                account={a}
                userName={loggedIn?.firstName}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center space-y-4">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages} ({totalCards} total cards)
              </div>
              
              {/* Pagination Buttons */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageClick(page)}
                    className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MyBanks