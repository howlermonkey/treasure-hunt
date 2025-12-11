# 🦄⚡ Magical Heroes Mission - Treasure Hunt App

Boxing Day Treasure Hunt for Bushey Park (Clapperstile Gate area)

## Quick Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/treasure-hunt.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"
   - Done! You'll get a URL like `treasure-hunt-xyz.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. Follow the prompts. Done!

---

## Using the App

### For Kids
1. Open the app on a phone
2. Select your team (Sparkle 🦄 or Thunder ⚡)
3. Walk to each location - clues unlock automatically when you're within 30m
4. Follow the clues to find the treasure!

### Admin Setup (Before the Hunt)

1. Tap "Admin Setup" on the home screen
2. Password: `bushey2025`
3. Use the admin panel to:
   - **Edit coordinates**: Tap any stop, then "Set to Current Location" while standing at that spot
   - **Adjust unlock radius**: Default is 30m - increase if GPS is flaky
   - **Export config**: Save your setup as a JSON file
   - **Import config**: Load a saved configuration

### Recommended Recce Workflow

1. Walk the route with your phone
2. At each stop location, open Admin > Edit that stop > "Set to Current Location"
3. Export the config when done
4. Import the same config on all phones being used

---

## Features

- ✅ GPS-triggered clue unlocking
- ✅ Themed interfaces (Unicorn vs Superhero)
- ✅ Sound effects on unlock
- ✅ Progress tracking
- ✅ Adult override button (for GPS issues)
- ✅ Offline-capable once loaded
- ✅ Works on any smartphone browser

---

## Customisation

### Changing Clues
Edit `src/App.jsx` and find the `DEFAULT_STOPS` object near the top.

### Changing the Password
Search for `bushey2025` in `src/App.jsx` and replace it.

### Changing the Unlock Radius
Default is 30 metres. Change `UNLOCK_RADIUS` constant or adjust in Admin panel.

---

## Local Development

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- Web Geolocation API
- Web Audio API (for sounds)
- LocalStorage (for config persistence)

---

Enjoy the hunt! 🎉
