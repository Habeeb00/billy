import React, { useState, useMemo } from 'react';
import type { Ad } from '../types';

const GRID_COLS = 28;
const GRID_ROWS = 14;

// --- Helper Functions ---
const parsePlotId = (plotId: string): [number, number] => {
    return plotId.split('-').map(Number) as [number, number];
};

const getAdBoundingBox = (ad: Ad) => {
    const plots = ad.plots.map(parsePlotId);
    const rows = plots.map(([r]) => r);
    const cols = plots.map(([, c]) => c);
    const minR = Math.min(...rows);
    const maxR = Math.max(...rows);
    const minC = Math.min(...cols);
    const maxC = Math.max(...cols);
    return {
        gridRowStart: minR + 1,
        gridColumnStart: minC + 1,
        gridRowEnd: `span ${maxR - minR + 1}`,
        gridColumnEnd: `span ${maxC - minC + 1}`,
    };
};

// --- Sub-components ---
const PurchasedAd: React.FC<{ ad: Ad }> = ({ ad }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative group bg-black"
            style={getAdBoundingBox(ad)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`Ad: ${ad.message}`}
        >
            <img
                src={ad.imageUrl}
                alt={ad.message}
                className="w-full h-full object-cover"
            />
            {isHovered && (
                <div 
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] px-3 py-1.5 bg-black text-white rounded-md text-center text-xs sm:text-sm z-10 pointer-events-none"
                >
                    {ad.message}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black"></div>
                </div>
            )}
        </div>
    );
};

const EmptyPlot: React.FC<{
    plotId: string;
    isSelected: boolean;
    onMouseDown: (plotId: string) => void;
    onMouseEnter: (plotId: string) => void;
}> = ({ plotId, isSelected, onMouseDown, onMouseEnter }) => (
    <div
        onMouseDown={() => onMouseDown(plotId)}
        onMouseEnter={() => onMouseEnter(plotId)}
        className={`w-full h-full bg-gray-800 transition-colors ${isSelected ? 'outline outline-2 outline-green-400 outline-offset-[-2px]' : 'hover:bg-gray-700'}`}
        aria-label={`Purchase plot ${plotId}`}
    >
    </div>
);

// --- Main Component ---
interface BillboardGridProps {
    ads: Ad[];
    selectedPlots: string[];
    setSelectedPlots: (plots: string[]) => void;
    purchasedPlotIds: Set<string>;
}

export const BillboardGrid: React.FC<BillboardGridProps> = ({ ads, selectedPlots, setSelectedPlots, purchasedPlotIds }) => {
    const [isSelecting, setIsSelecting] = useState(false);
    const [startPlot, setStartPlot] = useState<string | null>(null);
    const selectedPlotsSet = useMemo(() => new Set(selectedPlots), [selectedPlots]);

    const getPlotsInRect = (startId: string, endId: string): string[] => {
        const [startRow, startCol] = parsePlotId(startId);
        const [endRow, endCol] = parsePlotId(endId);
        const plots: string[] = [];
        const r1 = Math.min(startRow, endRow);
        const r2 = Math.max(startRow, endRow);
        const c1 = Math.min(startCol, endCol);
        const c2 = Math.max(startCol, endCol);

        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) {
                plots.push(`${r}-${c}`);
            }
        }
        return plots;
    };

    const handleMouseDown = (plotId: string) => {
        if (purchasedPlotIds.has(plotId)) return;
        setIsSelecting(true);
        setStartPlot(plotId);
        setSelectedPlots([plotId]);
    };

    const handleMouseEnter = (plotId: string) => {
        if (!isSelecting || !startPlot) return;
        const plotsInRect = getPlotsInRect(startPlot, plotId);
        
        // Check if any plot in the potential rectangular selection is already purchased.
        const isSelectionValid = !plotsInRect.some(p => purchasedPlotIds.has(p));

        if (isSelectionValid) {
             // Only update the selection if the entire rectangle is available.
            setSelectedPlots(plotsInRect);
        }
        // If the selection is not valid (i.e., it overlaps with a purchased plot),
        // we do nothing, which stops the selection rectangle from expanding over booked plots.
    };
    
    const handleMouseUp = () => {
        setIsSelecting(false);
        setStartPlot(null);
    };

    return (
        <div 
            className="w-[95vw] h-[47.5vw] md:w-[80vw] md:h-[40vw] max-w-[1600px] max-h-[800px] bg-gray-900 grid grid-cols-[repeat(28,minmax(0,1fr))] grid-rows-[repeat(14,minmax(0,1fr))] gap-px border-2 border-black overflow-hidden relative"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                const row = Math.floor(index / GRID_COLS);
                const col = index % GRID_COLS;
                const plotId = `${row}-${col}`;
                
                if (purchasedPlotIds.has(plotId)) {
                    return <div key={plotId} className="bg-gray-900"></div>; // Placeholder for purchased plots
                }

                return (
                    <EmptyPlot
                        key={plotId}
                        plotId={plotId}
                        isSelected={selectedPlotsSet.has(plotId)}
                        onMouseDown={handleMouseDown}
                        onMouseEnter={handleMouseEnter}
                    />
                );
            })}
            
            {/* Render full-sized ads on top */}
            {ads.map((ad) => <PurchasedAd key={ad.id} ad={ad} />)}
        </div>
    );
};