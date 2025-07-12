export const dynamic = 'force-dynamic'

import type { Metadata } from "next";
import { Inter, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import Chatbot from "../components/Chatbot";
import QuoteSection from "../components/QuoteSection";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-ibm-plex-serif'
})

export const metadata: Metadata = {
  title: "JustBank",
  description: "JustBank is a modern banking platform for everyone.",
  icons: {
    icon: '/icons/logo.svg'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ibmPlexSerif.variable}`}>
        <QuoteSection />
        {children}
        <Chatbot />
        <div className="w-full text-center py-2 text-xs text-gray-500 bg-white border-t">
          © {new Date().getFullYear()} JustBank™. All rights reserved. For any help contact <a href="mailto:sjestonsingh@gmail.com" className="underline">sjestonsingh@gmail.com</a>.
        </div>
      </body>
    </html>
  );
}
