import React from 'react';

// Pre-generated snowflake positions for deterministic rendering
const SNOWFLAKE_DATA = [
  { left: 3, delay: 0.2, duration: 7, size: 12 },
  { left: 8, delay: 2.1, duration: 9, size: 18 },
  { left: 15, delay: 4.5, duration: 12, size: 14 },
  { left: 22, delay: 1.3, duration: 8, size: 22 },
  { left: 28, delay: 3.7, duration: 11, size: 16 },
  { left: 35, delay: 0.8, duration: 6, size: 20 },
  { left: 42, delay: 2.9, duration: 14, size: 13 },
  { left: 48, delay: 4.1, duration: 10, size: 19 },
  { left: 55, delay: 1.6, duration: 7, size: 15 },
  { left: 62, delay: 3.2, duration: 13, size: 21 },
  { left: 68, delay: 0.5, duration: 8, size: 17 },
  { left: 75, delay: 2.4, duration: 11, size: 12 },
  { left: 82, delay: 4.8, duration: 9, size: 24 },
  { left: 88, delay: 1.1, duration: 15, size: 14 },
  { left: 95, delay: 3.5, duration: 6, size: 18 },
  { left: 5, delay: 2.7, duration: 12, size: 16 },
  { left: 12, delay: 0.9, duration: 8, size: 20 },
  { left: 19, delay: 4.3, duration: 10, size: 13 },
  { left: 26, delay: 1.8, duration: 14, size: 22 },
  { left: 33, delay: 3.1, duration: 7, size: 15 },
  { left: 40, delay: 0.4, duration: 11, size: 19 },
  { left: 47, delay: 2.6, duration: 9, size: 12 },
  { left: 54, delay: 4.0, duration: 13, size: 21 },
  { left: 61, delay: 1.4, duration: 6, size: 17 },
  { left: 69, delay: 3.8, duration: 15, size: 14 },
  { left: 76, delay: 0.7, duration: 8, size: 23 },
  { left: 83, delay: 2.2, duration: 12, size: 16 },
  { left: 90, delay: 4.6, duration: 10, size: 18 },
  { left: 97, delay: 1.0, duration: 7, size: 20 },
  { left: 50, delay: 3.4, duration: 11, size: 15 },
];

// Snowflake component
const Snowflakes = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {SNOWFLAKE_DATA.map((flake, i) => (
      <div
        key={i}
        className="absolute text-white opacity-70 animate-snowfall"
        style={{
          left: `${flake.left}%`,
          animationDelay: `${flake.delay}s`,
          animationDuration: `${flake.duration}s`,
          fontSize: `${flake.size}px`,
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

const TeaserPage = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: 'url("/tresure-hunt-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for text contrast */}
      {/* <div className="absolute inset-0 bg-gray-400 bg-opacity-40 z-0"></div> */}

      <Snowflakes />

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-lg mx-auto" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
        {/* Secret Badge */}
        <div className="mb-6">
          <span className="inline-block bg-yellow-500 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg">
            By Invitation Only
          </span>
        </div>

        {/* Main Title */}
        <div className="mb-8">
          <div className="text-6xl mb-4">🎄</div>
          <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-3 drop-shadow-lg">
            A Secret
            <span className="block text-yellow-300">Treasure Hunt</span>
          </h1>
          <p className="text-xl text-red-400 font-medium">is coming...</p>
        </div>

        {/* Details Card */}
        <div className="bg-opacity-10 bg-green-800 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white border-opacity-20 shadow-xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-3xl">🦌</span>
            <div className="text-center">
              <p className="text-red-500 font-bold text-lg">Boxing Day</p>
              <p className="text-red-400 text-sm">December 26th 2025</p>
            </div>
            <span className="text-3xl">🎅</span>
          </div>

          <div className="border-t border-white border-opacity-20 pt-4 mt-4">
            <p className="text-red-500 text-lg font-medium mb-1">Bushey Park</p>
            <p className="text-red-400 text-sm">A magical Christmas adventure awaits...</p>
          </div>
        </div>

        {/* Mystery Elements */}
        <div className="flex justify-center gap-6 mb-8 text-4xl">
          <span className="animate-bounce" style={{ animationDelay: '0s' }}>🦄</span>
          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🗺️</span>
          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>⚡</span>
          <span className="animate-bounce" style={{ animationDelay: '0.6s' }}>🏆</span>
        </div>

        {/* Teaser Text */}
        <div className="space-y-3 text-red-500">
          <p className="text-lg italic">
            "Two teams. Hidden clues. One epic quest."
          </p>
          <p className="text-sm text-red-400">
            Prepare for an unforgettable Christmas adventure...
          </p>
        </div>

        {/* Invitation Notice */}
        {/* <div className="mt-10 pt-6 border-t border-red border-opacity-20">
          <div className="flex items-center justify-center gap-2 text-black">
            <span>🔒</span>
            <p className="text-sm font-medium">
              Check your invitation for the secret link
            </p>
            <span>🔒</span>
          </div>
        </div> */}
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-red-600 text-opacity-50 text-xs">
          🎄 Merry Christmas 🎄
        </p>
      </div>
    </div>
  );
};

export default TeaserPage;
