import Image from "next/image";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen w-full justify-between font-inter">
      {children}
      <div className="auth-asset">
        <div>
          <Image 
            src="/icons/auth-image.svg"
            alt="Auth image"
            width={500}
            height={500}
            priority
            className="rounded-l-xl object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      </div>
    </main>
  );
}
