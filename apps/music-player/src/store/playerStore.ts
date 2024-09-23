import { create } from 'zustand';

interface Track {
  id: number;
  title: string;
  artist: string;
  cover_image: string;
}

interface PlayerState {
  currentlyPlaying: Track | null;
  setCurrentlyPlaying: (track: Track) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentlyPlaying: null,
  setCurrentlyPlaying: (track) => set({ currentlyPlaying: track }),
}));