'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="md:hidden fixed top-4 left-4 z-20 p-2 bg-gray-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'Close' : 'Menu'}
      </button>
      <aside className={`w-64 bg-gray-800 text-white p-6 h-screen fixed left-0 top-0 z-10 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <h1 className="text-2xl font-bold mb-6">Music Player</h1>
        <nav>
          <ul className="space-y-2">
            <li><Link href="/" className="block py-2 px-4 hover:bg-gray-700 rounded">Home</Link></li>
            <li><Link href="/search" className="block py-2 px-4 hover:bg-gray-700 rounded">Search</Link></li>
            <li><Link href="/playlists" className="block py-2 px-4 hover:bg-gray-700 rounded">Playlists</Link></li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;