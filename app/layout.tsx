import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Thangarasu Samayal — A Feast Worth Gathering For',
  description:
    'Traditional Kongunadu & Chettinad catering from Thangarasu Samayal, serving celebrations since 1999.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
