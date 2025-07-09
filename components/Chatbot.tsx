'use client';

import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is JustBank?',
    answer: 'JustBank is a modern banking platform that helps you manage your accounts, transfer money, and track your transactions easily.'
  },
  {
    question: 'How do I create an account?',
    answer: 'Click on the Sign Up button on the homepage and fill in your details to create a new JustBank account.'
  },
  {
    question: 'How do I sign in to my account?',
    answer: 'Click on the Sign In button and enter your registered email and password to access your account.'
  },
  {
    question: 'How do I connect my bank account?',
    answer: 'Go to the "My Banks" section and click on "Connect Bank" to securely link your bank account.'
  },
  {
    question: 'How can I transfer money?',
    answer: 'Navigate to the "Payment Transfer" page, fill in the recipient details, and submit your transfer.'
  },
  {
    question: 'How do I check my total balance?',
    answer: 'Your total balance is displayed on the dashboard as soon as you log in.'
  },
  {
    question: 'Where can I see my transaction history?',
    answer: 'You can view all your past transactions in the "Transaction History" section.'
  },
  {
    question: 'How do I update my profile information?',
    answer: 'Go to your account settings to update your personal information and preferences.'
  },
  {
    question: 'Is my data secure with JustBank?',
    answer: 'Yes, JustBank uses industry-standard security measures to protect your data and transactions.'
  },
  {
    question: 'Can I use JustBank on mobile devices?',
    answer: 'Yes, JustBank is fully responsive and works on all modern smartphones and tablets.'
  },
  {
    question: 'I need more help or have an issue.',
    answer: 'For further assistance, please contact our support at sjestonsingh@gmail.com.'
  }
];

const Chatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      {open ? (
        <div className="shadow-lg rounded-lg bg-white w-80 max-w-full border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 bg-blue-600 rounded-t-lg">
            <span className="text-white font-semibold">JustBank Assistant</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">×</button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
            <div className="mb-2 text-gray-700">Hi! 👋 How can I help you today?</div>
            <ul className="space-y-2">
              {faqs.map((faq, idx) => (
                <li key={idx}>
                  <button
                    className="w-full text-left px-3 py-2 rounded bg-gray-100 hover:bg-blue-100 text-sm font-medium"
                    onClick={() => setSelected(selected === idx ? null : idx)}
                  >
                    {faq.question}
                  </button>
                  {selected === idx && (
                    <div className="mt-1 ml-2 text-gray-600 text-sm bg-blue-50 p-2 rounded">
                      {faq.answer}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-gray-500">
              Need more help? <a href="mailto:sjestonsingh@gmail.com" className="text-blue-600 underline">Contact support</a>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none"
          aria-label="Open chatbot"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M12 3C6.477 3 2 6.805 2 11c0 1.61.67 3.11 1.85 4.36-.08.6-.3 1.7-.82 2.7-.13.25.13.54.4.45 1.1-.36 2.13-.93 2.7-1.3C8.1 18.1 9.99 18.7 12 18.7c5.523 0 10-3.805 10-7.7S17.523 3 12 3Z" fill="#fff"/></svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot; 