import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { PurchaseModal } from './components/PurchaseModal';
import { SuccessModal } from './components/SuccessModal';
import { BillboardGrid } from './components/BillboardGrid';
import { AuthModal } from './components/AuthModal';
import type { Ad, Theme } from './types';


// --- Supabase Configuration ---
// IMPORTANT: Replace with your actual Supabase project URL and anon key.
const supabaseUrl = "https://sexehrjneeghnomoxopq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleGVocmpuZWVnaG5vbW94b3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzYzMTQsImV4cCI6MjA3NjgxMjMxNH0.OBioxZMP4y1B3dC9seGkdEMzR3WOAeZa-rqqd3aDT3c";

// Export the client so other components can use it.
// FIX: Added custom fetch to bypass service worker cache issues (net::ERR_FAILED).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => {
      return fetch(input, { ...init, cache: 'reload' });
    },
  },
});

// --- Admin Configuration ---
// >>> IMPORTANT <<<
// TO MAKE THE ADMIN FEATURES WORK, YOU MUST REPLACE THIS PLACEHOLDER
// WITH THE EXACT EMAIL ADDRESS YOU USE TO LOG IN AS THE ADMINISTRATOR.
const ADMIN_EMAIL = "habeebrahmanofficial@gmail.com"; // <-- CHANGE THIS VALUE!


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

    if (plots.length !== width * height) {
        return false; 
    }
    
    return true;
};

// --- Background Components ---
const Cloud = ({ style }: { style: React.CSSProperties }) => {
  return (
    <div className="absolute w-24 h-10 sm:w-36 sm:h-16 bg-white rounded-full opacity-90" style={style}>
      <div className="absolute -bottom-2 left-4 w-16 h-8 sm:w-24 sm:h-12 bg-white rounded-full"></div>
      <div className="absolute -bottom-1 right-4 w-12 h-6 sm:w-20 sm:h-10 bg-white rounded-full"></div>
    </div>
  );
};

const Star = ({ style }: { style: React.CSSProperties }) => {
  return <div className="absolute bg-white w-1 h-1 rounded-full" style={{...style, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>;
};

function Sun() {
  return <div className="absolute top-12 left-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg"></div>;
}

function Moon() {
  return <div className="absolute top-12 right-12 w-16 h-16 bg-gray-200 rounded-full shadow-lg border-4 border-gray-300"></div>;
}

const Raindrop = ({ style }: { style: React.CSSProperties }) => {
  return (
    <div className="absolute w-0.5 h-10 bg-blue-300 opacity-50" style={style}></div>
  );
};

const Bird = ({ style }: { style: React.CSSProperties }) => {
  return (
    <div className="absolute w-8 h-8" style={style}>
      <svg viewBox="0 0 10 7" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
        <path d="M0 2h1v1h1v1h1v-1h1v-1h2v1h1v1h2v-1h1v2h-1v-1h-1v-1h-1v1h-1v1h-2v-1h-1v-1h-2v1h-1z" fill="black" />
      </svg>
    </div>
  );
};

const Snowflake = ({ style }: { style: React.CSSProperties }) => {
    return <div className="absolute text-white text-lg select-none" style={style}>❄</div>;
};

const ShootingStar = ({ style }: { style: React.CSSProperties }) => {
  return (
    <div className="absolute" style={style}>
      <div className="absolute w-48 h-px bg-gradient-to-l from-white/50 to-transparent transform rotate-[225deg] origin-top-left"></div>
    </div>
  );
};


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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>('day');
  const [selectionAspectRatio, setSelectionAspectRatio] = useState(1);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAds = useCallback(async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching ads:', error);
      alert('Could not fetch ads from the database. Check the console for more details.');
    } else if (data) {
      setAds(data as Ad[]);
    }
  }, []);

  useEffect(() => {
    fetchAds();

    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    })

    // Listen for auth state changes (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAdmin(session?.user?.email === ADMIN_EMAIL);
    })

    // Listen for real-time database changes
    const channel = supabase.channel('ads-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ads' },
        (payload) => {
          setAds(currentAds => [...currentAds, payload.new as Ad]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ads' },
        (payload) => {
            setAds(currentAds => currentAds.filter(ad => ad.id !== (payload.old as Ad).id));
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [fetchAds]);


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
  
  const handleCloseSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false);
    setSelectedPlots([]);
    fetchAds(); // Reload the billboard data
  }, [fetchAds]);

  const handlePurchase = useCallback(async (imageBlob: Blob, message: string) => {
    if (selectedPlots.length > 0) {
        try {
            // FIX: Removed 'public/' prefix to prevent incorrect path creation which caused a 400 error.
            const filePath = `ad-${Date.now()}`;
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, imageBlob);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);
            
            if (!urlData?.publicUrl) throw new Error("Could not get public URL for the image.");
            
            const imageUrl = urlData.publicUrl;

            const newAdData = {
                plots: [...selectedPlots].sort((a, b) => {
                    const [aRow, aCol] = a.split('-').map(Number);
                    const [bRow, bCol] = b.split('-').map(Number);
                    if (aRow !== bRow) return aRow - bRow;
                    return aCol - bCol;
                }),
                imageUrl,
                message,
            };
            
            const { error: insertError } = await supabase.from('ads').insert([newAdData]);
            
            if (insertError) throw insertError;

            setIsModalOpen(false);
            setIsSuccessModalOpen(true);

        } catch (error: any) {
            console.error("Error purchasing plot:", error);
            if (error && typeof error.message === 'string' && error.message.toLowerCase().includes('bucket not found')) {
                 alert("Purchase failed: Storage bucket 'images' not found.\n\nPlease go to your Supabase dashboard, navigate to Storage, and create a new PUBLIC bucket named 'images'.");
            } else {
                alert("Sorry, there was an error booking your plot. Please check the console and try again.");
            }
            handleCloseModal();
        }
    } else {
        handleCloseModal();
    }
  }, [selectedPlots, handleCloseModal]);
  
  const handleDeleteAd = useCallback(async (adId: string) => {
    if (!session || !isAdmin) {
      alert("You do not have permission to delete ads.");
      return;
    }
    if (!window.confirm('Are you sure you want to remove this ad? This cannot be undone.')) {
        return;
    }

    const originalAds = ads;
    
    // Optimistic UI update: remove the ad from the local state immediately.
    setAds(currentAds => currentAds.filter(ad => ad.id !== adId));

    try {
        // FIX: Use a Supabase RPC call instead of a direct DELETE request.
        // This is more robust and avoids the net::ERR_FAILED error caused by service workers.
        const { error } = await supabase.rpc('delete_ad', { ad_id: adId });

        if (error) {
            // If the RPC call fails, throw the error to be caught below.
            throw error;
        }
        // If successful, the optimistic update was correct and we're done.

    } catch (error: any) {
        console.error('Error deleting ad via RPC:', error);
        console.error('Full error object:', error);
        alert(`Failed to delete ad: ${error.message}. The billboard will be restored. This could be a permissions issue or the 'delete_ad' function might be missing in your Supabase project.`);
        // Rollback the optimistic update on failure.
        setAds(originalAds);
    }
}, [ads, session, isAdmin]);


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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Could not log out. Please try again.");
    }
  };


  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 ${BG_COLORS[theme]}`}>
        <DynamicBackground theme={theme} animationsEnabled={animationsEnabled} />
      </div>

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
          {session ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white border-2 border-b-4 border-black px-4 py-2 text-sm hover:bg-red-600 active:border-b-2 active:mt-0.5 transition-all"
                aria-label="Log out"
              >
                LOGOUT {isAdmin && '(ADMIN)'}
              </button>
          ) : (
             <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-yellow-400 text-black border-2 border-b-4 border-black px-4 py-2 text-sm hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
                aria-label="Open login modal"
              >
                LOGIN
              </button>
          )}
        </div>

        <div className="w-full h-full flex flex-col items-center justify-end">
          <div className="relative flex flex-col items-center">
            <div className="bg-[#4a4a4a] p-2 sm:p-3 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.7)] pointer-events-auto">
              <div className="border-4 border-t-gray-300 border-l-gray-300 border-b-gray-800 border-r-gray-800">
                <BillboardGrid
                  ads={ads}
                  selectedPlots={selectedPlots}
                  setSelectedPlots={setSelectedPlots}
                  purchasedPlotIds={purchasedPlotIds}
                  isAdmin={isAdmin}
                  onDeleteAd={handleDeleteAd}
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

      {isSuccessModalOpen && (
        <SuccessModal onClose={handleCloseSuccessModal} />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </main>
  );
};

export default App;