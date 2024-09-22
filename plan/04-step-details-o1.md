# Detailed Project Plan for Building the Music Player App

---

Based on your request, here is a fleshed-out, step-by-step project plan for building your music player app using **Next.js**, **SQLite**, **Nx**, **Radix and Shadcn**, **Tailwind CSS**, and **Zustand**. We will prefer lighter weight tools like **Knex** or **Kysely** for the database access layer.

---

## **Phase 1: Project Setup & Planning**

### **Step 1: Define Project Scope & Requirements**

#### **1. Clarify Project Objectives**

- **Purpose of the App:**
  - Determine if the app is for personal use, internal deployment, or public release.
- **Legal Considerations:**
  - If streaming or downloading copyrighted music, ensure compliance with licensing laws and regulations.
  - Consider using royalty-free music or integrating with legal music APIs.

#### **2. Identify Target Audience**

- **User Personas:**
  - Create detailed profiles of potential users (e.g., casual listeners, audiophiles, playlist curators).
- **Use Cases:**
  - Offline playback.
  - Custom playlist creation.
  - Personalized recommendations.

#### **3. Compile Feature List**

- **MVP Features:**
  - User authentication and profile management.
  - Music playback with basic controls.
  - Playlist creation and management.
  - Offline support for downloaded songs.
- **Future Enhancements:**
  - Push notifications.
  - Lyrics display.
  - Real-time collaboration on playlists.

#### **4. Define Functional Requirements**

- **User Authentication:**
  - Secure signup, login, and logout functionalities.
- **Music Management:**
  - Ability to upload and manage personal music library.
  - Support for various audio formats (e.g., MP3, WAV).
- **Playback Features:**
  - Play, pause, skip tracks.
  - Volume control and seek functionality.
  - Display of album art and song metadata.

#### **5. Define Non-Functional Requirements**

- **Performance:**
  - Fast load times (<2 seconds).
  - Smooth playback without buffering.
- **Scalability:**
  - Support for increasing number of users and music files.
- **Security:**
  - Protection against common web vulnerabilities (e.g., XSS, SQL injection).
- **Usability:**
  - Intuitive UI/UX design.
  - Mobile responsiveness.
- **Accessibility:**
  - Compliance with WCAG 2.1 AA standards.

---

### **Step 2: Set Up Monorepo with Nx**

#### **1. Initialize Nx Workspace**

- **Command:**
  ```bash
  npx create-nx-workspace@latest music-player
  ```
- **Select Preset:**
  - Choose "React" or "Next.js" as the framework.
  - Name the application (e.g., `frontend`).

#### **2. Organize Project Structure**

- **Applications:**
  - `apps/frontend`: Next.js application.
- **Libraries:**
  - `libs/ui`: Shared UI components.
  - `libs/types`: TypeScript interfaces and types.
  - `libs/utils`: Utility functions.

#### **3. Configure Nx Workspace**

- **Update `nx.json` and `workspace.json` or `project.json` as needed.**
- **Set Up Project Graph:**
  - Utilize Nx's project graph to visualize dependencies.

#### **4. Install Essential Dependencies**

- **Frontend Dependencies:**
  ```bash
  cd apps/frontend
  pnpm install next react react-dom
  ```
- **Styling and UI Libraries:**
  ```bash
  pnpm install tailwindcss @radix-ui/react-* @shadcn/ui
  ```
- **State Management:**
  ```bash
  pnpm install zustand
  ```

#### **5. Set Up Shared Libraries**

- **Create Reusable Components:**
  - Buttons, modals, form elements.
- **Define TypeScript Interfaces:**
  - User, Song, Playlist, etc.

---

### **Step 3: Version Control & Collaboration**

#### **1. Initialize Git Repository**

- **Command:**
  ```bash
  git init
  ```
- **Add Remote Origin:**
  ```bash
  git remote add origin <your-repo-url>
  ```

#### **2. Create `.gitignore` File**

- **Contents:**
  ```
  node_modules/
  .env
  dist/
  build/
  .DS_Store
  ```

#### **3. Set Up Branching Strategy**

- **Main Branches:**
  - `main`: Stable production-ready code.
  - `develop`: Integration branch for features.
- **Feature Branches:**
  - Naming convention: `feature/feature-name`.

#### **4. Implement Code Quality Tools**

- **ESLint and Prettier:**
  ```bash
  pnpm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
  ```
- **Husky for Git Hooks:**
  ```bash
  pnpm install husky --save-dev
  npx husky install
  npx husky add .husky/pre-commit "pnpm run lint"
  ```
- **Lint-Staged:**
  ```bash
  pnpm install lint-staged --save-dev
  ```
  - Configure in `package.json`:
    ```json
    "lint-staged": {
      "*.js": ["eslint --fix", "prettier --write"]
    }
    ```

#### **5. Set Up Continuous Integration**

- **Choose CI Tool:**
  - GitHub Actions, GitLab CI/CD, or CircleCI.
- **Configure Workflow:**
  - Automated testing on pull requests.
  - Linting and build checks.

---

### **Step 4: Environment Setup**

#### **1. Install Necessary Tools**

- **Node.js and pnpm:**
  - Install the latest LTS version.
- **SQLite:**
  - Install SQLite for database management.

#### **2. Configure IDE**

- **Recommended Extensions:**
  - VSCode with ESLint, Prettier, Tailwind CSS IntelliSense.

#### **3. Set Up Environment Variables**

- **Create `.env` File:**
  ```
  DATABASE_URL=sqlite:./dev.sqlite3
  JWT_SECRET=your_jwt_secret
  ```
- **Add `.env` to `.gitignore`.**

#### **4. Set Up Docker (Optional)**

- **Create `Dockerfile`:**
  - For consistent development environments.
- **Create `docker-compose.yml`:**
  - If using multiple services.

#### **5. Install Global CLI Tools**

- **Nx CLI:**
  ```bash
  pnpm install -g nx
  ```

---

## **Phase 2: Database Design & Backend Development**

### **Step 1: Design SQLite Database Schema**

#### **1. Define Database Tables**

- **Users Table:**
  - `id` (primary key)
  - `username` (unique)
  - `email` (unique)
  - `password_hash`
  - `created_at`
  - `updated_at`
- **Songs Table:**
  - `id` (primary key)
  - `title`
  - `artist`
  - `album`
  - `duration`
  - `file_path`
  - `created_at`
- **Playlists Table:**
  - `id` (primary key)
  - `user_id` (foreign key)
  - `name`
  - `created_at`
- **Playlist_Songs Table:**
  - `playlist_id` (foreign key)
  - `song_id` (foreign key)
  - `order`

#### **2. Establish Relationships**

- **Users and Playlists:**
  - One-to-many (a user can have multiple playlists).
- **Playlists and Songs:**
  - Many-to-many (a playlist can have multiple songs, and a song can be in multiple playlists).

#### **3. Use Indexes for Performance**

- **Indexes on:**
  - `user_id` in Playlists.
  - `playlist_id` and `song_id` in Playlist_Songs.

---

### **Step 2: Set Up Database Access Layer with Knex or Kysely**

#### **1. Install Knex**

- **Command:**
  ```bash
  pnpm install knex sqlite3
  ```

#### **2. Initialize Knex Configuration**

- **Create `knexfile.js`:**
  ```javascript
  module.exports = {
    development: {
      client: 'sqlite3',
      connection: {
        filename: './dev.sqlite3',
      },
      useNullAsDefault: true,
    },
    production: {
      client: 'sqlite3',
      connection: {
        filename: './prod.sqlite3',
      },
      useNullAsDefault: true,
    },
  };
  ```

#### **3. Create Migration Scripts**

- **Create Migrations:**
  ```bash
  npx knex migrate:make create_users_table
  npx knex migrate:make create_songs_table
  npx knex migrate:make create_playlists_table
  npx knex migrate:make create_playlist_songs_table
  ```
- **Define Schema in Migrations:**
  - Example for `users` table:
    ```javascript
    exports.up = function (knex) {
      return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('username').notNullable().unique();
        table.string('email').notNullable().unique();
        table.string('password_hash').notNullable();
        table.timestamps(true, true);
      });
    };
    ```

#### **4. Run Migrations**

- **Command:**
  ```bash
  npx knex migrate:latest
  ```

#### **5. Set Up Query Builders**

- **Create Repositories:**
  - `repositories/userRepository.js`
  - `repositories/songRepository.js`
- **Example Query:**
  ```javascript
  const knex = require('knex')(require('../knexfile').development);

  const getUserById = (id) => {
    return knex('users').where({ id }).first();
  };
  ```

---

### **Step 3: Develop Next.js API Routes**

#### **1. Set Up API Route Structure**

- **Directory:**
  - `apps/frontend/pages/api/`
- **Organize Routes:**
  - `auth/`: Authentication-related endpoints.
  - `user/`: User profile and preferences.
  - `playlists/`: Playlist management.
  - `music/`: Music streaming and downloading.

#### **2. Implement Authentication Endpoints**

- **Signup (`/api/auth/signup`):**
  - Validate input data.
  - Hash password with `bcrypt`.
  - Save user to database.
- **Login (`/api/auth/login`):**
  - Verify email and password.
  - Generate JWT token.
  - Return token to client.
- **Logout (`/api/auth/logout`):**
  - Invalidate token on client-side.

#### **3. Implement User Management Endpoints**

- **Profile (`/api/user/profile`):**
  - **GET:** Return user profile data.
  - **PUT:** Update user profile.
- **Preferences (`/api/user/preferences`):**
  - **GET:** Get user preferences.
  - **PUT:** Update preferences.

#### **4. Implement Playlist Management Endpoints**

- **Playlists (`/api/playlists`):**
  - **GET:** List all user playlists.
  - **POST:** Create a new playlist.
- **Playlist Detail (`/api/playlists/[id]`):**
  - **GET:** Get playlist details.
  - **PUT:** Update playlist.
  - **DELETE:** Delete playlist.

#### **5. Implement Music Serving Endpoints**

- **Stream Song (`/api/music/stream/[songId]`):**
  - Support range requests for streaming.
  - Set appropriate headers (`Content-Type`, `Accept-Ranges`).
- **Download Song (`/api/music/download/[songId]`):**
  - Provide file download with correct headers.

#### **6. Add Middleware for Authentication**

- **Create Middleware Function:**
  ```javascript
  const jwt = require('jsonwebtoken');

  const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access Denied');

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).send('Invalid Token');
      req.user = user;
      next();
    });
  };
  ```
- **Apply Middleware to Protected Routes.**

---

### **Step 4: Implement Security Measures**

#### **1. Password Encryption**

- **Install `bcrypt`:**
  ```bash
  pnpm install bcrypt
  ```
- **Hash Passwords:**
  ```javascript
  const bcrypt = require('bcrypt');
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  ```

#### **2. JWT Authentication**

- **Install `jsonwebtoken`:**
  ```bash
  pnpm install jsonwebtoken
  ```
- **Generate Tokens:**
  ```javascript
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  ```
- **Verify Tokens in Middleware.**

#### **3. Input Validation and Sanitization**

- **Install Validation Library:**
  ```bash
  pnpm install yup
  ```
- **Define Validation Schemas:**
  ```javascript
  const signupSchema = yup.object().shape({
    username: yup.string().required(),
    email: yup.string().email().required(),
    password: yup.string().required(),
  });
  ```
- **Validate Inputs:**
  ```javascript
  try {
    await signupSchema.validate(req.body);
  } catch (err) {
    return res.status(400).send(err.errors);
  }
  ```

#### **4. Implement Rate Limiting**

- **Install `express-rate-limit`:**
  ```bash
  pnpm install express-rate-limit
  ```
- **Configure Rate Limiting:**
  ```javascript
  const rateLimit = require('express-rate-limit');
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  });
  app.use(limiter);
  ```

#### **5. Secure Headers**

- **Install `helmet`:**
  ```bash
  pnpm install helmet
  ```
- **Use Helmet Middleware:**
  ```javascript
  app.use(helmet());
  ```

#### **6. Enable HTTPS**

- **Set Up SSL Certificates:**
  - Use Let's Encrypt for free SSL certificates.
- **Redirect HTTP to HTTPS:**
  - Configure server to redirect all traffic to HTTPS.

---

## **Phase 3: Frontend Development**

### **Step 1: Set Up Next.js Frontend**

#### **1. Initialize Next.js App**

- **If Not Done Already:**
  ```bash
  npx create-next-app@latest .
  ```

#### **2. Configure TypeScript**

- **Install TypeScript and Types:**
  ```bash
  pnpm install --save-dev typescript @types/react @types/node
  ```
- **Add `tsconfig.json`:**
  - Next.js will auto-generate one.

#### **3. Set Up Folder Structure**

- **Directories:**
  - `components/`: For reusable components.
  - `pages/`: For page components.
  - `styles/`: For global styles.
  - `hooks/`: For custom hooks.
  - `context/`: For context providers.

#### **4. Configure Global Styles**

- **Import Tailwind CSS in `_app.tsx`:**
  ```javascript
  import '../styles/globals.css';
  ```

---

### **Step 2: Integrate Tailwind CSS**

#### **1. Install Tailwind CSS**

- **Commands:**
  ```bash
  pnpm install tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

#### **2. Configure `tailwind.config.js`**

- **Content Paths:**
  ```javascript
  module.exports = {
    content: [
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {},
    },
    plugins: [],
  };
  ```

#### **3. Add Tailwind Directives to CSS**

- **In `styles/globals.css`:**
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

#### **4. Customize Theme (Optional)**

- **Add Custom Colors or Fonts:**
  ```javascript
  theme: {
    extend: {
      colors: {
        primary: '#1db954',
      },
    },
  },
  ```

---

### **Step 3: Implement UI Components with Radix and Shadcn**

#### **1. Install Radix UI Components**

- **Commands:**
  ```bash
  pnpm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip
  ```

#### **2. Set Up Shadcn UI**

- **Install Shadcn UI:**
  ```bash
  pnpm install @shadcn/ui
  ```
- **Configure Shadcn UI:**
  - Follow the documentation for initial setup.

#### **3. Create Reusable Components**

- **Examples:**
  - **Button Component:**
    - Variants for primary, secondary, etc.
  - **Modal Component:**
    - For dialogs and pop-ups.
  - **Navigation Bar:**
    - Responsive design with collapsible menus.

#### **4. Ensure Accessibility**

- **Use ARIA Attributes:**
  - Make components accessible to screen readers.
- **Keyboard Navigation:**
  - Ensure all interactive elements are keyboard navigable.

---

### **Step 4: Develop Core Features**

#### **User Authentication & Profile Management**

##### **1. Create Authentication Pages**

- **Signup Page (`pages/signup.tsx`):**
  - Form with fields for username, email, password.
- **Login Page (`pages/login.tsx`):**
  - Form with fields for email and password.

##### **2. Implement Form Validation**

- **Use `react-hook-form`:**
  ```bash
  pnpm install react-hook-form
  ```
- **Integrate Yup Validation:**
  ```bash
  pnpm install @hookform/resolvers yup
  ```
- **Example:**
  ```javascript
  import { useForm } from 'react-hook-form';
  import { yupResolver } from '@hookform/resolvers/yup';

  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
  });

  const { register, handleSubmit, errors } = useForm({
    resolver: yupResolver(schema),
  });
  ```

##### **3. Manage Authentication State**

- **Create Auth Context:**
  - Use React Context API to store user state.
- **Persist Authentication:**
  - Store JWT in HTTP-only cookies or secure storage.

##### **4. Protect Routes**

- **Implement Higher-Order Component (HOC):**
  - Redirect unauthenticated users to login page.
- **Example:**
  ```javascript
  const withAuth = (WrappedComponent) => {
    return (props) => {
      const { user } = useAuth();
      if (!user) {
        return <Redirect to="/login" />;
      }
      return <WrappedComponent {...props} />;
    };
  };
  ```

#### **Music Playback**

##### **1. Build the Music Player Interface**

- **Components:**
  - Play/Pause Button.
  - Next/Previous Buttons.
  - Seek Bar.
  - Volume Control.
  - Display of Current Track Information.

##### **2. Implement Audio Playback**

- **Use HTML5 Audio Element:**
  - Control playback via JavaScript.
- **Manage Playback State:**
  - Use Zustand to store playback status.

##### **3. Implement Playback Controls**

- **Play/Pause Functionality:**
  ```javascript
  const audioRef = useRef(null);

  const play = () => {
    audioRef.current.play();
  };

  const pause = () => {
    audioRef.current.pause();
  };
  ```
- **Seek Functionality:**
  - Update `currentTime` property of the audio element.

##### **4. Handle Playback Queue**

- **Manage Queue in State:**
  - Actions to add, remove, and reorder songs.
- **Implement Shuffle and Repeat:**
  - Toggle shuffle mode in state.
  - Handle repeat logic.

#### **Playlist Management**

##### **1. Create Playlist Pages**

- **Playlist List (`pages/playlists/index.tsx`):**
  - Display all user playlists.
- **Playlist Detail (`pages/playlists/[id].tsx`):**
  - Show songs in the playlist.
  - Options to play, edit, or delete.

##### **2. Implement Playlist Creation and Editing**

- **Forms for Creating/Editing Playlists:**
  - Fields for playlist name and description.
- **Add Songs to Playlists:**
  - Interface to select and add songs.

##### **3. Enable Drag-and-Drop Reordering**

- **Use `react-beautiful-dnd`:**
  ```bash
  pnpm install react-beautiful-dnd
  ```
- **Implement Drag-and-Drop List:**
  - Update song order in state and database upon reordering.

#### **Navigation & UI/UX**

##### **1. Develop Responsive Navigation Bar**

- **Left-Side Navigation:**
  - Links to Home, Search, Your Library.
- **Mobile Responsiveness:**
  - Collapsible menu for smaller screens.

##### **2. Implement Now Playing Bar**

- **Persistent Footer Component:**
  - Shows current song and controls.
  - Remains visible across pages.

##### **3. Add Theme Toggling**

- **Implement Light/Dark Mode:**
  - Use Tailwind CSS dark mode.
  - Toggle theme in user preferences.
- **Persist Theme Preference:**
  - Store in localStorage or user profile.

---

### **Step 5: State Management with Zustand**

#### **1. Install Zustand**

- **Command:**
  ```bash
  pnpm install zustand
  ```

#### **2. Create Global State Stores**

##### **Playback Store**

- **Define Store:**
  ```javascript
  import create from 'zustand';

  export const usePlaybackStore = create((set) => ({
    currentSong: null,
    isPlaying: false,
    playSong: (song) => set({ currentSong: song, isPlaying: true }),
    pauseSong: () => set({ isPlaying: false }),
  }));
  ```

##### **User Store**

- **Manage User Data:**
  ```javascript
  export const useUserStore = create((set) => ({
    user: null,
    setUser: (userData) => set({ user: userData }),
  }));
  ```

##### **Playlist Store**

- **Manage Playlists:**
  ```javascript
  export const usePlaylistStore = create((set) => ({
    playlists: [],
    setPlaylists: (playlists) => set({ playlists }),
  }));
  ```

#### **3. Persist State with Middleware**

- **Use `zustand/middleware`:**
  ```javascript
  import { persist } from 'zustand/middleware';

  export const usePlaybackStore = create(
    persist(
      (set) => ({
        // state and actions
      }),
      {
        name: 'playback-storage',
      }
    )
  );
  ```

---

## **Phase 4: Integration & Testing**

### **Step 1: Integrate Frontend with Backend APIs**

#### **1. Create API Service Layer**

- **Centralize API Calls:**
  - `services/api.js`
- **Use `fetch` or `axios`:**
  ```javascript
  import axios from 'axios';

  const api = axios.create({
    baseURL: '/api',
  });

  // Add JWT token to headers
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  ```

#### **2. Handle Authentication State**

- **Update Auth Context:**
  - Store JWT token securely.
- **Refresh Tokens (Optional):**
  - Implement token refresh mechanism.

#### **3. Error Handling**

- **Global Error Handler:**
  - Intercept API responses for errors.
- **Display Notifications:**
  - Use UI components to show error messages.

---

### **Step 2: File Management**

#### **1. Organize Music Files**

- **Server Storage:**
  - Store in a designated folder (e.g., `public/music`).
- **Database Reference:**
  - Save file paths in the database.

#### **2. Serve Static Files**

- **Next.js Configuration:**
  - Place files in the `public` directory for static serving.

#### **3. Implement Streaming**

- **Handle Range Requests:**
  - In API route, parse `Range` header.
  - Use `fs.createReadStream` with start and end positions.

---

### **Step 3: Implement Performance Optimizations**

#### **1. Code Splitting**

- **Dynamic Imports:**
  ```javascript
  const Player = dynamic(() => import('../components/Player'), {
    ssr: false,
  });
  ```

#### **2. Image Optimization**

- **Use Next.js Image Component:**
  ```javascript
  import Image from 'next/image';

  <Image src="/album-art.jpg" width={500} height={500} alt="Album Art" />;
  ```

#### **3. Caching Strategies**

- **Implement SWR for Data Fetching:**
  ```bash
  pnpm install swr
  ```

- **Use SWR Hook:**
  ```javascript
  import useSWR from 'swr';

  const { data, error } = useSWR('/api/playlists', fetcher);
  ```

---

### **Step 4: Testing**

#### **1. Unit Testing**

- **Install Jest and React Testing Library:**
  ```bash
  pnpm install --save-dev jest @testing-library/react @testing-library/jest-dom
  ```

- **Configure Jest:**
  - Add `jest.config.js`.

- **Write Tests:**
  - For components, utilities, and hooks.

#### **2. Integration Testing**

- **Test API Routes:**
  - Use Supertest for testing API endpoints.
  ```bash
  pnpm install --save-dev supertest
  ```

#### **3. End-to-End (E2E) Testing**

- **Install Cypress:**
  ```bash
  pnpm install cypress --save-dev
  ```

- **Write E2E Tests:**
  - Simulate user workflows.

#### **4. Accessibility Testing**

- **Use `axe-core`:**
  ```bash
  pnpm install --save-dev axe-core
  ```

- **Integrate in Tests:**
  - Check for accessibility violations.

---

## **Phase 5: Deployment & Maintenance**

### **Step 1: Prepare for Deployment**

#### **1. Choose Hosting Platform**

- **Vercel:**
  - Ideal for Next.js applications.
- **Alternative Options:**
  - Netlify, AWS Amplify.

#### **2. Set Up Environment Variables**

- **Configure in Hosting Platform:**
  - Add `DATABASE_URL`, `JWT_SECRET`, etc.

#### **3. Optimize Build**

- **Production Build:**
  ```bash
  pnpm run build
  ```

- **Check for Warnings and Errors:**
  - Address any issues before deployment.

---

### **Step 2: Deploy the Application**

#### **1. Connect Repository**

- **With Vercel:**
  - Import Git repository.
  - Configure build settings.

#### **2. Set Up Continuous Deployment**

- **Automatic Deployments:**
  - On push to `main` branch.

#### **3. Verify Deployment**

- **Test All Features:**
  - Ensure functionality in the production environment.

---

### **Step 3: Monitor & Optimize**

#### **1. Implement Monitoring Tools**

- **Error Tracking with Sentry:**
  ```bash
  pnpm install @sentry/node @sentry/react
  ```
- **User Analytics:**
  - Integrate Google Analytics or similar.

#### **2. Performance Monitoring**

- **Use Lighthouse Audits:**
  - Identify performance bottlenecks.

#### **3. Collect User Feedback**

- **In-App Feedback Forms:**
  - Allow users to report issues.

---

### **Step 4: Maintain and Scale**

#### **1. Regular Updates**

- **Dependency Management:**
  - Use tools like `pnpm-check-updates`.

#### **2. Database Scaling**

- **Consider Migration:**
  - If needed, migrate from SQLite to a more scalable solution like PostgreSQL.

#### **3. Security Audits**

- **Periodic Reviews:**
  - Check for vulnerabilities and patch promptly.

---

## **Phase 6: Future Enhancements (Bonus Features)**

### **Push Notifications**

#### **1. Implement Web Push API**

- **Request User Permission:**
  - Prompt users to allow notifications.

#### **2. Set Up Service Workers**

- **Register Service Worker:**
  ```javascript
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
  ```

#### **3. Backend Support**

- **Send Notifications:**
  - Use libraries like `web-push`.

---

### **Lyrics Display**

#### **1. Integrate with Lyrics API**

- **Choose API:**
  - Musixmatch, Genius, or similar.
- **Handle API Authentication:**
  - Securely store API keys.

#### **2. Display Lyrics**

- **Create Lyrics Component:**
  - Fetch and render lyrics synchronized with playback.

---

### **Real-Time Collaboration**

#### **1. Implement WebSockets**

- **Use Socket.IO:**
  ```bash
  pnpm install socket.io
  ```

#### **2. Collaborative Playlists**

- **Real-Time Updates:**
  - Reflect changes made by other users instantly.

---

### **Enhanced Offline Support**

#### **1. Progressive Web App (PWA)**

- **Add Manifest File:**
  - Define app metadata.

#### **2. Advanced Caching**

- **Use Workbox:**
  ```bash
  pnpm install workbox-webpack-plugin --save-dev
  ```

- **Configure Service Worker:**
  - Cache assets and API responses.

---

# **Conclusion**

This detailed plan provides a comprehensive roadmap for developing your music player app, focusing on each step with the preferred lightweight tools like **Knex**. By following this plan, you can ensure a systematic approach to development, covering all critical aspects from initial setup to deployment and future enhancements.

Remember to continually adapt and refine the plan based on project needs, team feedback, and user responses to build a successful and engaging application.

---

**Note:** Always ensure compliance with legal requirements, especially regarding music licensing and user data privacy.
