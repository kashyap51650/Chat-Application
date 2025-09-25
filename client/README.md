# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Chat App Client

A modern React client for the GraphQL Chat Application built with Vite, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Authentication** - Login and registration
- 💬 **Real-time Chat** - Send and receive messages instantly
- 👥 **Group Chats** - Create and participate in group conversations
- 🟢 **Online Status** - See who's online
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎨 **Modern UI** - Clean and intuitive interface
- ⚡ **Fast Performance** - Built with Vite for optimal speed

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Apollo Client** - GraphQL client with caching
- **React Router** - Client-side routing
- **GraphQL Subscriptions** - Real-time updates via WebSockets

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- GraphQL server running (see ../Server/README.md)

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── chat/           # Chat-related components
│   └── ui/             # Reusable UI components
├── context/            # React context providers
├── graphql/            # GraphQL operations
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── types/              # TypeScript type definitions
└── App.tsx             # Main app component
```

## Configuration

Make sure your GraphQL server is running on `http://localhost:4000/graphql` for the client to connect properly.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
