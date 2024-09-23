import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'music_player.db');
const db = new Database(dbPath);

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

// Drop existing tables
db.exec(`
  DROP TABLE IF EXISTS UserFavorites;
  DROP TABLE IF EXISTS PlaylistSongs;
  DROP TABLE IF EXISTS Playlists;
  DROP TABLE IF EXISTS Songs;
  DROP TABLE IF EXISTS Albums;
  DROP TABLE IF EXISTS Artists;
  DROP TABLE IF EXISTS Users;
`);

// Create tables
db.exec(`
  CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE Artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE Albums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    cover_image TEXT,
    release_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES Artists(id)
  );

  CREATE TABLE Songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist_id INTEGER NOT NULL,
    album_id INTEGER,
    duration INTEGER NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES Artists(id),
    FOREIGN KEY (album_id) REFERENCES Albums(id)
  );

  CREATE TABLE Playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id)
  );

  CREATE TABLE PlaylistSongs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    song_order INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (playlist_id) REFERENCES Playlists(id),
    FOREIGN KEY (song_id) REFERENCES Songs(id)
  );

  CREATE TABLE UserFavorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (song_id) REFERENCES Songs(id)
  );
`);

// Create indexes for frequently queried columns
db.exec(`
  CREATE INDEX idx_songs_title ON Songs(title);
  CREATE INDEX idx_songs_artist_id ON Songs(artist_id);
  CREATE INDEX idx_songs_album_id ON Songs(album_id);
  CREATE INDEX idx_albums_title ON Albums(title);
  CREATE INDEX idx_albums_artist_id ON Albums(artist_id);
  CREATE INDEX idx_artists_name ON Artists(name);
  CREATE INDEX idx_playlists_user_id ON Playlists(user_id);
  CREATE INDEX idx_playlist_songs_playlist_id ON PlaylistSongs(playlist_id);
  CREATE INDEX idx_user_favorites_user_id ON UserFavorites(user_id);
`);

// Insert sample data
const insertSampleData = db.transaction(() => {
  // Insert sample user
  const insertUser = db.prepare('INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)');
  const userId = insertUser.run('sampleuser', 'user@example.com', 'hashed_password').lastInsertRowid;

  // Insert sample artists
  const insertArtist = db.prepare('INSERT INTO Artists (name) VALUES (?)');
  const artistIds = [
    insertArtist.run('Artist 1').lastInsertRowid,
    insertArtist.run('Artist 2').lastInsertRowid,
    insertArtist.run('Artist 3').lastInsertRowid,
    insertArtist.run('Artist 4').lastInsertRowid,
  ];

  // Insert sample albums
  const insertAlbum = db.prepare('INSERT INTO Albums (title, artist_id, cover_image) VALUES (?, ?, ?)');
  const albumIds = [
    insertAlbum.run('Album 1', artistIds[0], '/placeholder-album-1.jpg').lastInsertRowid,
    insertAlbum.run('Album 2', artistIds[1], '/placeholder-album-2.jpg').lastInsertRowid,
    insertAlbum.run('Album 3', artistIds[2], '/placeholder-album-3.jpg').lastInsertRowid,
    insertAlbum.run('Album 4', artistIds[3], '/placeholder-album-4.jpg').lastInsertRowid,
  ];

  // Insert sample songs
  const insertSong = db.prepare('INSERT INTO Songs (title, artist_id, album_id, duration, file_path) VALUES (?, ?, ?, ?, ?)');
  const songIds = [
    insertSong.run('Song 1', artistIds[0], albumIds[0], 180, '/path/to/song1.mp3').lastInsertRowid,
    insertSong.run('Song 2', artistIds[1], albumIds[1], 200, '/path/to/song2.mp3').lastInsertRowid,
    insertSong.run('Song 3', artistIds[2], albumIds[2], 220, '/path/to/song3.mp3').lastInsertRowid,
    insertSong.run('Song 4', artistIds[3], albumIds[3], 190, '/path/to/song4.mp3').lastInsertRowid,
  ];

  // Insert sample playlists
  const insertPlaylist = db.prepare('INSERT INTO Playlists (user_id, name) VALUES (?, ?)');
  const playlistIds = [
    insertPlaylist.run(userId, 'Daily Mix 1').lastInsertRowid,
    insertPlaylist.run(userId, 'Daily Mix 2').lastInsertRowid,
    insertPlaylist.run(userId, 'My Favorites').lastInsertRowid,
    insertPlaylist.run(userId, 'Workout Mix').lastInsertRowid,
  ];

  // Insert sample playlist songs
  const insertPlaylistSong = db.prepare('INSERT INTO PlaylistSongs (playlist_id, song_id, song_order) VALUES (?, ?, ?)');
  playlistIds.forEach((playlistId) => {
    songIds.forEach((songId, index) => {
      insertPlaylistSong.run(playlistId, songId, index + 1);
    });
  });
});

// Run the sample data insertion
insertSampleData();

export default db;