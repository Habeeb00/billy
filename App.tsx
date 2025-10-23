import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PurchaseModal } from './components/PurchaseModal';
import { BillboardGrid } from './components/BillboardGrid';
import type { Ad, Theme } from './types';

const THEMES: Theme[] = ['day', 'night', 'rain'];

// --- Background Components ---
const Cloud: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-24 h-10 sm:w-36 sm:h-16 bg-white rounded-full opacity-90" style={style}>
    <div className="absolute -bottom-2 left-4 w-16 h-8 sm:w-24 sm:h-12 bg-white rounded-full"></div>
    <div className="absolute -bottom-1 right-4 w-12 h-6 sm:w-20 sm:h-10 bg-white rounded-full"></div>
  </div>
);

const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => <div className="absolute bg-white w-1 h-1 rounded-full" style={{...style, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>;

const Sun: React.FC = () => <div className="absolute top-12 left-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"></div>;
const Moon: React.FC = () => <div className="absolute top-12 right-12 w-16 h-16 bg-gray-200 rounded-full shadow-lg border-4 border-gray-300"></div>;

const Raindrop: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-0.5 h-10 bg-blue-300 opacity-50" style={style}></div>
);

const BG_COLORS: Record<Theme, string> = {
  day: 'bg-sky-400',
  night: 'bg-slate-900',
  rain: 'bg-slate-800'
};

const DynamicBackground: React.FC<{ theme: Theme }> = React.memo(({ theme }) => {
    const clouds = useMemo(() => Array.from({ length: 7 }).map(() => ({
        top: `${Math.random() * 40}%`,
        animation: `drift ${Math.random() * 30 + 20}s linear infinite`,
        animationDelay: `-${Math.random() * 50}s`,
    })), []);

    const stars = useMemo(() => Array.from({ length: 80 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
    })), []);

    const raindrops = useMemo(() => Array.from({ length: 150 }).map(() => ({
        left: `${Math.random() * 100}vw`,
        top: '-50px',
        animation: `fall ${Math.random() * 0.5 + 0.3}s linear infinite`,
        animationDelay: `-${Math.random() * 2}s`
    })), []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10">
            {theme === 'day' && (
                <>
                    <Sun />
                    {clouds.map((style, i) => <Cloud key={i} style={style} />)}
                </>
            )}
            {theme === 'night' && (
                <>
                    <Moon />
                    {stars.map((style, i) => <Star key={i} style={style} />)}
                </>
            )}
            {theme === 'rain' && (
                <>
                    {raindrops.map((style, i) => <Raindrop key={i} style={style} />)}
                </>
            )}
        </div>
    );
});


// --- Main App Component ---
const App: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedPlots, setSelectedPlots] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('day');

  const purchasedPlotIds = useMemo(() => {
    return new Set(ads.flatMap(ad => ad.plots));
  }, [ads]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlots([]);
  }, []);

  const handlePurchase = useCallback((imageUrl: string, message: string) => {
    if (selectedPlots.length > 0) {
      const newAd: Ad = {
        id: `ad-${Date.now()}`,
        plots: [...selectedPlots].sort(),
        imageUrl,
        message,
      };
      setAds(prevAds => [...prevAds, newAd]);
    }
    handleCloseModal();
  }, [selectedPlots, handleCloseModal]);

  const cycleTheme = useCallback(() => {
    const currentIndex = THEMES.indexOf(theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex]);
  }, [theme]);

  return (
    <main className={`relative w-screen h-screen overflow-hidden transition-colors duration-1000 ${BG_COLORS[theme]}`}>
      <DynamicBackground theme={theme} />
      
      <button
        onClick={cycleTheme}
        className="absolute top-4 right-4 bg-yellow-400 text-black border-2 border-b-4 border-black px-4 py-2 text-sm z-20 hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
        aria-label={`Switch theme from ${theme}`}
      >
        THEME
      </button>

      <div className="w-full h-full flex flex-col items-center justify-end">
        <div className="relative flex flex-col items-center">
          {/* Mario-style Frame */}
          <div className="bg-[#4a4a4a] p-2 sm:p-3 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.7)]">
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
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 z-10">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5 transition-all text-sm sm:text-base"
                  aria-label={`Book ${selectedPlots.length} selected plots`}
                >
                  Book Selection ({selectedPlots.length})
                </button>
              </div>
            )}

          {/* Mario-style Stand */}
          <div className="w-32 sm:w-40 h-40 sm:h-48 bg-green-600 border-x-4 border-b-4 border-black shadow-[inset_0_5px_0px_rgba(255,255,255,0.3),_inset_0_-5px_0px_rgba(0,0,0,0.3)]"></div>
        </div>
      </div>

      {isModalOpen && (
        <PurchaseModal
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
        />
      )}
    </main>
  );
};

export default App;