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
      <body className="bg-gray-100">
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col md:ml-64">
            <main className="flex-1 overflow-y-auto p-4 pb-24">
              {children}
            </main>
            <FooterPlayer />
          </div>
        </div>
      </body>
    </html>
  );
}