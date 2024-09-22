Here's the full prompt for building your music player app using **Next.js**, **SQLite**, and the other technologies you mentioned:

---

**Music Player App Requirements**

### Overview:
Build a music player app with login, profile management, personal playlists, and local music playback. The app will use **Next.js** for the frontend and backend, **SQLite** for database management, and the following stack for the frontend and state management:

- **Nx**: For monorepo management.
- **Radix and Shadcn**: For accessible, high-quality UI components.
- **Tailwind CSS**: For modern, responsive styling.
- **Zustand**: For global state management of the music player (playlists, preferences, current playback state).

### Features:

#### 1. **User Authentication & Profile Management:**
- **User accounts**: Users will sign up, log in, and manage their profiles (no OAuth).
- Store **user preferences** (theme preferences, playback settings) and playlists.
- Use **SQLite** for storing user data, encrypted login credentials, and user-specific settings.

#### 2. **Music Playback:**
- Users will stream locally stored **mp3/wav** files, with metadata (title, artist, album, duration) coming from the files themselves.
- **Offline playback**: Allow users to download songs for offline listening.
- Basic player controls: **play, pause, next/previous track, seek**, and **volume control**.
- **Playback queue management**: Users can queue songs, reorder the queue, and remove songs.
- **Shuffle and repeat** options for playback.

#### 3. **Playlist Management:**
- Users can **create**, **edit**, **reorder**, and **delete playlists**.
- Default playlists like **Favorites**, **Recently Played**, and **Downloaded** for offline use.
- Playlists should support **drag-and-drop reordering**.

#### 4. **UI/UX & Navigation:**
- **Responsive UI**: The app should look and work seamlessly on desktop, tablet, and mobile devices.
- Use **Radix** and **Shadcn** for building modals (login, playlist creation), dropdowns (volume control), and accessible navigation elements.
- A left-side **navigation bar** for moving between sections like Explore, Playlists, and Settings.
- Include a **"Now Playing" bar** at the bottom for continuous playback control while navigating the app.
- Support **light/dark mode** with the option for users to toggle and save their preference (stored in the database).

#### 5. **State Management:**
- **Zustand** will be used to manage the global state:
  - **Current song**: Track what's currently playing.
  - **Playlists**: Manage all playlists and their contents.
  - **Playback settings**: Store shuffle, repeat, volume, and other user-specific settings.
  - **Offline support**: Manage song download status and allow for offline playback.
- Zustand will persist states across user sessions, allowing users to pick up where they left off.

#### 6. **Backend with Next.js API Routes:**
- Use **Next.js API routes** to handle:
  - **User authentication**: Sign-up, login, and profile management.
  - **Playlist management**: API routes to create, edit, and delete playlists, and serve the music files from the local file system.
  - **File serving**: Serve local **mp3/wav** files via API routes, handling offline playback.
- **SQLite database**:
  - **Users table**: Store user data, encrypted credentials, and profile preferences.
  - **Playlists table**: Store user playlists with the song order, playlist name, and user ID.
  - **Songs table**: Metadata from local music files (title, artist, album) with a reference to their file paths.
  - **Preferences table**: Store user-specific preferences like dark/light mode and playback settings.

#### 7. **Performance & Offline Support:**
- Ensure fast load times by implementing **lazy loading** of album artwork, playlists, and tracks.
- Use **Next.js server-side rendering (SSR)** for quick page loads and seamless transitions between pages.
- Implement **offline mode**: Users can download songs for offline playback, and the app should function without an internet connection once the music is downloaded.

### Bonus Features (Optional for Future Expansion):
- **Push notifications** to alert users when new playlists or music are available.
- **Song lyrics display** (could be integrated using a lyrics API in the future).
- **Real-time collaboration**: Allow users to share and collaborate on playlists.

---

### Technologies:
- **Nx**: Monorepo management.
- **Next.js**: Frontend and backend with server-side rendering and API routes.
- **SQLite**: Database for users, playlists, preferences, and song metadata.
- **Radix and Shadcn**: UI components (modals, navigation, dropdowns).
- **Tailwind CSS**: Styling and responsive design.
- **Zustand**: State management for playback, preferences, and playlist state.

---

This detailed prompt should give you a full picture of the app's requirements and provide a strong foundation to build the music player. Let me know if you'd like to add or adjust anything!
