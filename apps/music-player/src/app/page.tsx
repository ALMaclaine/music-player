import React from 'react';
import Image from 'next/image';

interface Album {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
}

async function fetchFeaturedAlbums(): Promise<Album[]> {
  const response = await fetch('/api/featured-albums', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch featured albums');
  }
  return response.json();
}

async function FeaturedAlbums() {
  try {
    const albums = await fetchFeaturedAlbums();

    return (
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Featured Albums</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="bg-white p-4 rounded-lg shadow">
              <div className="relative w-full pb-[100%] mb-2">
                <Image
                  src={album.cover_image}
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
    );
  } catch (error) {
    console.error('Error fetching featured albums:', error);
    return <div className="text-red-500">Error: Failed to fetch featured albums</div>;
  }
}

export default async function HomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Music Player</h1>

      <FeaturedAlbums />

      <p className="text-gray-600">
        This is a sample home page for our music player application.
      </p>
    </div>
  );
}
