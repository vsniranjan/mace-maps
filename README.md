# MACE Campus Map

An interactive campus map application for Mar Athanasius College of Engineering Kothamangalam, featuring:

- Interactive SVG campus map with all buildings and landmarks
- Floor plans for CS Block (2nd & 3rd floor)
- Live GPS location tracking
- Search for rooms and buildings
- Navigation with distance and directions
- Firebase Realtime Database integration

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Firebase

Copy the example config file:
```bash
cp src/config/firebase.config.example.ts src/config/firebase.config.local.ts
```

Edit `src/config/firebase.config.local.ts` with your Firebase credentials:
```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... other config values from Firebase Console
};
```

### 3. Build and run
```bash
npm run build
npm run serve
```

Open http://localhost:8080 in your browser.

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com/)
2. Add a Web App to your project
3. Enable Realtime Database
4. Copy your config to `src/config/firebase.config.local.ts`

## Project Structure

```
├── index.html              # Main HTML file
├── index.css               # Google Maps-inspired styling
├── src/
│   ├── app.ts              # Main application controller
│   ├── types.ts            # TypeScript interfaces
│   ├── config/
│   │   ├── firebase.config.example.ts  # Template (commit this)
│   │   └── firebase.config.local.ts    # Your config (gitignored)
│   ├── data/
│   │   ├── locations.ts    # Campus coordinates (20 locations)
│   │   └── rooms.ts        # Room data (35 rooms)
│   └── components/
│       ├── map.ts          # SVG campus map
│       ├── floor-plans.ts  # Floor plan rendering
│       ├── search.ts       # Search with autocomplete
│       ├── navigation.ts   # Routing & directions
│       └── location.ts     # GPS tracking + Firebase
└── dist/                   # Compiled JavaScript
```

## Scripts

- `npm run build` - Compile TypeScript
- `npm run serve` - Start development server
- `npm run watch` - Watch for changes and recompile

## Technologies

- TypeScript
- SVG for maps
- Firebase Realtime Database
- Browser Geolocation API

## License

MIT
