import React from 'react';
import Image from 'next/image';

function FooterPlayer() {
  return (
    <footer className="bg-gray-800 text-white p-2 md:p-4 fixed bottom-0 left-0 right-0 md:left-64">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-2 md:mb-0">
          <div className="relative w-10 h-10 md:w-12 md:h-12 mr-2 md:mr-4">
            <Image
              src="/placeholder-album-1.jpg"
              alt="Album art"
              fill
              sizes="(max-width: 768px) 40px, 48px"
              className="object-cover rounded"
            />
          </div>
          <div>
            <p className="font-semibold text-sm md:text-base">Song Title</p>
            <p className="text-xs md:text-sm text-gray-400">Artist Name</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 mb-2 md:mb-0">
          <button aria-label="Previous track" className="p-1 md:p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button aria-label="Play/Pause" className="p-1 md:p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button aria-label="Next track" className="p-1 md:p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="w-full md:w-1/4">
          <input type="range" className="w-full" />
        </div>
      </div>
    </footer>
  );
}

export default FooterPlayer;
