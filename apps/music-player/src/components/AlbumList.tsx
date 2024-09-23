'use client';

import React from 'react';
import Image from 'next/image';

interface Album {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
}

interface AlbumListProps {
  albums: Album[];
}

function AlbumList({ albums }: AlbumListProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Featured Albums</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-white p-4 rounded-lg shadow">
            <div className="relative w-full pb-[100%] mb-2">
              <Image
                src={album.cover_image}
                alt={`${album.title} cover`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="rounded object-cover"
              />
            </div>
            <h3 className="font-semibold text-sm sm:text-base truncate">{album.title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 truncate">{album.artist}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AlbumList;