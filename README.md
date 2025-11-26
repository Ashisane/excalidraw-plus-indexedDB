# Excalidraw Canvas Manager

A web application built with React, TypeScript, and Vite that extends Excalidraw with canvas management capabilities.

## Features

- **Multiple Canvas Support**: Create and manage multiple drawing canvases
- **Auto-Save**: Press `Ctrl+S` to save your work to IndexedDB
- **Auto-Rename**: Click on the filename to rename - automatically saves on blur or Enter
- **Canvas Management**: 
  - Create new canvases with auto-incremented names (Untitled 1, Untitled 2, etc.)
  - Browse all your canvases from a clean selector screen
  - Delete canvases with confirmation
  - Navigate between canvases and selector with Home button
- **Theme Support**: Automatically remembers your light/dark mode preference
- **Local Storage**: All data stored locally in IndexedDB - works completely offline

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Excalidraw** for the drawing interface
- **IndexedDB** for local data persistence

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Create a Canvas**: Click the "+New Canvas" card on the selector screen
2. **Draw**: Use all of Excalidraw's powerful drawing tools
3. **Save**: Press `Ctrl+S` (or `Cmd+S` on Mac) to save your work
4. **Rename**: Click on the canvas name in the top-left to rename it
5. **Go Home**: Click the "← Home" button to return to canvas selector
6. **Delete**: Click the trash icon on any canvas card to delete it

## Project Structure

```
src/
├── App.tsx              # Main app component with routing logic
├── App.css              # Styles for canvas selector and UI
├── services/
│   └── indexedDB.ts     # IndexedDB service for data persistence
└── ...
```

## License

MIT
