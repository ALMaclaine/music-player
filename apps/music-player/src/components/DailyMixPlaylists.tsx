'use client';

import React from 'react';
import Image from 'next/image';

interface Playlist {
  id: number;
  name: string;
  cover_image: string;
}

interface DailyMixPlaylistsProps {
  dailyMix: Playlist[];
  userPlaylists: Playlist[];
}

function PlaylistItem({ playlist }: { playlist: Playlist }) {
  return (
    <div className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded">
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={playlist.cover_image}
          alt={`${playlist.name} cover`}
          fill
          sizes="48px"
          className="object-cover rounded"
        />
      </div>
      <span className="font-medium text-sm sm:text-base truncate">{playlist.name}</span>
    </div>
  );
}

function DailyMixPlaylists({ dailyMix, userPlaylists }: DailyMixPlaylistsProps) {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Daily Mix</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {dailyMix.map((playlist) => (
          <PlaylistItem key={playlist.id} playlist={playlist} />
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Your Playlists</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {userPlaylists.map((playlist) => (
          <PlaylistItem key={playlist.id} playlist={playlist} />
        ))}
      </div>
    </div>
  );
}

export default DailyMixPlaylists;