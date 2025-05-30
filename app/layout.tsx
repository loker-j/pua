import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StagewiseProvider } from '@/components/stagewise-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '反PUA大师',
  description: '帮助你识别和应对PUA，建立健康的沟通方式',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <StagewiseProvider />
      </body>
    </html>
  );
}