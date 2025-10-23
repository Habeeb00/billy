import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PurchaseModal } from './components/PurchaseModal';
import { BillboardGrid } from './components/BillboardGrid';
import type { Ad, Theme } from './types';

const THEMES: Theme[] = ['day', 'night', 'rain', 'snowy'];

// --- Helper Functions ---
const isSelectionRectangular = (plots: string[]): boolean => {
    if (plots.length === 0) {
        return false;
    }

    const coords = plots.map(p => p.split('-').map(Number));
    const rows = coords.map(([r]) => r);
    const cols = coords.map(([, c]) => c);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    
    const width = maxC - minC + 1;
    const height = maxR - minR + 1;

    // If the number of selected plots doesn't match the area of the bounding box, it's not a solid rectangle.
    if (plots.length !== width * height) {
        return false; 
    }
    
    return true;
};

// --- Background Components ---
function Cloud({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute w-24 h-10 sm:w-36 sm:h-16 bg-white rounded-full opacity-90" style={style}>
      <div className="absolute -bottom-2 left-4 w-16 h-8 sm:w-24 sm:h-12 bg-white rounded-full"></div>
      <div className="absolute -bottom-1 right-4 w-12 h-6 sm:w-20 sm:h-10 bg-white rounded-full"></div>
    </div>
  );
}

function Star({ style }: { style: React.CSSProperties }) {
  return <div className="absolute bg-white w-1 h-1 rounded-full" style={{...style, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>;
}

function Sun() {
  return <div className="absolute top-12 left-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"></div>;
}

function Moon() {
  return <div className="absolute top-12 right-12 w-16 h-16 bg-gray-200 rounded-full shadow-lg border-4 border-gray-300"></div>;
}

function Raindrop({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute w-0.5 h-10 bg-blue-300 opacity-50" style={style}></div>
  );
}

function Bird({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute w-8 h-8" style={style}>
      <svg viewBox="0 0 10 7" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <path d="M0 2h1v1h1v1h1v-1h1v-1h2v1h1v1h2v-1h1v2h-1v-1h-1v-1h-1v1h-1v1h-2v-1h-1v-1h-2v1h-1z" fill="black" />
      </svg>
    </div>
  );
}

function Snowflake({ style }: { style: React.CSSProperties }) {
    return <div className="absolute text-white text-lg select-none" style={style}>❄</div>;
}

function ShootingStar({ style }: { style: React.CSSProperties }) {
  return (
    <div className="absolute" style={style}>
      <div className="absolute w-48 h-px bg-gradient-to-l from-white/50 to-transparent transform rotate-[225deg] origin-top-left"></div>
    </div>
  );
}


const BG_COLORS: Record<Theme, string> = {
  day: 'bg-sky-400',
  night: 'bg-slate-900',
  rain: 'bg-slate-800',
  snowy: 'bg-slate-500'
};

function DynamicBackgroundComponent({ theme, animationsEnabled }: { theme: Theme, animationsEnabled: boolean }) {
    const clouds = useMemo(() => Array.from({ length: 7 }).map((_, i) => ({
        top: `${Math.random() * 40}%`,
        animation: `${i % 2 === 0 ? 'drift' : 'drift-reverse'} ${Math.random() * 30 + 20}s linear infinite`,
        animationDelay: `-${Math.random() * 50}s`,
    })), []);

    const birds = useMemo(() => Array.from({ length: 3 }).map(() => ({
        top: `${Math.random() * 30 + 5}%`,
        animation: `fly ${Math.random() * 10 + 8}s linear infinite`,
        animationDelay: `-${Math.random() * 20}s`,
    })), []);

    const stars = useMemo(() => Array.from({ length: 80 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
    })), []);
    
    const shootingStars = useMemo(() => Array.from({ length: 2 }).map(() => ({
        top: `${Math.random() * 50 - 20}%`,
        left: `${Math.random() * 50 + 80}%`,
        animation: `shoot ${Math.random() * 3 + 2}s ease-in-out infinite`,
        animationDelay: `-${Math.random() * 10}s`,
    })), []);

    const raindrops = useMemo(() => Array.from({ length: 150 }).map(() => ({
        left: `${Math.random() * 100}vw`,
        top: '-50px',
        animation: `fall ${Math.random() * 0.5 + 0.3}s linear infinite`,
        animationDelay: `-${Math.random() * 2}s`
    })), []);

    const snowflakes = useMemo(() => Array.from({ length: 70 }).map(() => ({
        left: `${Math.random() * 100}vw`,
        top: '-10vh',
        animation: `fall-snow ${Math.random() * 10 + 5}s linear infinite`,
        animationDelay: `-${Math.random() * 15}s`,
        transform: `scale(${Math.random() * 0.4 + 0.3})`,
        opacity: Math.random() * 0.7 + 0.3,
    })), []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {theme === 'day' && (
                <>
                    <Sun />
                    {animationsEnabled && clouds.map((style, i) => <Cloud key={`c-${i}`} style={style} />)}
                    {animationsEnabled && birds.map((style, i) => <Bird key={`b-${i}`} style={style} />)}
                </>
            )}
            {theme === 'night' && (
                <>
                    <Moon />
                    {animationsEnabled && stars.map((style, i) => <Star key={`s-${i}`} style={style} />)}
                    {animationsEnabled && shootingStars.map((style, i) => <ShootingStar key={`ss-${i}`} style={style} />)}
                </>
            )}
            {theme === 'rain' && (
                <>
                    {animationsEnabled && raindrops.map((style, i) => <Raindrop key={`r-${i}`} style={style} />)}
                </>
            )}
            {theme === 'snowy' && (
                 <>
                    {animationsEnabled && snowflakes.map((style, i) => <Snowflake key={`sf-${i}`} style={style} />)}
                </>
            )}
        </div>
    );
}
const DynamicBackground = React.memo(DynamicBackgroundComponent);


// --- Main App Component ---
function App() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('day');
  const [selectionAspectRatio, setSelectionAspectRatio] = useState(1);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const purchasedPlotIds = useMemo(() => {
    return new Set(ads.flatMap(ad => ad.plots));
  }, [ads]);

  const isSelectionValid = useMemo(() => {
      return isSelectionRectangular(selectedPlots);
  }, [selectedPlots]);

  const handleOpenModal = () => {
    if (selectedPlots.length === 0 || !isSelectionValid) return;
    
    const plots = selectedPlots.map(p => p.split('-').map(Number));
    const rows = plots.map(([r]) => r);
    const cols = plots.map(([, c]) => c);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    
    const width = maxC - minC + 1;
    const height = maxR - minR + 1;
    
    setSelectionAspectRatio(width / height);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlots([]);
  }, []);

  const handlePurchase = useCallback((imageUrl: string, message: string) => {
    if (selectedPlots.length > 0) {
      const newAd: Ad = {
        id: `ad-${Date.now()}`,
        plots: [...selectedPlots].sort((a, b) => {
          const [aRow, aCol] = a.split('-').map(Number);
          const [bRow, bCol] = b.split('-').map(Number);
          if (aRow !== bRow) return aRow - bRow;
          return aCol - bCol;
        }),
        imageUrl,
        message,
      };
      setAds(prevAds => [...prevAds, newAd]);
    }
    handleCloseModal();
  }, [selectedPlots, handleCloseModal]);
  
  const handleClearSelection = useCallback(() => {
    setSelectedPlots([]);
  }, []);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  }, [theme]);
  
  const toggleAnimations = useCallback(() => {
    setAnimationsEnabled(prev => !prev);
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden">
      {/* Background Layer: Explicitly behind and non-interactive. */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 ${BG_COLORS[theme]}`}>
        <DynamicBackground theme={theme} animationsEnabled={animationsEnabled} />
      </div>

      {/* UI Layer: Non-interactive by default, specific children are enabled. */}
      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 pointer-events-auto">
          <button
            onClick={cycleTheme}
            className="bg-yellow-400 text-black border-2 border-b-4 border-black px-4 py-2 text-sm hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
            aria-label={`Switch theme from ${theme}`}
          >
            THEME
          </button>
          <button
            onClick={toggleAnimations}
            className="bg-yellow-400 text-black border-2 border-b-4 border-black px-4 py-2 text-sm hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
            aria-label={`Toggle animations ${animationsEnabled ? 'off' : 'on'}`}
          >
            ANIMATE: {animationsEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="w-full h-full flex flex-col items-center justify-end">
          <div className="relative flex flex-col items-center">
            {/* Mario-style Frame - set to be interactive */}
            <div className="bg-[#4a4a4a] p-2 sm:p-3 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.7)] pointer-events-auto">
              <div className="border-4 border-t-gray-300 border-l-gray-300 border-b-gray-800 border-r-gray-800">
                <BillboardGrid
                  ads={ads}
                  selectedPlots={selectedPlots}
                  setSelectedPlots={setSelectedPlots}
                  purchasedPlotIds={purchasedPlotIds}
                />
              </div>
            </div>
            
            {selectedPlots.length > 0 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={handleOpenModal}
                    disabled={!isSelectionValid}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5 transition-all text-xs sm:text-base whitespace-nowrap disabled:bg-gray-500 disabled:cursor-not-allowed disabled:border-b-2"
                    aria-label={`Book ${selectedPlots.length} selected plots`}
                  >
                    Book Selection ({selectedPlots.length})
                    {!isSelectionValid && <span className="block text-xs lowercase mt-1">(not a rectangle)</span>}
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white border-2 border-b-4 border-black hover:bg-red-600 active:border-b-2 active:mt-0.5 transition-all text-xs sm:text-base"
                    aria-label="Clear current selection"
                  >
                    Clear
                  </button>
                </div>
              )}

            {/* Mario-style Stand */}
            <div className="w-32 sm:w-40 h-60 sm:h-48 bg-green-600 border-x-4 border-b-4 border-black shadow-[inset_0_5px_0px_rgba(255,255,255,0.3),_inset_0_-5px_0px_rgba(0,0,0,0.3)]"></div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <PurchaseModal
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
          aspectRatio={selectionAspectRatio}
        />
      )}
    </main>
  );
};

export default App;