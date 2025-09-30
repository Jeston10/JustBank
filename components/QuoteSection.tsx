'use client';

import { useEffect, useState } from 'react';

const QUOTES = [
  "The stock market is a device for transferring money from the impatient to the patient. – Warren Buffett",
  "An investment in knowledge pays the best interest. – Benjamin Franklin",
  "Do not save what is left after spending, but spend what is left after saving. – Warren Buffett",
  "The individual investor should act consistently as an investor and not as a speculator. – Ben Graham",
  "It's not your salary that makes you rich, it's your spending habits. – Charles A. Jaffe",
  "The goal of the investor should be to purchase a business, not rent a stock. – Warren Buffett",
  "Never depend on a single income. Make investment to create a second source. – Warren Buffett",
  "Money is a terrible master but an excellent servant. – P.T. Barnum",
  "Financial freedom is available to those who learn about it and work for it. – Robert Kiyosaki",
  "The best time to plant a tree was 20 years ago. The second best time is now. – Chinese Proverb",
  "Risk comes from not knowing what you are doing. – Warren Buffett",
  "Beware of little expenses; a small leak will sink a great ship. – Benjamin Franklin",
  "It's not whether you're right or wrong, but how much money you make when you're right and how much you lose when you're wrong. – George Soros",
  "The four most dangerous words in investing are: 'this time it's different.' – Sir John Templeton",
  "Opportunities come infrequently. When it rains gold, put out the bucket, not the thimble. – Warren Buffett"
];

const getQuoteIndex = () => {
  // Use current minute to ensure consistent server/client rendering
  const now = new Date();
  const minuteOfDay = now.getHours() * 60 + now.getMinutes();
  return minuteOfDay % QUOTES.length;
};

const QuoteSection = () => {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Set the initial index based on current time
    setIndex(getQuoteIndex());
    setMounted(true);
    
    const interval = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = (prev + 1) % QUOTES.length;
        return nextIndex;
      });
    }, 60000); // Change every 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Show a placeholder during hydration to prevent mismatch
  if (!mounted) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 rounded-md shadow p-4 mb-6 flex items-center justify-center min-h-[56px]">
        <span className="text-center text-base md:text-lg font-medium italic">Loading inspirational quote...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-100 to-blue-50 text-blue-900 rounded-md shadow p-4 mb-6 flex items-center justify-center min-h-[56px]">
      <span className="text-center text-base md:text-lg font-medium italic">{QUOTES[index]}</span>
    </div>
  );
};

export default QuoteSection; 