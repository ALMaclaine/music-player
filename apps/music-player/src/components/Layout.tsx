import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import FooterPlayer from './FooterPlayer';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <MainContent>{children}</MainContent>
        <FooterPlayer />
      </div>
    </div>
  );
}

export default Layout;