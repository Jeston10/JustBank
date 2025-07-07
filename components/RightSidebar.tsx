import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import BankCard from './BankCard'
import { countTransactionCategories } from '@/lib/utils'
import Category from './Category'

// Demo/mock transaction generator
function generateMockTransactions() {
  const categories = ["Travel", "Payment", "Food and Drink", "Other"];
  const channels = ["Online", "In Store", "Other"];
  const names = [
    "Uber 063015 SFPOOL",
    "CREDIT CARD 3333 PAYMENT",
    "United Airlines",
    "McDonalds",
    "Starbucks",
    "Amazon Purchase",
    "Apple Store",
    "Netflix Subscription",
    "Walmart",
    "Shell Gas"
  ];
  const now = new Date();
  return Array.from({ length: 8 }).map((_, i) => {
    const isDebit = Math.random() > 0.5;
    const amount = (Math.random() * (isDebit ? -500 : 500)).toFixed(2);
    const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30);
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      name: names[Math.floor(Math.random() * names.length)],
      amount: parseFloat(amount),
      type: isDebit ? "debit" : "credit",
      paymentChannel: channels[Math.floor(Math.random() * channels.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      date: date.toISOString(),
      status: "Success",
    };
  });
}

const RightSidebar = ({ user, transactions, banks }: RightSidebarProps) => {
  // Use mock transactions for demo
  const demoTransactions = generateMockTransactions();
  const categories: CategoryCount[] = countTransactionCategories(demoTransactions);

  return (
    <aside className="right-sidebar">
      <section className="flex flex-col pb-8">
        <div className="profile-banner" />
        <div className="profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">{user.firstName[0]}</span>
          </div>

          <div className="profile-details">
            <h1 className='profile-name'>
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-email">
              {user.email}
            </p>
          </div>
        </div>
      </section>

      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">My Banks</h2>
        </div>

        {banks?.length > 0 && (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-5">
            <div className='relative z-10'>
              <BankCard 
                key={banks[0].$id}
                account={banks[0]}
                userName={`${user.firstName} ${user.lastName}`}
                showBalance={false}
              />
            </div>
            {banks[1] && (
              <div className="absolute right-0 top-8 z-0 w-[90%]">
                <BankCard 
                  key={banks[1].$id}
                  account={banks[1]}
                  userName={`${user.firstName} ${user.lastName}`}
                  showBalance={false}
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-10 flex flex-1 flex-col gap-6">
          <h2 className="header-2">Top categories</h2>

          <div className='space-y-5'>
            {categories.map((category, index) => (
              <Category key={category.name} category={category} />
            ))}
          </div>
        </div>
      </section>
    </aside>
  )
}

export default RightSidebar