

import React, { useMemo } from 'react';
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
interface PurchasedAdProps {
    ad: Ad;
}

function PurchasedAd({ ad }: PurchasedAdProps) {
    const [isHovered, setIsHovered] = React.useState(false);

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
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-[200px] px-3 py-1.5 bg-black text-white rounded-md text-center text-xs sm:text-sm z-20 pointer-events-none"
                >
                    {ad.message}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-black"></div>
                </div>
            )}
        </div>
    );
}

interface EmptyPlotProps {
    plotId: string;
    isSelected: boolean;
    onClick: (plotId: string) => void;
}

function EmptyPlot({ plotId, isSelected, onClick }: EmptyPlotProps) {
    const baseClasses = 'w-full h-full transition-colors bg-gray-800 hover:bg-gray-700 cursor-pointer';
    const selectedClasses = 'outline outline-2 outline-green-400 outline-offset-[-2px] z-10';

    return (
        <div
            onClick={() => onClick(plotId)}
            className={`${baseClasses} ${isSelected ? selectedClasses : ''}`}
            aria-label={`Purchase plot ${plotId}`}
        >
        </div>
    );
}


// --- Main Component ---
interface BillboardGridProps {
    ads: Ad[];
    selectedPlots: string[];
    setSelectedPlots: (plots: string[]) => void;
    purchasedPlotIds: Set<string>;
}

export function BillboardGrid({ ads, selectedPlots, setSelectedPlots, purchasedPlotIds }: BillboardGridProps) {
    const selectedPlotsSet = useMemo(() => new Set(selectedPlots), [selectedPlots]);

    const handlePlotClick = (plotId: string) => {
        if (purchasedPlotIds.has(plotId)) {
            return;
        }
        
        const newSelectedPlots = new Set(selectedPlotsSet);
        if (newSelectedPlots.has(plotId)) {
            newSelectedPlots.delete(plotId);
        } else {
            newSelectedPlots.add(plotId);
        }
        setSelectedPlots(Array.from(newSelectedPlots));
    };

    const adDataMap = useMemo(() => {
        const map = new Map<string, { ad: Ad; isTopLeft: boolean }>();
        ads.forEach(ad => {
            const topLeftPlotId = ad.plots[0]; // Assumes plots are sorted
            ad.plots.forEach(plotId => {
                map.set(plotId, { ad, isTopLeft: plotId === topLeftPlotId });
            });
        });
        return map;
    }, [ads]);

    return (
        <div 
            className="w-[95vw] h-[47.5vw] md:w-[80vw] md:h-[40vw] max-w-[1600px] max-h-[800px] bg-gray-900 grid grid-cols-[repeat(28,minmax(0,1fr))] grid-rows-[repeat(14,minmax(0,1fr))] gap-px border-2 border-black overflow-hidden"
        >
            {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                const row = Math.floor(index / GRID_COLS);
                const col = index % GRID_COLS;
                const plotId = `${row}-${col}`;
                
                const plotAdInfo = adDataMap.get(plotId);

                if (plotAdInfo) {
                    // This plot is part of a purchased ad.
                    // Only render the ad component for the top-left plot of the ad.
                    if (plotAdInfo.isTopLeft) {
                        return <PurchasedAd key={plotAdInfo.ad.id} ad={plotAdInfo.ad} />;
                    }
                    // For other plots covered by the ad, render nothing.
                    return null;
                } else {
                    // This plot is not part of any ad, so it's an empty, clickable plot.
                    return (
                        <EmptyPlot
                            key={plotId}
                            plotId={plotId}
                            isSelected={selectedPlotsSet.has(plotId)}
                            onClick={handlePlotClick}
                        />
                    );
                }
            })}
        </div>
    );
}