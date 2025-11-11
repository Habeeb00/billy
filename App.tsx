import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { PurchaseModal } from './components/PurchaseModal';
import { SuccessModal } from './components/SuccessModal';
import { BillboardGrid } from './components/BillboardGrid';
import { AuthModal } from './components/AuthModal';
import type { Ad, Theme } from './types';


// --- Supabase Configuration ---
const supabaseUrl = "https://sexehrjneeghnomoxopq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNleGVocmpuZWVnaG5vbW94b3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzYzMTQsImV4cCI6MjA3NjgxMjMxNH0.OBioxZMP4y1B3dC9seGkdEMzR3WOAeZa-rqqd3aDT3c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => {
      // Create a new Headers object to preserve existing headers from Supabase client
      const headers = new Headers(init?.headers);

      // Add cache-busting headers to prevent stale data from service workers/browser cache
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');

      // Return the fetch request with the merged headers and cache option
      return fetch(input, {
        ...init,
        headers,
        cache: 'reload',
      });
    },
  },
});

// --- Admin Configuration ---
const ADMIN_EMAIL = "habeebrahmanofficial@gmail.com";
const TOTAL_FREE_SLOTS = 2;


const THEMES: Theme[] = ['day', 'night'];

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
const CLOUD_IMAGES = [
  'https://sexehrjneeghnomoxopq.supabase.co/storage/v1/object/public/assets/pngegg%20(1).png',
  'https://sexehrjneeghnomoxopq.supabase.co/storage/v1/object/public/assets/pngegg%20(2).png'
];

const BIRD_GIF_URL_LTR = 'https://sexehrjneeghnomoxopq.supabase.co/storage/v1/object/public/assets/ezgif.com-animated-gif-maker%20(1).gif';
const BIRD_GIF_URL_RTL = 'https://sexehrjneeghnomoxopq.supabase.co/storage/v1/object/public/assets/left%20bird.gif';


const Cloud: React.FC<{ style: React.CSSProperties; imgSrc: string }> = ({ style, imgSrc }) => {
  return (
    <img 
      src={imgSrc} 
      alt="A pixel art cloud" 
      className="absolute w-24 h-auto md:w-48 pointer-events-none" 
      style={{ ...style, imageRendering: 'pixelated' }} 
    />
  );
};

const Star: React.FC<{ style: React.CSSProperties }> = ({ style }) => {
  return <div className="absolute bg-white w-1 h-1 rounded-full" style={{...style, animation: `twinkle ${Math.random() * 3 + 2}s infinite`}}></div>;
};

const Sun = () => {
  return <div className="w-16 h-16 md:w-32 md:h-32 bg-yellow-300 rounded-full shadow-lg"></div>;
}

const Moon = () => {
  return <div className="w-16 h-16 md:w-32 md:h-32 bg-gray-200 rounded-full shadow-lg border-4 border-gray-300"></div>;
}

const Bird: React.FC<{ style: React.CSSProperties; imgSrc: string }> = ({ style, imgSrc }) => {
  return (
    <img
      src={imgSrc}
      alt="A pixel art bird flying"
      className="absolute w-6 h-6 md:w-10 md:h-10 pointer-events-none"
      style={{ ...style, imageRendering: 'pixelated' }}
    />
  );
};

const BG_COLORS: Record<Theme, string> = {
  day: 'bg-sky-400',
  night: 'bg-slate-900',
};

function DynamicBackgroundComponent({ theme, animationsEnabled }: { theme: Theme, animationsEnabled: boolean }) {
    const clouds = useMemo(() => Array.from({ length: 7 }).map((_, i) => ({
        style: {
            top: `${Math.random() * 40}%`,
            animation: `${i % 2 === 0 ? 'drift' : 'drift-reverse'} ${Math.random() * 30 + 20}s linear infinite`,
            animationDelay: `-${Math.random() * 50}s`,
        },
        imgSrc: CLOUD_IMAGES[Math.floor(Math.random() * CLOUD_IMAGES.length)]
    })), []);

    const birds = useMemo(() => {
        const birdData = [];
        // 2 birds flying left-to-right
        for (let i = 0; i < 2; i++) {
            birdData.push({
                imgSrc: BIRD_GIF_URL_LTR,
                style: {
                    top: `${Math.random() * 30 + 5}%`,
                    animation: `fly ${Math.random() * 10 + 8}s linear infinite`,
                    animationDelay: `-${Math.random() * 20}s`,
                }
            });
        }
        // 1 bird flying right-to-left
        birdData.push({
            imgSrc: BIRD_GIF_URL_RTL,
            style: {
                top: `${Math.random() * 30 + 5}%`,
                animation: `fly-reverse ${Math.random() * 10 + 8}s linear infinite`,
                animationDelay: `-${Math.random() * 20}s`,
            }
        });
        return birdData;
    }, []);

    const nightBirds = useMemo(() => {
        // Only one bird for the night theme for ambiance
        return [{
            imgSrc: BIRD_GIF_URL_RTL, // Darker bird for night
            style: {
                top: `${Math.random() * 40 + 10}%`,
                animation: `fly-reverse ${Math.random() * 12 + 10}s linear infinite`,
                animationDelay: `-${Math.random() * 22}s`,
            }
        }];
    }, []);

    const stars = useMemo(() => Array.from({ length: 80 }).map(() => ({
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
    })), []);
    
    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            {/* Sun Wrapper: Animates using smooth CSS transitions */}
            <div className={`absolute top-[10%] left-[10%] md:left-[2%] ${animationsEnabled ? 'transition-all duration-[1500ms] ease-in-out' : ''} ${theme === 'day' ? 'opacity-100 translate-x-0 translate-y-0 rotate-0' : 'opacity-0 translate-x-[110vw] translate-y-[10vh] rotate-90'}`}>
                <Sun />
            </div>

            {/* Moon Wrapper: Rises from left to take sun's place */}
            <div className={`absolute top-[10%] left-[10%] md:left-[2%] ${animationsEnabled ? 'transition-all duration-[1500ms] ease-in-out' : ''} ${theme === 'night' ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 -translate-x-[100vw]'}`}>
                <Moon />
            </div>
            
            {/* Day elements */}
            <div className={`absolute inset-0 ${animationsEnabled ? 'transition-opacity duration-[1500ms]' : ''} ${theme === 'day' ? 'opacity-100' : 'opacity-0'}`}>
                {animationsEnabled && clouds.map(({ style, imgSrc }, i) => <Cloud key={`c-${i}`} style={style} imgSrc={imgSrc} />)}
                {animationsEnabled && birds.map(({ style, imgSrc }, i) => <Bird key={`b-${i}`} style={style} imgSrc={imgSrc} />)}
            </div>

            {/* Night elements */}
            <div className={`absolute inset-0 ${animationsEnabled ? 'transition-opacity duration-[1500ms]' : ''} ${theme === 'night' ? 'opacity-100' : 'opacity-0'}`}>
                {animationsEnabled && stars.map((style, i) => <Star key={`s-${i}`} style={style} />)}
                {animationsEnabled && nightBirds.map(({ style, imgSrc }, i) => (
                    <Bird 
                      key={`nb-${i}`} 
                      style={style} 
                      imgSrc={imgSrc} 
                    />
                ))}
            </div>
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
  const [lastBookedPlots, setLastBookedPlots] = useState<string[]>([]);
  const [theme, setTheme] = useState<Theme>('day');
  const [selectionAspectRatio, setSelectionAspectRatio] = useState(1);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAds = useCallback(async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      alert('Could not fetch ads from the database. Please try refreshing the page.');
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
      // If the user is now logged in, close the auth modal.
      if (session) {
        setIsAuthModalOpen(false);
      }
    })

    // Listen for real-time database changes
    const channel = supabase.channel('billboard-realtime');

    channel
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ads' },
        () => {
          fetchAds();
        }
      )
      .subscribe();


    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [fetchAds]);

  const userBookedPlotCount = useMemo(() => {
      if (!session) return 0;
      return ads
          .filter(ad => ad.user_id === session.user.id)
          .reduce((total, ad) => total + ad.plots.length, 0);
  }, [ads, session]);

  const freeSlotsBeforeSelection = isAdmin ? Infinity : Math.max(0, TOTAL_FREE_SLOTS - userBookedPlotCount);
  const needsMoreSlots = !isAdmin && selectedPlots.length > 0 && selectedPlots.length > freeSlotsBeforeSelection;


  const purchasedPlotIds = useMemo(() => {
    return new Set(ads.flatMap(ad => ad.plots));
  }, [ads]);

  const isSelectionValid = useMemo(() => {
      return isSelectionRectangular(selectedPlots);
  }, [selectedPlots]);

  const handleOpenModal = () => {
    if (selectedPlots.length === 0 || !isSelectionValid || needsMoreSlots) return;
    
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
    setLastBookedPlots([]);
    fetchAds(); // Explicitly refetch ads to ensure UI is up-to-date.
  }, [fetchAds]);

  const handlePurchase = useCallback(async (imageBlob: Blob, message: string) => {
    if (!session) {
        alert("You must be logged in to book a plot. The login modal will now open.");
        handleCloseModal();
        setIsAuthModalOpen(true);
        return;
    }

    if (selectedPlots.length === 0) {
        handleCloseModal();
        return;
    }
    
    try {
        // Step 1: Upload the image first. If this fails, we haven't touched the database.
        const filePath = `ad-${session.user.id}-${Date.now()}`;
        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, imageBlob);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);
        
        if (!urlData?.publicUrl) throw new Error("Could not get public URL for the image.");
        
        const imageUrl = urlData.publicUrl;
        
        const sortedPlots = [...selectedPlots].sort((a, b) => {
            const [aRow, aCol] = a.split('-').map(Number);
            const [bRow, bCol] = b.split('-').map(Number);
            if (aRow !== bRow) return aRow - bRow;
            return aCol - bCol;
        });

        // Step 2: Call the atomic database function to book the ad. This is race-condition-safe.
        const { error: rpcError } = await supabase.rpc('book_ad_safely', {
            plots_to_book: sortedPlots,
            image_url_to_insert: imageUrl,
            message_to_insert: message,
            user_id_to_insert: session.user.id
        });

        if (rpcError) {
            // The RPC function will raise an exception if plots overlap, which we catch here.
            throw new Error(rpcError.message);
        }

        // Success! The real-time listener will update the UI automatically.
        setLastBookedPlots(sortedPlots);
        setIsModalOpen(false);
        setIsSuccessModalOpen(true);

    } catch (error: any) {
        if (error && typeof error.message === 'string') {
            if (error.message.toLowerCase().includes('bucket not found')) {
                 alert("Purchase failed: Storage bucket 'images' not found.\n\nPlease go to your Supabase dashboard, navigate to Storage, and create a new PUBLIC bucket named 'images'.");
            } else if (error.message.includes('plots have already been booked')) {
                // This is our custom error from the RPC.
                alert(`Booking failed: ${error.message} The billboard will refresh to show the latest state.`);
                fetchAds(); // Force a refresh to show the ad that blocked us.
            } else {
                alert(`Sorry, there was an error booking your plot: ${error.message}.`);
            }
        } else {
             alert(`An unknown error occurred during purchase.`);
        }
       
        handleCloseModal();
    }
  }, [selectedPlots, handleCloseModal, session, fetchAds]);
  
  const handleDeleteAd = useCallback(async (adId: string) => {
    if (!session || !isAdmin) {
      alert("You do not have permission to delete ads.");
      return;
    }
    if (!window.confirm('Are you sure you want to remove this ad? This cannot be undone.')) {
        return;
    }

    const originalAds = ads;
    
    // Optimistic deletion from UI
    setAds(currentAds => currentAds.filter(ad => ad.id !== adId));

    try {
        const { error } = await supabase.rpc('delete_ad', { ad_id: adId });

        if (error) {
            throw error; // Let the catch block handle it
        }
        // Success, UI is already updated.

    } catch (error: any) {
        alert(`Failed to delete ad: ${error.message}. The billboard will be restored. This could be a permissions issue or the 'delete_ad' function might be missing in your Supabase project.`);
        setAds(originalAds); // Revert UI on failure
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
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Could not log out. Please try again.");
    }
  };

  const renderBookingButton = () => {
      if (!session) {
          return (
              <button
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={!isSelectionValid}
                  className="px-4 py-2 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5 transition-all text-sm whitespace-nowrap disabled:bg-gray-500 disabled:cursor-not-allowed disabled:border-b-2"
                  aria-label="Login to book selected plots"
              >
                  Login to Book ({selectedPlots.length})
                  {!isSelectionValid && <span className="block text-xs lowercase mt-1">(not a rectangle)</span>}
              </button>
          );
      }
      
      if (needsMoreSlots) {
        const mailtoHref = `mailto:${ADMIN_EMAIL}?subject=Request for More Ad Slots&body=Hi, I would like to request more ad slots. My user email is: ${session.user.email}`;
        return (
            <a
                href={mailtoHref}
                className="px-4 py-2 bg-yellow-400 text-black border-2 border-b-4 border-black hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all text-sm whitespace-nowrap text-center"
                aria-label="Contact for more slots"
            >
                Contact ({selectedPlots.length})
            </a>
        )
      }

      return (
          <button
              onClick={handleOpenModal}
              disabled={!isSelectionValid}
              className="px-4 py-2 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5 transition-all text-sm whitespace-nowrap disabled:bg-gray-500 disabled:cursor-not-allowed disabled:border-b-2"
              aria-label={`Book ${selectedPlots.length} selected plots`}
          >
              Book Selection ({selectedPlots.length})
              {!isSelectionValid && <span className="block text-xs lowercase mt-1">(not a rectangle)</span>}
          </button>
      );
  };


  return (
    <main className="relative w-screen h-screen overflow-hidden">
      <div className={`absolute inset-0 z-0 pointer-events-none transition-colors duration-1000 ${BG_COLORS[theme]}`}>
        <DynamicBackground theme={theme} animationsEnabled={true} />
      </div>

      <div className="relative z-10 w-full h-full pointer-events-none">
        <div className="absolute top-4 right-4 flex flex-col sm:flex-row gap-2 pointer-events-auto">
          <button
            onClick={cycleTheme}
            className="bg-yellow-400 text-black border-2 border-b-4 border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
            aria-label={`Switch theme from ${theme}`}
          >
            THEME
          </button>
          <a 
            href="https://www.buymeacoffee.com/habeebrahman" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-yellow-400 text-black border-2 border-b-4 border-black px-2 py-1 text-xs hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all text-center sm:hidden"
            aria-label="Support the creator by buying them a coffee"
          >
            COFFEE
          </a>
          {session ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white border-2 border-b-4 border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm hover:bg-red-600 active:border-b-2 active:mt-0.5 transition-all"
                aria-label="Log out"
              >
                LOGOUT {isAdmin && '(ADMIN)'}
              </button>
          ) : (
             <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-yellow-400 text-black border-2 border-b-4 border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all"
                aria-label="Open login modal"
              >
                LOGIN
              </button>
          )}
        </div>

        <div className="w-full h-full flex flex-col items-center justify-end">
            <div className="flex flex-col items-center relative">
                <p className={`absolute bottom-full text-white text-sm mb-4 text-center pointer-events-none w-full transition-opacity duration-500 ${selectedPlots.length === 0 ? 'opacity-100' : 'opacity-0'}`} style={{ textShadow: '2px 2px rgba(0,0,0,0.7)' }}>
                    Click on the slot to book your slot
                </p>
                {/* Billboard Grid */}
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

                {/* Billboard Stand */}
                <div className="w-32 sm:w-40 h-60 sm:h-48 bg-green-600 border-x-4 border-b-4 border-black shadow-[inset_0_5px_0px_#ffffff4d,_inset_0_-5px_0px_#0000004d]"></div>
            </div>
        </div>
      </div>

      {/* Booking Controls - Fixed at bottom */}
      {selectedPlots.length > 0 && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
              {session && !isAdmin && (
                  <p className="text-xs sm:text-sm text-white bg-black/50 px-3 py-1 rounded">
                      Free Slots Remaining: {freeSlotsBeforeSelection} / {TOTAL_FREE_SLOTS}
                  </p>
              )}
              <div className="flex items-center gap-2">
                  {renderBookingButton()}
                  <button
                      onClick={handleClearSelection}
                      className="px-4 py-2 bg-red-500 text-white border-2 border-b-4 border-black hover:bg-red-600 active:border-b-2 active:mt-0.5 transition-all text-sm"
                      aria-label="Clear current selection"
                  >
                      Clear
                  </button>
              </div>
          </div>
      )}
      
      <a 
        href="https://www.buymeacoffee.com/habeebrahman" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden md:inline-flex items-center gap-2 fixed bottom-4 left-4 z-20 px-3 py-2 bg-yellow-400 text-black border-2 border-b-4 border-black hover:bg-yellow-500 active:border-b-2 active:mt-0.5 transition-all text-sm pointer-events-auto"
        aria-label="Support the creator by buying them a coffee"
      >
        <span>☕</span>
        <span>Buy me a coffee</span>
      </a>


      {isModalOpen && (
        <PurchaseModal
          onClose={handleCloseModal}
          onPurchase={handlePurchase}
          aspectRatio={selectionAspectRatio}
        />
      )}

      {isSuccessModalOpen && (
        <SuccessModal 
            onClose={handleCloseSuccessModal} 
            lastBookedPlots={lastBookedPlots} 
        />
      )}

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </main>
  );
};

export default App;