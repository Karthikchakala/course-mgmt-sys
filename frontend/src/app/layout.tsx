// frontend/src/app/layout.tsx

import React from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext'; // Global state provider
import '@/app/globals.css'; // Your Tailwind CSS file

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CMS Learning Platform',
  description: 'Full-stack Course Management System built with Next.js and Node.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* AuthProvider wraps the entire application */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}