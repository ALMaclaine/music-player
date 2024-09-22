# Music Player Database Schema

## Users Table
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- username: TEXT NOT NULL UNIQUE
- email: TEXT NOT NULL UNIQUE
- password_hash: TEXT NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP

## Songs Table
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- title: TEXT NOT NULL
- artist: TEXT NOT NULL
- album: TEXT
- duration: INTEGER NOT NULL  # Duration in seconds
- file_path: TEXT NOT NULL UNIQUE
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP

## Playlists Table
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- name: TEXT NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- FOREIGN KEY (user_id) REFERENCES Users(id)

## PlaylistSongs Table
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- playlist_id: INTEGER NOT NULL
- song_id: INTEGER NOT NULL
- order: INTEGER NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- FOREIGN KEY (playlist_id) REFERENCES Playlists(id)
- FOREIGN KEY (song_id) REFERENCES Songs(id)

## UserFavorites Table
- id: INTEGER PRIMARY KEY AUTOINCREMENT
- user_id: INTEGER NOT NULL
- song_id: INTEGER NOT NULL
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- FOREIGN KEY (user_id) REFERENCES Users(id)
- FOREIGN KEY (song_id) REFERENCES Songs(id)

This schema design allows for:
1. User management with authentication
2. Song storage and retrieval
3. Playlist creation and management
4. Tracking user's favorite songs
5. Maintaining the order of songs within playlists

Note: Indexes should be added to frequently queried columns to improve performance.