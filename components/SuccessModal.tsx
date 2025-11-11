import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const WORKER_GIF_URL = 'https://sexehrjneeghnomoxopq.supabase.co/storage/v1/object/public/assets/worker-hammer.gif';

// The animation is portal'd to the body to escape the modal's stacking context
const HammerWorkerAnimation = ({ style }: { style: React.CSSProperties | null }) => {
    if (!style) return null;
    
    return createPortal(
        <img 
            src={WORKER_GIF_URL} 
            alt="A pixel art construction worker hammering the billboard" 
            style={style}
            aria-hidden="true"
        />,
        document.body
    );
};


interface SuccessModalProps {
  onClose: () => void;
  lastBookedPlots: string[];
}

const CheckIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

export function SuccessModal({ onClose, lastBookedPlots }: SuccessModalProps) {
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties | null>(null);

  useEffect(() => {
    if (lastBookedPlots.length === 0) return;

    const gridEl = document.querySelector<HTMLDivElement>('[data-billboard-grid]');
    if (!gridEl) return;

    // Use a small delay to ensure the grid is painted correctly before measuring
    const measureTimeout = setTimeout(() => {
        const gridRect = gridEl.getBoundingClientRect();
        const GRID_COLS = 28;
        const GRID_ROWS = 14;

        const plotWidth = gridRect.width / GRID_COLS;
        const plotHeight = gridRect.height / GRID_ROWS;

        const coords = lastBookedPlots.map(p => p.split('-').map(Number));
        const rows = coords.map(([r]) => r);
        const cols = coords.map(([, c]) => c);
        const minR = Math.min(...rows);
        const maxR = Math.max(...rows);
        const minC = Math.min(...cols);
        const maxC = Math.max(...cols);

        const corners = [
            // Top-left corner
            { top: gridRect.top + minR * plotHeight, left: gridRect.left + minC * plotWidth, transform: 'translate(-80%, -90%)' }, 
            // Top-right corner (flipped horizontally)
            { top: gridRect.top + minR * plotHeight, left: gridRect.left + (maxC + 1) * plotWidth, transform: 'translate(-20%, -90%) scaleX(-1)' }, 
            // Bottom-left corner
            { top: gridRect.top + (maxR + 1) * plotHeight, left: gridRect.left + minC * plotWidth, transform: 'translate(-80%, -20%)' },
             // Bottom-right corner (flipped horizontally)
            { top: gridRect.top + (maxR + 1) * plotHeight, left: gridRect.left + (maxC + 1) * plotWidth, transform: 'translate(-20%, -20%) scaleX(-1)' },
        ];

        const chosenCorner = corners[Math.floor(Math.random() * corners.length)];

        setAnimationStyle({
            position: 'fixed',
            top: `${chosenCorner.top}px`,
            left: `${chosenCorner.left}px`,
            transform: chosenCorner.transform,
            zIndex: 50,
            width: '100px',
            height: 'auto',
            imageRendering: 'pixelated',
            transition: 'opacity 0.4s ease-in-out',
            opacity: 0, // Start transparent
            pointerEvents: 'none'
        });
        
        // Fade in
        const fadeInTimeout = setTimeout(() => {
            setAnimationStyle(prev => prev ? { ...prev, opacity: 1 } : null);
        }, 100);

        // Timer to hide the animation
        const hideTimer = setTimeout(() => {
            setAnimationStyle(prev => prev ? { ...prev, opacity: 0 } : null);
            const removeTimer = setTimeout(() => setAnimationStyle(null), 400); // Remove from DOM after fade-out
            
            return () => clearTimeout(removeTimer);
        }, 3500); // Show for 3.5 seconds

        return () => {
          clearTimeout(fadeInTimeout);
          clearTimeout(hideTimer);
        };
    }, 100);
    
    return () => clearTimeout(measureTimeout);
  }, [lastBookedPlots]);

  return (
    <>
      <HammerWorkerAnimation style={animationStyle} />
      <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4"
          aria-modal="true"
          role="dialog"
      >
        <div className="bg-gray-200 border-4 border-black p-6 sm:p-8 w-full max-w-md relative text-black text-center">
          <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500 border-2 border-black flex items-center justify-center mb-6">
                  <CheckIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ textShadow: '2px 2px #fff' }}>
                  Ad Published!
              </h2>
              <p className="mb-8 text-sm sm:text-base">
                  Your ad has been published to the Digital Billboard!
              </p>
              <div className="w-full flex flex-col items-center gap-4">
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white border-2 border-b-4 border-black hover:bg-blue-600 active:border-b-2 active:mt-0.5"
                >
                    Awesome!
                </button>
              </div>
          </div>
        </div>
      </div>
    </>
  );
}