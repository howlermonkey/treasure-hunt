import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom markers
const createIcon = (emoji, size = 30) => L.divIcon({
  html: `<div style="font-size: ${size}px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
  className: 'custom-marker',
  iconSize: [size, size],
  iconAnchor: [size/2, size/2],
});

const targetIcon = createIcon('📍', 32);
const sparkleIcon = createIcon('🦄', 28);
const thunderIcon = createIcon('⚡', 28);
const finishIcon = createIcon('🏆', 36);
const completedIcon = createIcon('✅', 24);
const nextIcon = createIcon('🎯', 32);

// Default coordinates around Clapperstile Gate / Cricket & Rugby clubs area
const DEFAULT_STOPS = {
  sparkle: [
    { id: 'S0', name: 'START: Clapperstile Gate', lat: 51.4245, lng: -0.3442, clue: 'Little unicorns, brave and true,\nA magical quest awaits for you!\nFind the BIG tree with bark so old,\nWhere the first secret waits to be told.', hint: 'Look for the biggest tree you can see!' },
    { id: 'S1', name: 'Large Oak Tree', lat: 51.4238, lng: -0.3448, clue: 'Well done! You found the oak so tall!\nBut unicorns must answer the call!\nWhere do tired walkers sit and rest?\nFind the BENCH and continue your quest!', hint: 'Look for somewhere to sit down!' },
    { id: 'S2', name: 'Bench by Path', lat: 51.4232, lng: -0.3455, clue: 'Hooray! Now look across the green,\nThe prettiest meadow you\'ve ever seen!\nWalk to the middle, twirl around,\nThen look DOWN on the ground!', hint: 'Walk to the open grass and twirl!' },
    { id: 'S3', name: 'Open Meadow (Adult Rest)', lat: 51.4225, lng: -0.3462, clue: 'Magic unicorns, you\'re doing great!\nNow trot along - don\'t be late!\nOther heroes might be near...\nFind where PATHS MEET - the clue is here!', hint: 'Walk to where paths cross!' },
    { id: 'S4', name: 'Crossing Point ⭐', lat: 51.4228, lng: -0.3470, clue: 'Did you see the superhero team?\nYou\'re all working for the same dream!\nNow find the FENCE near where balls fly,\nYour next clue waits - give it a try!', hint: 'Look for a fence near sports area!' },
    { id: 'S5', name: 'Cricket Club Fence', lat: 51.4235, lng: -0.3478, clue: 'Wonderful work, you clever pair!\nNow look for TWO TREES standing there,\nSide by side like unicorn friends,\nYour adventure nearly ends!', hint: 'Find two trees close together!' },
    { id: 'S6', name: 'Twin Trees (Adult Rest)', lat: 51.4240, lng: -0.3485, clue: 'You\'re amazing unicorn explorers!\nNow head towards where RUGBY players\nRun and jump and have their fun,\nYour quest is almost done!', hint: 'Look for the rugby area!' },
    { id: 'S7', name: 'Near Rugby Club', lat: 51.4248, lng: -0.3478, clue: 'One more clue! You\'re nearly there!\nThe VICTORY TREE is waiting where\nBoth teams will meet to save the day!\nFind the BIGGEST tree this way!', hint: 'Look for the biggest, best tree!' },
    { id: 'S8', name: 'FINISH: Victory Tree 🏆', lat: 51.4252, lng: -0.3465, clue: '🎉 YOU FOUND THE ENCHANTED CRYSTAL! 🎉\n\nWait for Team Thunder to arrive...\nTogether you will save Bushy Park!', hint: 'You did it!' },
  ],
  thunder: [
    { id: 'T0', name: 'START: Clapperstile Gate', lat: 51.4245, lng: -0.3442, clue: 'ATTENTION HEROES!\nMission: Recover the Power Crystal\nYour first checkpoint: The CRICKET BUILDING\nLook for a structure near the sports fields.\nMOVE OUT!', hint: 'Find the cricket pavilion!' },
    { id: 'T1', name: 'Cricket Pavilion', lat: 51.4250, lng: -0.3450, clue: 'CHECKPOINT REACHED!\nNew coordinates received:\nProceed to the RUGBY POSTS\nLook for the tall white goal posts.\nSTAY ALERT!', hint: 'Find the rugby goal posts!' },
    { id: 'T2', name: 'Rugby Posts', lat: 51.4258, lng: -0.3458, clue: 'EXCELLENT WORK, HEROES!\nStealth mission required:\nAdvance to the OPEN FIELD\nRetrieve intel from the marker.\nGO GO GO!', hint: 'Head to the open field!' },
    { id: 'T3', name: 'Open Field (Adult Rest)', lat: 51.4262, lng: -0.3468, clue: 'INTEL RETRIEVED!\nWarning: Unicorn team nearby\nProceed to PATH JUNCTION\nwhere routes cross.\nBE BRAVE!', hint: 'Find where paths meet!' },
    { id: 'T4', name: 'Crossing Point ⭐', lat: 51.4228, lng: -0.3470, clue: 'OTHER AGENTS SPOTTED!\nContinue mission to TREE CLUSTER\nMultiple trees grouped together\nto the WEST.\nKEEP MOVING!', hint: 'Find a group of trees!' },
    { id: 'T5', name: 'Tree Cluster', lat: 51.4222, lng: -0.3480, clue: 'ALMOST THERE, HEROES!\nFinal stealth zone ahead:\nLocate the BENCH AREA\nYour target awaits.\nSTAY LOW!', hint: 'Find a bench!' },
    { id: 'T6', name: 'Bench Area (Adult Rest)', lat: 51.4218, lng: -0.3472, clue: 'PERFECT EXECUTION!\nProceed to PATH JUNCTION\nwhere two paths meet.\nSTRIKE A POSE!\nPHOTO OP!', hint: 'Find another path junction!' },
    { id: 'T7', name: 'Path Junction', lat: 51.4225, lng: -0.3460, clue: 'FINAL MISSION BRIEFING!\nThe VICTORY TREE awaits!\nLook for the BIGGEST TREE nearby.\nThe Power Crystal is CLOSE!\nCOMPLETE THE MISSION!', hint: 'Find the biggest tree!' },
    { id: 'T8', name: 'FINISH: Victory Tree 🏆', lat: 51.4252, lng: -0.3465, clue: '🎉 YOU FOUND THE POWER CRYSTAL! 🎉\n\nWait for Team Sparkle to arrive...\nTogether you will save Bushy Park!', hint: 'You did it!' },
  ]
};

const UNLOCK_RADIUS = 30;

// Sound effects
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'sparkle') {
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'thunder') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'victory') {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
        o.start(ctx.currentTime + i * 0.15);
        o.stop(ctx.currentTime + i * 0.15 + 0.3);
      });
    }
  } catch (e) {
    console.log('Audio not available');
  }
};

// Haversine distance
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Bearing calculation
const getBearing = (lat1, lon1, lat2, lon2) => {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180 / Math.PI) + 360) % 360;
};

// Compass direction
const getDirection = (bearing) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
};

// Map auto-fit
const MapController = ({ position, target, secondaryTarget }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (position) points.push([position.lat, position.lng]);
    if (target) points.push([target.lat, target.lng]);
    if (secondaryTarget) points.push([secondaryTarget.lat, secondaryTarget.lng]);

    if (points.length >= 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
    } else if (target) {
      map.setView([target.lat, target.lng], 16);
    }
  }, [position, target, secondaryTarget, map]);

  return null;
};

// Mini Map Component - shows current stop and optionally next stop
const MiniMap = ({ position, currentStop, nextStop, team, unlockRadius, isCurrentUnlocked }) => {
  const isSparkle = team === 'sparkle';
  const playerIcon = isSparkle ? sparkleIcon : thunderIcon;
  const lineColor = isSparkle ? '#ec4899' : '#3b82f6';

  // Determine what to show
  const hasNextStop = nextStop && isCurrentUnlocked;
  const primaryTarget = hasNextStop ? nextStop : currentStop;
  const isFinish = primaryTarget.name.includes('FINISH');

  // Calculate map center - if we have both stops, center between them
  const mapCenter = hasNextStop
    ? [(currentStop.lat + nextStop.lat) / 2, (currentStop.lng + nextStop.lng) / 2]
    : [currentStop.lat, currentStop.lng];

  return (
    <div className="rounded-xl overflow-hidden border-2 border-white border-opacity-30 shadow-lg" style={{ height: '200px' }}>
      <MapContainer
        center={mapCenter}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
        dragging={true}
        touchZoom={true}
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController position={position} target={primaryTarget} secondaryTarget={hasNextStop ? currentStop : null} />

        {/* Current stop - show as completed (green) if unlocked, or as target if not */}
        <Marker
          position={[currentStop.lat, currentStop.lng]}
          icon={isCurrentUnlocked ? completedIcon : (currentStop.name.includes('FINISH') ? finishIcon : targetIcon)}
        />
        <Circle
          center={[currentStop.lat, currentStop.lng]}
          radius={unlockRadius}
          pathOptions={{
            color: isCurrentUnlocked ? '#22c55e' : lineColor,
            fillColor: isCurrentUnlocked ? '#22c55e' : lineColor,
            fillOpacity: 0.15,
            weight: 2,
            dashArray: isCurrentUnlocked ? null : '5, 5'
          }}
        />

        {/* Next stop - show if current is unlocked */}
        {hasNextStop && (
          <>
            <Marker
              position={[nextStop.lat, nextStop.lng]}
              icon={isFinish ? finishIcon : nextIcon}
            />
            <Circle
              center={[nextStop.lat, nextStop.lng]}
              radius={unlockRadius}
              pathOptions={{
                color: lineColor,
                fillColor: lineColor,
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
            {/* Line from current to next stop */}
            <Polyline
              positions={[[currentStop.lat, currentStop.lng], [nextStop.lat, nextStop.lng]]}
              pathOptions={{ color: '#22c55e', weight: 3, opacity: 0.6 }}
            />
          </>
        )}

        {/* Player position */}
        {position && (
          <>
            <Marker position={[position.lat, position.lng]} icon={playerIcon} />
            {/* Line from player to target (next stop if unlocked, current if locked) */}
            <Polyline
              positions={[[position.lat, position.lng], [primaryTarget.lat, primaryTarget.lng]]}
              pathOptions={{ color: lineColor, weight: 3, opacity: 0.7, dashArray: '10, 10' }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

// Direction Indicator
const DirectionIndicator = ({ position, target, distance, team }) => {
  if (!position || !target) return null;

  const bearing = getBearing(position.lat, position.lng, target.lat, target.lng);
  const direction = getDirection(bearing);
  const isSparkle = team === 'sparkle';

  const bgClass = isSparkle
    ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500'
    : 'bg-gradient-to-r from-blue-500 to-indigo-600';

  return (
    <div className={`flex items-center justify-center gap-4 py-4 px-6 ${bgClass} rounded-2xl mt-3 shadow-lg`}>
      <div
        className="text-4xl transition-transform duration-300 bg-white bg-opacity-20 rounded-full p-2"
        style={{ transform: `rotate(${bearing}deg)` }}
      >
        ⬆️
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white drop-shadow">{Math.round(distance)}m</div>
        <div className="text-sm text-white text-opacity-90 font-medium">Head {direction} {isSparkle ? '✨' : '💨'}</div>
      </div>
      <div className="text-3xl">{isSparkle ? '🦄' : '🦸'}</div>
    </div>
  );
};

// Map Picker Component for Admin
const MapPicker = ({ lat, lng, onLocationSelect, onClose }) => {
  const [markerPos, setMarkerPos] = useState([lat, lng]);

  const MapClickHandler = () => {
    const map = useMap();

    useEffect(() => {
      const handleClick = (e) => {
        setMarkerPos([e.latlng.lat, e.latlng.lng]);
      };
      map.on('click', handleClick);
      return () => map.off('click', handleClick);
    }, [map]);

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex flex-col">
      <div className="bg-white p-3 flex justify-between items-center">
        <span className="font-bold">Tap map to set location</span>
        <div className="flex gap-2">
          <button
            onClick={() => onLocationSelect(markerPos[0], markerPos[1])}
            className="bg-green-500 text-white px-4 py-2 rounded font-bold"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded font-bold"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="flex-1">
        <MapContainer
          center={[lat, lng]}
          zoom={17}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickHandler />
          <Marker position={markerPos} icon={targetIcon} />
          <Circle
            center={markerPos}
            radius={30}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2 }}
          />
        </MapContainer>
      </div>
      <div className="bg-white p-2 text-center text-sm">
        Lat: {markerPos[0].toFixed(6)}, Lng: {markerPos[1].toFixed(6)}
      </div>
    </div>
  );
};

// Admin Panel
const AdminPanel = ({ stops, setStops, unlockRadius, setUnlockRadius, onClose, onSaveToCloud, onReloadFromCloud }) => {
  const [activeTeam, setActiveTeam] = useState('sparkle');
  const [editingStop, setEditingStop] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(null);

  const handleAuth = () => {
    if (adminPassword === 'bushey2025') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const updateStop = (team, index, field, value) => {
    const newStops = { ...stops };
    newStops[team] = [...newStops[team]];
    newStops[team][index] = { ...newStops[team][index], [field]: field === 'lat' || field === 'lng' ? parseFloat(value) : value };
    setStops(newStops);
  };

  const addStop = (team) => {
    const newStops = { ...stops };
    const teamStops = [...newStops[team]];
    const prefix = team === 'sparkle' ? 'S' : 'T';
    const newIndex = teamStops.length;
    const lastStop = teamStops[teamStops.length - 1];

    const newStop = {
      id: `${prefix}${newIndex}`,
      name: `New Stop ${newIndex}`,
      lat: lastStop ? lastStop.lat + 0.0005 : 51.4245,
      lng: lastStop ? lastStop.lng + 0.0005 : -0.3442,
      clue: 'Enter your clue here...',
      hint: 'Enter a hint here...'
    };

    teamStops.push(newStop);
    newStops[team] = teamStops;
    setStops(newStops);
    setEditingStop(newIndex);
  };

  const deleteStop = (team, index) => {
    if (stops[team].length <= 2) {
      alert('You must have at least 2 stops per team.');
      return;
    }

    if (!confirm(`Delete "${stops[team][index].name}"? This cannot be undone.`)) {
      return;
    }

    const newStops = { ...stops };
    const teamStops = [...newStops[team]];
    teamStops.splice(index, 1);

    // Re-index the IDs
    const prefix = team === 'sparkle' ? 'S' : 'T';
    teamStops.forEach((stop, i) => {
      stop.id = `${prefix}${i}`;
    });

    newStops[team] = teamStops;
    setStops(newStops);
    setEditingStop(null);
  };

  const saveToCloud = async () => {
    setSaving(true);
    try {
      await onSaveToCloud();
      alert('Configuration saved to cloud!');
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
    setSaving(false);
  };

  const reloadFromCloud = async () => {
    setReloading(true);
    try {
      await onReloadFromCloud();
      alert('Reloaded from cloud!');
    } catch (err) {
      alert('Failed to reload: ' + err.message);
    }
    setReloading(false);
  };

  const exportConfig = () => {
    const config = { stops, unlockRadius };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'treasure-hunt-config.json';
    a.click();
  };

  const importConfig = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result);
          if (config.stops) setStops(config.stops);
          if (config.unlockRadius) setUnlockRadius(config.unlockRadius);
          alert('Configuration imported!');
        } catch (err) {
          alert('Invalid config file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          />
          <div className="flex gap-2">
            <button onClick={handleAuth} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold">Enter</button>
            <button onClick={onClose} className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold">Cancel</button>
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center">Default: bushey2025</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">⚙️ Admin Panel</h2>
          <button onClick={onClose} className="text-white text-3xl">×</button>
        </div>
        
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTeam('sparkle')} className={`flex-1 py-2 rounded-lg font-bold ${activeTeam === 'sparkle' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>🦄 Sparkle</button>
            <button onClick={() => setActiveTeam('thunder')} className={`flex-1 py-2 rounded-lg font-bold ${activeTeam === 'thunder' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>⚡ Thunder</button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Unlock Radius (meters)</label>
            <input
              type="number"
              value={unlockRadius}
              onChange={(e) => setUnlockRadius(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="space-y-2 max-h-80 overflow-auto">
            {stops[activeTeam].map((stop, index) => (
              <div key={stop.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm">{stop.id}: {stop.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingStop(editingStop === index ? null : index)}
                      className="text-blue-600 text-sm"
                    >
                      {editingStop === index ? 'Close' : 'Edit'}
                    </button>
                  </div>
                </div>
                {editingStop === index && (
                  <div className="space-y-2 mt-2 pt-2 border-t">
                    <input
                      type="text"
                      value={stop.name}
                      onChange={(e) => updateStop(activeTeam, index, 'name', e.target.value)}
                      placeholder="Name"
                      className="w-full p-2 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.0001"
                        value={stop.lat}
                        onChange={(e) => updateStop(activeTeam, index, 'lat', e.target.value)}
                        placeholder="Latitude"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.0001"
                        value={stop.lng}
                        onChange={(e) => updateStop(activeTeam, index, 'lng', e.target.value)}
                        placeholder="Longitude"
                        className="flex-1 p-2 border rounded text-sm"
                      />
                    </div>
                    <textarea
                      value={stop.clue}
                      onChange={(e) => updateStop(activeTeam, index, 'clue', e.target.value)}
                      placeholder="Clue text"
                      rows={3}
                      className="w-full p-2 border rounded text-sm"
                    />
                    <input
                      type="text"
                      value={stop.hint}
                      onChange={(e) => updateStop(activeTeam, index, 'hint', e.target.value)}
                      placeholder="Hint"
                      className="w-full p-2 border rounded text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.geolocation.getCurrentPosition((pos) => {
                            updateStop(activeTeam, index, 'lat', pos.coords.latitude);
                            updateStop(activeTeam, index, 'lng', pos.coords.longitude);
                            alert('Location set to current position!');
                          }, (err) => alert('GPS error: ' + err.message));
                        }}
                        className="flex-1 bg-green-500 text-white py-2 rounded text-sm"
                      >
                        📍 Use GPS
                      </button>
                      <button
                        onClick={() => setShowMapPicker(index)}
                        className="flex-1 bg-purple-500 text-white py-2 rounded text-sm"
                      >
                        🗺️ Pick on Map
                      </button>
                    </div>
                    <button
                      onClick={() => deleteStop(activeTeam, index)}
                      className="w-full bg-red-100 text-red-600 py-2 rounded text-sm hover:bg-red-200 mt-2"
                    >
                      🗑️ Delete This Stop
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={() => addStop(activeTeam)}
              className={`w-full py-3 rounded-lg font-bold text-white mt-3 ${
                activeTeam === 'sparkle' ? 'bg-pink-500 hover:bg-pink-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              ➕ Add New Stop to {activeTeam === 'sparkle' ? 'Team Sparkle' : 'Team Thunder'}
            </button>
          </div>
        </div>
        
        {/* Debug: Show current first stop coords */}
        <div className="bg-gray-100 p-3 rounded-lg mb-3 text-xs">
          <p className="font-bold">Current loaded values:</p>
          <p>Sparkle S0: {stops?.sparkle?.[0]?.lat?.toFixed(6)}, {stops?.sparkle?.[0]?.lng?.toFixed(6)}</p>
          <p>Thunder T0: {stops?.thunder?.[0]?.lat?.toFixed(6)}, {stops?.thunder?.[0]?.lng?.toFixed(6)}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={saveToCloud}
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {saving ? '☁️ Saving...' : '☁️ Save to Cloud'}
          </button>
          <button
            onClick={reloadFromCloud}
            disabled={reloading}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {reloading ? '🔄 Loading...' : '🔄 Reload from Cloud'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportConfig} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold">💾 Export</button>
          <label className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-bold text-center cursor-pointer">
            📂 Import
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          <button onClick={() => { if(confirm('Reset all?')) setStops(DEFAULT_STOPS); }} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold">🔄 Reset</button>
        </div>
      </div>

      {showMapPicker !== null && (
        <MapPicker
          lat={stops[activeTeam][showMapPicker].lat}
          lng={stops[activeTeam][showMapPicker].lng}
          onLocationSelect={(lat, lng) => {
            updateStop(activeTeam, showMapPicker, 'lat', lat);
            updateStop(activeTeam, showMapPicker, 'lng', lng);
            setShowMapPicker(null);
          }}
          onClose={() => setShowMapPicker(null)}
        />
      )}
    </div>
  );
};

// Snowflake component
const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(30)].map((_, i) => (
      <div
        key={i}
        className="absolute text-white opacity-70 animate-snowfall"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${5 + Math.random() * 10}s`,
          fontSize: `${10 + Math.random() * 15}px`,
        }}
      >
        ❄
      </div>
    ))}
    <style>{`
      @keyframes snowfall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
        10% { opacity: 0.7; }
        90% { opacity: 0.7; }
        100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
      }
      .animate-snowfall {
        animation: snowfall linear infinite;
      }
    `}</style>
  </div>
);

// Team Selection
const TeamSelect = ({ onSelect, onAdmin, stops, dataSource }) => (
  <div
    className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
    style={{
      backgroundImage: 'url("/tresure-hunt-bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <Snowflakes />
    <div className="text-center mb-8 relative z-10">
      <div className="text-5xl mb-4">🎄</div>
      <h1 className="text-3xl font-bold text-red-600 mb-2">✨ Christmas ✨<br />Treasure Hunt</h1>
      <p className="text-green-700">🎅 Bushey Park Boxing Day Adventure 🦌</p>
      <p className="text-red-800 text-sm mt-2">⭐ Find the hidden Christmas treasures! ⭐</p>
    </div>
    
    <div className="flex flex-col gap-4 w-full max-w-sm relative z-10">
      <button
        onClick={() => onSelect('sparkle')}
        className="bg-gradient-to-r from-pink-400 to-fuchsia-600 text-white text-2xl py-8 px-6 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform border-4 border-pink-200"
      >
        🦄👸 Team Sparkle
        <p className="text-sm font-normal mt-1">✨ Unicorns & Princesses ✨</p>
      </button>

      <button
        onClick={() => onSelect('thunder')}
        className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white text-2xl py-8 px-6 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform border-4 border-blue-300"
      >
        ⚡💪 Team Thunder
        <p className="text-sm font-normal mt-1">🦸 The Superhero Squad 🦸</p>
      </button>
    </div>

    <button onClick={onAdmin} className="mt-8 text-yellow-400 text-sm underline relative z-10">
      🔧 Admin Setup
    </button>

    {/* Debug Panel - shows loaded coordinates */}
    <div className="mt-4 bg-black bg-opacity-70 text-white text-xs p-3 rounded-lg max-w-sm w-full relative z-10">
      <p className="font-bold mb-1">📍 Debug: Loaded from {dataSource || 'unknown'}</p>
      <p>Sparkle S0: {stops?.sparkle?.[0]?.lat?.toFixed(6)}, {stops?.sparkle?.[0]?.lng?.toFixed(6)}</p>
      <p>Thunder T0: {stops?.thunder?.[0]?.lat?.toFixed(6)}, {stops?.thunder?.[0]?.lng?.toFixed(6)}</p>
      <p className="mt-1 text-yellow-300">Sparkle stops: {stops?.sparkle?.length} | Thunder stops: {stops?.thunder?.length}</p>
    </div>

    <p className="text-red-600 text-opacity-60 text-xs mt-4 relative z-10">🎄 Merry Christmas! 🎄</p>
  </div>
);

// Progress Bar
const ProgressBar = ({ current, total, team }) => {
  const percentage = (current / total) * 100;
  const bgColor = team === 'sparkle' ? 'bg-pink-500' : 'bg-blue-500';
  
  return (
    <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
      <div className={`${bgColor} h-3 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
    </div>
  );
};

// Clue Card
const ClueCard = ({ stop, team, distance, isUnlocked, onUnlock, position, unlockRadius, nextStop }) => {
  const [showHint, setShowHint] = useState(false);
  const [showMap, setShowMap] = useState(true);
  const isInRange = distance !== null && distance <= unlockRadius;
  const isSparkle = team === 'sparkle';

  const theme = isSparkle
    ? {
        bg: 'from-pink-50 via-fuchsia-50 to-pink-100',
        border: 'border-pink-300',
        accent: 'bg-pink-500',
        accentLight: 'bg-pink-100',
        accentText: 'text-pink-600',
        headerBg: 'bg-gradient-to-r from-pink-400 to-fuchsia-500',
        icon: '🦄',
        lockedIcon: '✨',
        unlockedIcon: '👸',
        hintBg: 'bg-pink-50 border-pink-200',
        mapBtnBg: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
        nextBadge: 'bg-fuchsia-200 text-fuchsia-700',
      }
    : {
        bg: 'from-blue-50 via-indigo-50 to-blue-100',
        border: 'border-blue-300',
        accent: 'bg-blue-500',
        accentLight: 'bg-blue-100',
        accentText: 'text-blue-600',
        headerBg: 'bg-gradient-to-r from-blue-500 to-indigo-600',
        icon: '⚡',
        lockedIcon: '🔐',
        unlockedIcon: '💪',
        hintBg: 'bg-blue-50 border-blue-200',
        mapBtnBg: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
        nextBadge: 'bg-indigo-200 text-indigo-700',
      };

  useEffect(() => {
    if (isInRange && !isUnlocked) {
      onUnlock();
    }
  }, [isInRange, isUnlocked, onUnlock]);

  const mapTarget = isUnlocked && nextStop ? nextStop : stop;
  const mapDistance = isUnlocked && nextStop && position
    ? getDistance(position.lat, position.lng, nextStop.lat, nextStop.lng)
    : distance;

  const showMapSection = isUnlocked ? nextStop : true;
  const isLastStop = !nextStop && isUnlocked;

  return (
    <div className={`bg-gradient-to-br ${theme.bg} rounded-3xl shadow-xl border-2 ${theme.border} mb-4 overflow-hidden`}>
      {/* Header */}
      <div className={`${theme.headerBg} px-4 py-3 flex justify-between items-center`}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isUnlocked ? theme.unlockedIcon : theme.icon}</span>
          <h3 className="font-bold text-white text-lg drop-shadow">{stop.name}</h3>
        </div>
        {isUnlocked && <span className="text-2xl">✅</span>}
      </div>

      <div className="p-4">
        {isUnlocked ? (
          /* Unlocked Clue Content */
          <div className="relative">
            <div className={`absolute -left-1 top-0 bottom-0 w-1 ${theme.accent} rounded-full`}></div>
            <div className="pl-4 whitespace-pre-line text-gray-700 text-lg leading-relaxed font-medium">
              {stop.clue}
            </div>
          </div>
        ) : (
          /* Locked State */
          <div className="text-center py-6">
            <div className="text-6xl mb-4 animate-pulse">{theme.lockedIcon}</div>
            {distance !== null ? (
              <div className={`inline-block px-6 py-3 rounded-2xl ${theme.accentLight}`}>
                {isInRange ? (
                  <p className={`text-xl font-bold ${theme.accentText}`}>
                    ✨ You're here! ✨
                  </p>
                ) : (
                  <>
                    <p className={`text-2xl font-bold ${theme.accentText}`}>
                      {Math.round(distance)}m away
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Get within {unlockRadius}m to unlock</p>
                  </>
                )}
              </div>
            ) : (
              <div className={`inline-block px-6 py-3 rounded-2xl ${theme.accentLight}`}>
                <p className="text-gray-600 flex items-center gap-2">
                  <span className="animate-spin">📡</span> Waiting for GPS...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Map Section */}
        {showMapSection && (
          <div className="mt-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`w-full text-sm px-4 py-2 rounded-xl mb-3 flex items-center justify-center gap-2 transition-colors ${theme.mapBtnBg}`}
            >
              🗺️ {showMap ? 'Hide Map' : 'Show Map'}
              {isUnlocked && nextStop && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme.nextBadge}`}>
                  Next: {nextStop.name}
                </span>
              )}
            </button>

            {showMap && (
              <>
                {/* Debug: Show what coords map is using */}
                <div className="bg-black bg-opacity-70 text-white text-xs p-2 rounded mb-2">
                  <p><strong>Current:</strong> {stop.name} ({stop.id})</p>
                  <p>Coords: {stop.lat?.toFixed(6)}, {stop.lng?.toFixed(6)}</p>
                  {nextStop && (
                    <>
                      <p className="mt-1"><strong>Next:</strong> {nextStop.name} ({nextStop.id})</p>
                      <p>Coords: {nextStop.lat?.toFixed(6)}, {nextStop.lng?.toFixed(6)}</p>
                    </>
                  )}
                  <p className="mt-1 text-yellow-300">Unlocked: {isUnlocked ? 'yes' : 'no'}</p>
                </div>
                <MiniMap
                  key={`${stop.id}-${stop.lat}-${stop.lng}-${nextStop?.id || 'none'}`}
                  position={position}
                  currentStop={stop}
                  nextStop={nextStop}
                  team={team}
                  unlockRadius={unlockRadius}
                  isCurrentUnlocked={isUnlocked}
                />
                {position && mapDistance !== null && (
                  <DirectionIndicator position={position} target={mapTarget} distance={mapDistance} team={team} />
                )}
              </>
            )}
          </div>
        )}

        {/* Final Location Message */}
        {isLastStop && (
          <div className={`mt-4 p-4 rounded-2xl text-center ${isSparkle ? 'bg-gradient-to-r from-pink-200 to-fuchsia-200' : 'bg-gradient-to-r from-blue-200 to-indigo-200'}`}>
            <p className="text-xl font-bold text-gray-800">🎉 You've reached the final location! 🎉</p>
            <p className="text-sm text-gray-600 mt-1">Wait for the other team!</p>
          </div>
        )}

        {/* Hint Section */}
        {!isUnlocked && (
          <div className="mt-4">
            <button
              onClick={() => setShowHint(!showHint)}
              className={`w-full text-sm px-4 py-2 rounded-xl transition-colors ${theme.mapBtnBg}`}
            >
              {showHint ? '🙈 Hide hint' : '💡 Need a hint?'}
            </button>

            {showHint && (
              <div className={`mt-3 p-3 rounded-xl border ${theme.hintBg}`}>
                <p className="text-gray-700 italic flex items-start gap-2">
                  <span>💡</span>
                  <span>{stop.hint}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Game Screen
const GameScreen = ({ team, stops, unlockRadius, onBack }) => {
  const [currentStop, setCurrentStop] = useState(0);
  const [unlockedStops, setUnlockedStops] = useState([true]);
  const [position, setPosition] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const [distances, setDistances] = useState([]);
  
  const teamStops = stops[team];
  const isSparkle = team === 'sparkle';
  
  const bgGradient = isSparkle
    ? 'from-pink-500 via-fuchsia-600 to-pink-600'
    : 'from-blue-600 via-indigo-700 to-blue-800';
  
  useEffect(() => {
    let watchId;
    
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsError(null);
        const newDistances = teamStops.map(stop => 
          getDistance(pos.coords.latitude, pos.coords.longitude, stop.lat, stop.lng)
        );
        setDistances(newDistances);
      },
      (err) => setGpsError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [teamStops]);
  
  const handleUnlock = useCallback((index) => {
    if (!unlockedStops[index]) {
      const newUnlocked = [...unlockedStops];
      newUnlocked[index] = true;
      setUnlockedStops(newUnlocked);
      
      if (index === teamStops.length - 1) {
        playSound('victory');
      } else {
        playSound(team);
      }
      
      if (index === currentStop && index < teamStops.length - 1) {
        setTimeout(() => setCurrentStop(index + 1), 1500);
      }
    }
  }, [unlockedStops, currentStop, teamStops.length, team]);
  
  const unlockedCount = unlockedStops.filter(Boolean).length;
  const isComplete = unlockedCount === teamStops.length;
  const nextStop = currentStop < teamStops.length - 1 ? teamStops[currentStop + 1] : null;
  
  return (
    <div className={`min-h-screen bg-gradient-to-b ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 bg-black bg-opacity-30 backdrop-blur-sm p-3 z-10">
        <div className="flex justify-between items-center mb-2">
          <button onClick={onBack} className="text-white text-2xl px-2">←</button>
          <h1 className="text-white font-bold text-lg">
            {isSparkle ? '🦄👸 Team Sparkle' : '⚡ Team Thunder'}
          </h1>
          <span className="text-white font-bold px-2">{unlockedCount}/{teamStops.length}</span>
        </div>
        <ProgressBar current={unlockedCount} total={teamStops.length} team={team} />
      </div>
      
      {gpsError && (
        <div className="mx-4 mt-2 bg-red-500 text-white p-3 rounded-lg text-sm">
          GPS Error: {gpsError}
        </div>
      )}
      
      {isComplete && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-red-600 to-green-600 rounded-2xl p-6 text-center shadow-xl border-4 border-yellow-400">
          <div className="text-5xl mb-3">🎄🏆🎄</div>
          <h2 className="text-2xl font-bold text-white mb-2">CHRISTMAS MISSION COMPLETE!</h2>
          <p className="text-white">
            {isSparkle ? '🎁 You found the Enchanted Christmas Crystal! 🎁' : '🎁 You recovered the Christmas Power Crystal! 🎁'}
          </p>
          <p className="text-yellow-100 mt-2 text-sm">🎅 Now find the Victory Tree and wait for the other team! 🦌</p>
        </div>
      )}
      
      {/* Stop Navigation */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {teamStops.map((stop, index) => (
          <button
            key={stop.id}
            onClick={() => setCurrentStop(index)}
            className={`flex-shrink-0 w-10 h-10 rounded-full font-bold transition-all ${
              currentStop === index
                ? (isSparkle ? 'bg-pink-300 text-pink-800' : 'bg-blue-300 text-blue-800')
                : unlockedStops[index]
                  ? 'bg-white bg-opacity-30 text-white'
                  : 'bg-black bg-opacity-20 text-gray-300'
            }`}
          >
            {unlockedStops[index] ? '✓' : index}
          </button>
        ))}
      </div>
      
      {/* Current Clue */}
      <div className="px-4 pb-24">
        <ClueCard
          stop={teamStops[currentStop]}
          team={team}
          distance={distances[currentStop] ?? null}
          isUnlocked={unlockedStops[currentStop]}
          onUnlock={() => handleUnlock(currentStop)}
          position={position}
          unlockRadius={unlockRadius}
          nextStop={unlockedStops[currentStop] ? nextStop : null}
        />
        
        {!unlockedStops[currentStop] && (
          <button
            onClick={() => handleUnlock(currentStop)}
            className={`w-full py-3 rounded-xl text-sm font-medium shadow-lg ${
              isSparkle
                ? 'bg-fuchsia-800 text-pink-100'
                : 'bg-indigo-800 text-blue-100'
            }`}
          >
            🔓 Adult Override (Unlock This Clue)
          </button>
        )}
      </div>
      
      {/* Navigation Footer */}
      <div className={`fixed bottom-0 left-0 right-0 p-4 flex gap-4 ${isSparkle ? 'bg-fuchsia-900' : 'bg-indigo-900'}`}>
        <button
          onClick={() => setCurrentStop(Math.max(0, currentStop - 1))}
          disabled={currentStop === 0}
          className={`flex-1 py-3 rounded-xl font-bold text-lg shadow-lg disabled:opacity-30 ${
            isSparkle
              ? 'bg-pink-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          ← Prev
        </button>
        <button
          onClick={() => setCurrentStop(Math.min(teamStops.length - 1, currentStop + 1))}
          disabled={currentStop === teamStops.length - 1}
          className={`flex-1 py-3 rounded-xl font-bold text-lg shadow-lg disabled:opacity-30 ${
            isSparkle
              ? 'bg-pink-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

// Main App
export default function App() {
  const [screen, setScreen] = useState('select');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const [unlockRadius, setUnlockRadius] = useState(UNLOCK_RADIUS);
  const [dataSource, setDataSource] = useState('defaults');

  // Load config from Firestore on mount
  useEffect(() => {
    const loadConfig = async () => {
      console.log('[TreasureHunt] Starting config load...');
      try {
        const docRef = doc(db, 'config', 'treasureHunt');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('[TreasureHunt] ✅ Loaded from CLOUD:', {
            hasStops: !!data.stops,
            sparkleCount: data.stops?.sparkle?.length,
            thunderCount: data.stops?.thunder?.length,
            unlockRadius: data.unlockRadius,
            updatedAt: data.updatedAt,
            firstSparkleStop: data.stops?.sparkle?.[0]
          });
          if (data.stops) setStops(data.stops);
          if (data.unlockRadius) setUnlockRadius(data.unlockRadius);
          setDataSource('CLOUD ☁️');
        } else {
          console.log('[TreasureHunt] ⚠️ No cloud config found, trying localStorage...');
          // Fallback to localStorage if no cloud config
          const savedStops = localStorage.getItem('treasureHuntStops');
          const savedRadius = localStorage.getItem('treasureHuntRadius');
          if (savedStops) {
            const parsed = JSON.parse(savedStops);
            console.log('[TreasureHunt] 📦 Loaded from localStorage:', {
              sparkleCount: parsed?.sparkle?.length,
              thunderCount: parsed?.thunder?.length,
              firstSparkleStop: parsed?.sparkle?.[0]
            });
            setStops(parsed);
            setDataSource('localStorage 📦');
          } else {
            console.log('[TreasureHunt] 🔄 Using DEFAULT_STOPS');
            setDataSource('DEFAULTS ⚠️');
          }
          if (savedRadius) setUnlockRadius(parseInt(savedRadius));
        }
      } catch (err) {
        console.error('[TreasureHunt] ❌ Cloud load failed:', err);
        setDataSource('CLOUD FAILED ❌');
        // Fallback to localStorage
        try {
          const savedStops = localStorage.getItem('treasureHuntStops');
          const savedRadius = localStorage.getItem('treasureHuntRadius');
          if (savedStops) {
            const parsed = JSON.parse(savedStops);
            console.log('[TreasureHunt] 📦 Fallback to localStorage:', {
              sparkleCount: parsed?.sparkle?.length,
              thunderCount: parsed?.thunder?.length
            });
            setStops(parsed);
            setDataSource('localStorage (fallback) 📦');
          }
          if (savedRadius) setUnlockRadius(parseInt(savedRadius));
        } catch { /* ignore */ }
      }
      setLoading(false);
    };
    loadConfig();
  }, []);

  // Also save to localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('treasureHuntStops', JSON.stringify(stops));
    }
  }, [stops, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('treasureHuntRadius', unlockRadius.toString());
    }
  }, [unlockRadius, loading]);

  // Save to Firestore
  const saveToCloud = async () => {
    console.log('[TreasureHunt] 💾 Saving to cloud...', {
      sparkleCount: stops?.sparkle?.length,
      thunderCount: stops?.thunder?.length,
      unlockRadius,
      firstSparkleStop: stops?.sparkle?.[0]
    });
    const docRef = doc(db, 'config', 'treasureHunt');
    await setDoc(docRef, {
      stops,
      unlockRadius,
      updatedAt: new Date().toISOString()
    });
    console.log('[TreasureHunt] ✅ Cloud save complete');
  };

  // Reload from Firestore
  const reloadFromCloud = async () => {
    console.log('[TreasureHunt] 🔄 Reloading from cloud...');
    const docRef = doc(db, 'config', 'treasureHunt');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('[TreasureHunt] ✅ Reloaded from CLOUD:', {
        hasStops: !!data.stops,
        sparkleCount: data.stops?.sparkle?.length,
        thunderCount: data.stops?.thunder?.length,
        unlockRadius: data.unlockRadius,
        updatedAt: data.updatedAt,
        firstSparkleStop: data.stops?.sparkle?.[0]
      });
      if (data.stops) setStops(data.stops);
      if (data.unlockRadius) setUnlockRadius(data.unlockRadius);
      setDataSource('CLOUD ☁️ (reloaded)');
    } else {
      throw new Error('No cloud config found');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-green-900 to-red-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4">🎄</div>
          <p>Loading treasure hunt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      {screen === 'select' && (
        <TeamSelect
          onSelect={(team) => { setSelectedTeam(team); setScreen('game'); }}
          onAdmin={() => setShowAdmin(true)}
          stops={stops}
          dataSource={dataSource}
        />
      )}

      {screen === 'game' && selectedTeam && (
        <GameScreen team={selectedTeam} stops={stops} unlockRadius={unlockRadius} onBack={() => setScreen('select')} />
      )}

      {showAdmin && (
        <AdminPanel
          stops={stops}
          setStops={setStops}
          unlockRadius={unlockRadius}
          setUnlockRadius={setUnlockRadius}
          onClose={() => setShowAdmin(false)}
          onSaveToCloud={saveToCloud}
          onReloadFromCloud={reloadFromCloud}
        />
      )}
    </div>
  );
}
