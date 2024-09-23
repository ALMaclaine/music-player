import React from 'react';
import AlbumList from '../components/AlbumList';
import DailyMixPlaylists from '../components/DailyMixPlaylists';
import FooterPlayer from '../components/FooterPlayer';

interface Album {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
}

interface Playlist {
  id: number;
  name: string;
  cover_image: string;
}

async function fetchFeaturedAlbums(): Promise<Album[]> {
  const response = await fetch('http://localhost:4202/api/featured-albums', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch featured albums');
  }
  return response.json();
}

async function fetchDailyMixPlaylists(): Promise<{ dailyMix: Playlist[], userPlaylists: Playlist[] }> {
  const response = await fetch('http://localhost:4202/api/daily-mix-playlists', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to fetch daily mix and playlists');
  }
  return response.json();
}

export default async function HomePage() {
  const [albums, { dailyMix, userPlaylists }] = await Promise.all([
    fetchFeaturedAlbums(),
    fetchDailyMixPlaylists()
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">Welcome to Music Player</h1>
      <AlbumList albums={albums} />
      <DailyMixPlaylists dailyMix={dailyMix} userPlaylists={userPlaylists} />
      <p className="text-gray-600 mt-4">
        This is a sample home page for our music player application.
      </p>
      <FooterPlayer />
    </>
  );
}
