# Treasure Hunt App

GPS-based interactive treasure hunt PWA for Boxing Day at Bushey Park. Teams of children follow GPS-triggered clues to find hidden treasures.

## Tech Stack

- **Framework:** React 19 + Vite 7
- **Styling:** Tailwind CSS 4
- **Routing:** React Router DOM 7
- **Mapping:** Leaflet + React Leaflet (OpenStreetMap tiles)
- **Backend:** Firebase Firestore (with localStorage fallback)
- **Deployment:** Vercel

## Commands

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── App.jsx        # Main game component (all game logic, components, data)
├── TeaserPage.jsx # Landing page before hunt starts
├── main.jsx       # React entry with routing
├── firebase.js    # Firebase configuration
└── index.css      # Global styles + Tailwind
```

## Routes

- `/` - TeaserPage (landing/teaser)
- `/hunt` - App (main game)

## Key Patterns

### Monolithic Component
All game logic lives in `App.jsx` including:
- TeamSelect, GameScreen, ClueCard components
- AdminPanel for route customization
- Map components (MapContainer, MiniMap, MapPicker)
- DirectionIndicator for navigation guidance
- Sound effects using Web Audio API
- Default game data (DEFAULT_STOPS)

### Team Theming
Two teams with distinct styling:
- **Team Sparkle:** Pink/fuchsia theme
- **Team Thunder:** Blue/indigo theme

### Geolocation
- Uses `navigator.geolocation.watchPosition()` for continuous tracking
- Haversine formula for distance calculation
- 30-meter default unlock radius (configurable in admin)

### Data Persistence (3-tier)
1. Firebase Firestore (primary)
2. LocalStorage (fallback)
3. Hardcoded DEFAULT_STOPS (last resort)

### Sound Effects
Procedural audio via Web Audio API - no audio files needed:
- `playSound('sparkle')` - unlock sound for Sparkle team
- `playSound('thunder')` - unlock sound for Thunder team
- `playSound('victory')` - game completion sound

## Admin Panel

- Password: `bushey2025`
- Features:
  - Add new stops to either team
  - Edit stops (name, coordinates, clue, hint)
  - Delete stops (minimum 2 per team)
  - Capture GPS location
  - Map picker for precise coordinates
  - Adjust unlock radius
- Export/import config as JSON
- Cloud save to Firebase

## Environment Variables

Create `.env.local` from `.env.example`:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Data Structure

```javascript
DEFAULT_STOPS = {
  sparkle: [
    { id: 'S0', name: 'Location Name', lat: 51.xxx, lng: -0.xxx,
      clue: 'Clue text', hint: 'Hint text' },
    // ... 8 stops total
  ],
  thunder: [ /* similar structure */ ]
}
```

## Development Notes

- Mobile-first design with PWA capabilities
- All emojis rendered as text/SVG (no image assets needed)
- Map uses free OpenStreetMap tiles (no API key required)
- Background image: `public/tresure-hunt-bg.png`
