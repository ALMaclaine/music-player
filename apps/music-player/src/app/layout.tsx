import React from 'react';
import Sidebar from '../components/Sidebar';
import FooterPlayer from '../components/FooterPlayer';
import '../styles/globals.css';

export const metadata = {
  title: 'Music Player',
  description: 'A Next.js music player application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <FooterPlayer />
        </div>
      </body>
    </html>
  );
}