# Music Player App

This project is a music player application built with Next.js, SQLite, and managed within an Nx workspace.

## Project Overview

The Music Player App allows users to:
- Create and manage personal playlists
- Play local music files
- Manage user profiles and preferences

## Technologies Used

- Next.js: React framework for building the frontend and API routes
- SQLite: Local database for storing user data and music metadata
- Nx: Monorepo management tool
- Tailwind CSS: Utility-first CSS framework for styling
- Zustand: State management library

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm package manager

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/music-player.git
   cd music-player
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add necessary environment variables.

### Running the Application

To start the development server:

```
npx nx serve music-player
```

The application will be available at `http://localhost:4200`.

### Running Tests

To run the test suite:

```
npx nx test music-player
```

## Project Structure

- `apps/music-player/`: Main Next.js application
- `apps/music-player-e2e/`: End-to-end tests
- `libs/`: Shared libraries and components

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

For more information on using Nx, visit the [Nx Documentation](https://nx.dev).
