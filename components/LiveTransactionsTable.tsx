"use client";
import { useEffect, useState } from "react";
import TransactionsTable from "./TransactionsTable";

// Demo/mock transaction generator
function generateMockTransactions(): Transaction[] {
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
    const date = new Date(now.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 30); // within last 30 days
    return {
      id: `${Date.now()}-${i}-${Math.random()}`,
      name: names[Math.floor(Math.random() * names.length)],
      amount: parseFloat(amount),
      type: isDebit ? "debit" : "credit",
      paymentChannel: channels[Math.floor(Math.random() * channels.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      date: date.toISOString(),
      status: "Success",
    } as Transaction;
  });
}

export default function LiveTransactionsTable({ accountId }: { accountId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTransactions(generateMockTransactions());
    setLoading(false);
    const interval = setInterval(() => {
      setTransactions(generateMockTransactions());
    }, 5000);
    return () => clearInterval(interval);
  }, [accountId]);

  if (loading) return <div>Loading transactions...</div>;
  return <TransactionsTable transactions={transactions} />;
} 