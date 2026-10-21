import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Anika Projects | Civil Engineering & Real Estate Developers Amravati',
  description: 'Premier residential developers in Amravati specializing in 2 & 3 BHK row houses, luxury duplex bungalows, and sanctioned plots with live inventory tracking.',
  openGraph: {
    title: 'Anika Projects Amravati',
    description: 'Civil Engineering & Residential Real Estate Developments in Amravati, Maharashtra.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#FAF7F2] text-[#0A1926]">
        {children}
      </body>
    </html>
  );
}
