import React from 'react';
import Image from 'next/image';

// Mock data for featured albums
const featuredAlbums = [
  { id: 1, title: 'Album 1', artist: 'Artist 1', cover: '/placeholder-album-1.jpg' },
  { id: 2, title: 'Album 2', artist: 'Artist 2', cover: '/placeholder-album-2.jpg' },
  { id: 3, title: 'Album 3', artist: 'Artist 3', cover: '/placeholder-album-3.jpg' },
  { id: 4, title: 'Album 4', artist: 'Artist 4', cover: '/placeholder-album-4.jpg' },
];

export default function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Music Player</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Featured Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredAlbums.map((album) => (
            <div key={album.id} className="bg-white p-4 rounded-lg shadow">
              <div className="relative w-full pb-[100%] mb-2">
                <Image
                  src={album.cover}
                  alt={`${album.title} cover`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="rounded object-cover"
                />
              </div>
              <h3 className="font-semibold">{album.title}</h3>
              <p className="text-sm text-gray-600">{album.artist}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600">
        This is a sample home page for our music player application.
      </p>
    </div>
  );
}
