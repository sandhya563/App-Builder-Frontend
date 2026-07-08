# App Builder — Frontend

AI-powered HighLevel App Builder frontend built with Vue.js and Firebase. Features a responsive UI, secure authentication, real-time data synchronization, AI-powered app generation, and seamless integration with backend APIs.

## Tech Stack

- **Vue 3** — Composition API with `<script setup>`
- **TypeScript** — Type safety
- **Pinia** — State management
- **Vue Router** — Client-side routing
- **Tailwind CSS v4** — Utility-first styling
- **ShadCN-style components** — Button, Input, Card, Badge
- **Monaco Editor** — Code editing
- **Firebase Auth** — Client-side authentication
- **Vite** — Build tool

## Project Structure

```
src/
├── main.ts                  # App entry point
├── App.vue                  # Root component
├── assets/
│   └── index.css            # Tailwind + theme variables
├── components/
│   ├── ui/                  # ShadCN-style UI components
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Card.vue
│   │   └── Badge.vue
│   ├── ChatPanel.vue        # Chat interface
│   ├── CodeEditor.vue       # Monaco code editor
│   ├── LivePreview.vue      # iframe preview
│   └── SnapshotHistory.vue  # Version history
├── composables/             # Vue composables
├── lib/
│   ├── api.ts               # Axios instance with auth
│   ├── firebase.ts          # Firebase config
│   └── utils.ts             # Utility functions (cn)
├── router/
│   └── index.ts             # Route definitions + guards
├── stores/
│   ├── auth.ts              # Authentication state
│   ├── editor.ts            # Editor/chat/files/SSE state
│   └── projects.ts          # Projects CRUD state
├── types/                   # TypeScript types
└── views/
    ├── LoginView.vue        # Sign in
    ├── RegisterView.vue     # Sign up
    ├── DashboardView.vue    # Project list + HL connection
    └── ProjectView.vue      # Three-panel workspace
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase config
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```

The app runs on `http://localhost:5173` and proxies `/api` to the backend at `http://localhost:3002`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Features

- **Auth screens** — Login / Register with Firebase Auth
- **HighLevel OAuth** — Connect HighLevel account from dashboard
- **Chat panel** — Send prompts, see AI responses streamed live
- **Code editor** — Monaco with file tabs, syntax highlighting, save
- **Live preview** — iframe renders generated HTML/JS/CSS
- **SSE integration** — Real-time token streaming from backend
- **Snapshot history** — View and restore previous versions
