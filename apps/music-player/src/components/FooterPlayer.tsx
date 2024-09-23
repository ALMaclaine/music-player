import React from 'react';
import Image from 'next/image';

function FooterPlayer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md h-20 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="relative w-12 h-12 mr-4">
          <Image
            src="/placeholder-album-art.jpg"
            alt="Album art"
            layout="fill"
            objectFit="cover"
          />
        </div>
        <div>
          <p className="font-semibold">Song Title</p>
          <p className="text-sm text-gray-600">Artist Name</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button aria-label="Previous track">
          {/* Add previous track icon */}
        </button>
        <button aria-label="Play/Pause">
          {/* Add play/pause icon */}
        </button>
        <button aria-label="Next track">
          {/* Add next track icon */}
        </button>
      </div>
      <div className="w-1/4">
        <input type="range" className="w-full" />
      </div>
    </footer>
  );
}

export default FooterPlayer;