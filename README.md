# 🦄⚡ Magical Heroes Mission - Treasure Hunt App

GPS-based interactive treasure hunt PWA for Boxing Day at Bushey Park. Teams of children follow GPS-triggered clues to find hidden treasures.

## Using the App

### For Kids
1. Open the app on a phone
2. Select your team (Team Sparkle 🦄 or Team Thunder ⚡)
3. Follow the direction indicator and mini-map to each location
4. Clues unlock automatically when you're within 30m of the target
5. Follow the clues to find the treasure!

### Admin Setup (Before the Hunt)

1. Tap "Admin Setup" on the team selection screen
2. Password: `bushey2025`
3. Use the admin panel to:
   - **Add stops**: Click "Add New Stop" to add more checkpoints to either team
   - **Edit stops**: Update names, clues, hints, and coordinates
   - **Delete stops**: Remove stops you no longer need (minimum 2 required)
   - **Set GPS location**: Tap "Set to Current Location" while at a stop
   - **Map picker**: Click the map to set precise coordinates
   - **Adjust unlock radius**: Default 30m - increase if GPS is unreliable
   - **Cloud save**: Sync configuration across all devices via Firebase
   - **Export/Import**: Save or load config as JSON file

### Recommended Recce Workflow

1. Walk the route with your phone
2. At each stop, open Admin > Edit that stop > "Set to Current Location"
3. Click "Save to Cloud" to sync across all devices
4. Alternatively, export the config and import on other phones

---

## Features

- 🗺️ Interactive map with Leaflet (OpenStreetMap)
- 🧭 Direction indicator showing bearing to next stop
- 📍 GPS-triggered clue unlocking (30m radius)
- 🎨 Team-themed interfaces (Sparkle pink/fuchsia, Thunder blue/indigo)
- 🔊 Procedural sound effects via Web Audio API
- 📊 Progress tracking across checkpoints
- ☁️ Cloud sync via Firebase Firestore
- 💾 LocalStorage fallback for offline use
- 📱 PWA - installable on home screen
- 🔓 Adult override button for GPS issues

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

### Environment Setup

Create `.env.local` from `.env.example` with your Firebase credentials:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Vercel CLI

```bash
npm install -g vercel
vercel
```

---

## Customisation

### Changing Clues
Edit `src/App.jsx` and find the `DEFAULT_STOPS` object, or use the Admin panel.

### Changing the Password
Search for `bushey2025` in `src/App.jsx` and replace it.

### Changing the Unlock Radius
Adjust in Admin panel or change `DEFAULT_UNLOCK_RADIUS` in `src/App.jsx`.

---

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- React Router DOM 7
- Leaflet + React Leaflet (mapping)
- Firebase Firestore (cloud persistence)
- Web Geolocation API
- Web Audio API (procedural sounds)
- LocalStorage (offline fallback)

---

Enjoy the hunt! 🎉
