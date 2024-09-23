'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { usePlayerStore } from '../store/playerStore';

function FooterPlayer() {
  const currentlyPlaying = usePlayerStore((state) => state.currentlyPlaying);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      audioRef.current.src = `/api/stream/${currentlyPlaying.id}`;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentlyPlaying]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!currentlyPlaying) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-12 h-12 mr-4">
            <Image
              src={currentlyPlaying.cover_image}
              alt={`${currentlyPlaying.title} cover`}
              fill
              sizes="48px"
              className="object-cover rounded"
            />
          </div>
          <div>
            <p className="font-semibold">{currentlyPlaying.title}</p>
            <p className="text-sm text-gray-400">{currentlyPlaying.artist}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button aria-label="Previous track" className="p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button aria-label="Play/Pause" className="p-2 hover:bg-gray-700 rounded-full" onClick={togglePlayPause}>
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button aria-label="Next track" className="p-2 hover:bg-gray-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <audio ref={audioRef} />
    </footer>
  );
}

export default FooterPlayer;
