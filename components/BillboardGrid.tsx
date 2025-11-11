import React, { useMemo, useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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


// --- Tooltip Component (with Portal) ---
const AdTooltip = ({ ad, rect }: { ad: Ad; rect: DOMRect }) => {
    const portalRoot = document.getElementById('tooltip-root');
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<React.CSSProperties>({
        opacity: 0, // Start hidden for position calculation
        pointerEvents: 'none',
    });
    const [arrowClasses, setArrowClasses] = useState('');

    useLayoutEffect(() => {
        if (!rect || !tooltipRef.current || !portalRoot) return;

        const tooltipNode = tooltipRef.current;
        const { innerWidth, innerHeight } = window;
        const tooltipRect = tooltipNode.getBoundingClientRect();

        const margin = 10;
        let top = rect.top - tooltipRect.height - margin;
        let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
        
        let newArrowClasses = "absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent";

        // Check top boundary and flip to bottom if needed
        if (top < margin) {
            top = rect.bottom + margin;
            newArrowClasses += " bottom-full border-b-8 border-b-black rotate-180";
        } else {
            newArrowClasses += " top-full border-t-8 border-t-black";
        }
        setArrowClasses(newArrowClasses);

        // Check left/right boundaries
        if (left < margin) {
            left = margin;
        }
        if (left + tooltipRect.width > innerWidth - margin) {
            left = innerWidth - tooltipRect.width - margin;
        }
        
        setStyle({
            position: 'fixed',
            top: `${top}px`,
            left: `${left}px`,
            zIndex: 50,
            opacity: 1,
            transition: 'opacity 0.2s',
            pointerEvents: 'none', // Keep it non-interactive
        });

    }, [ad, rect, portalRoot]);

    if (!portalRoot) return null;

    return createPortal(
        <div 
            ref={tooltipRef} 
            style={style}
            className="w-48 p-2 bg-gray-200 border-4 border-black text-black text-center text-xs relative"
        >
             <img src={ad.imageUrl} alt={ad.message} className="w-full object-cover border-2 border-black mb-2" />
             <p className="font-bold break-words" style={{ fontFamily: 'sans-serif, system-ui' }}>{ad.message}</p>
             <div className={arrowClasses}></div>
        </div>,
        portalRoot
    );
};


// --- Sub-components ---
interface PurchasedAdProps {
    ad: Ad;
    isAdmin: boolean;
    onDeleteAd: (adId: string) => void;
    onMouseEnter: (e: React.MouseEvent<HTMLDivElement>, ad: Ad) => void;
    onMouseLeave: () => void;
    isHovered: boolean;
}

const PurchasedAd: React.FC<PurchasedAdProps> = ({ ad, isAdmin, onDeleteAd, onMouseEnter, onMouseLeave, isHovered }) => {
    const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation(); // prevent other events from firing
        onDeleteAd(ad.id);
    }

    return (
        <div 
            className="relative group bg-black"
            style={getAdBoundingBox(ad)}
            onMouseEnter={(e) => onMouseEnter(e, ad)}
            onMouseLeave={onMouseLeave}
            aria-label={`Ad: ${ad.message}`}
        >
            <img
                src={ad.imageUrl}
                alt={ad.message}
                className="w-full h-full object-cover"
            />
            {isHovered && isAdmin && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 z-10">
                    <p className="text-white text-xs text-center truncate mb-2">{ad.message}</p>
                    <button 
                        onClick={handleDeleteClick}
                        className="bg-red-500 text-white border-2 border-b-4 border-black px-3 py-1 text-xs hover:bg-red-600 active:border-b-2 active:mt-0.5 transition-all"
                    >
                        Remove
                    </button>
                </div>
            )}
        </div>
    );
}

interface EmptyPlotProps {
    plotId: string;
    isSelected: boolean;
    onMouseDown: (plotId: string) => void;
    onMouseEnter: (plotId: string) => void;
}

const EmptyPlot: React.FC<EmptyPlotProps> = ({ plotId, isSelected, onMouseDown, onMouseEnter }) => {
    const baseClasses = 'relative z-10 w-full h-full transition-colors bg-gray-800 hover:bg-gray-700 cursor-pointer';
    const selectedClasses = 'outline outline-2 outline-green-400 outline-offset-[-2px]';

    return (
        <div
            onMouseDown={(e) => { e.preventDefault(); onMouseDown(plotId); }}
            onMouseEnter={() => onMouseEnter(plotId)}
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
    isAdmin: boolean;
    onDeleteAd: (adId: string) => void;
}

export function BillboardGrid({ ads, selectedPlots, setSelectedPlots, purchasedPlotIds, isAdmin, onDeleteAd }: BillboardGridProps) {
    const selectedPlotsSet = useMemo(() => new Set(selectedPlots), [selectedPlots]);
    const [tooltip, setTooltip] = useState<{ ad: Ad; rect: DOMRect } | null>(null);

    const [dragState, setDragState] = useState<{
        isMouseDown: boolean;
        hasDragged: boolean;
        startPlotId: string | null;
        initialSelection: string[];
    }>({
        isMouseDown: false,
        hasDragged: false,
        startPlotId: null,
        initialSelection: [],
    });

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (dragState.isMouseDown) {
                if (!dragState.hasDragged && dragState.startPlotId) {
                    const newSelectedPlots = new Set<string>(dragState.initialSelection);
                    if (newSelectedPlots.has(dragState.startPlotId)) {
                        newSelectedPlots.delete(dragState.startPlotId);
                    } else {
                        newSelectedPlots.add(dragState.startPlotId);
                    }
                    setSelectedPlots([...newSelectedPlots]);
                }
                setDragState({ isMouseDown: false, hasDragged: false, startPlotId: null, initialSelection: [] });
            }
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => {
            window.removeEventListener('mouseup', handleMouseUpGlobal);
        };
    }, [dragState, setSelectedPlots]);

    const handleMouseDown = useCallback((plotId: string) => {
        if (purchasedPlotIds.has(plotId)) return;
        setDragState({
            isMouseDown: true,
            hasDragged: false,
            startPlotId: plotId,
            initialSelection: selectedPlots,
        });
    }, [purchasedPlotIds, selectedPlots]);

    const handleMouseEnter = useCallback((plotId: string) => {
        if (!dragState.isMouseDown || !dragState.startPlotId) return;

        if (!dragState.hasDragged) {
            setDragState(prev => ({ ...prev, hasDragged: true }));
        }

        const [startRow, startCol] = parsePlotId(dragState.startPlotId);
        const [endRow, endCol] = parsePlotId(plotId);

        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);

        const newSelection: string[] = [];
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                const currentPlotId = `${r}-${c}`;
                if (purchasedPlotIds.has(currentPlotId)) {
                    return; 
                }
                newSelection.push(currentPlotId);
            }
        }
        setSelectedPlots(newSelection);
    }, [dragState, purchasedPlotIds, setSelectedPlots]);

    const adDataMap = useMemo(() => {
        const map = new Map<string, { ad: Ad; isTopLeft: boolean }>();
        ads.forEach(ad => {
            const topLeftPlotId = ad.plots[0];
            ad.plots.forEach(plotId => {
                map.set(plotId, { ad, isTopLeft: plotId === topLeftPlotId });
            });
        });
        return map;
    }, [ads]);
    
    const handleShowTooltip = useCallback((e: React.MouseEvent<HTMLDivElement>, ad: Ad) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({ ad, rect });
    }, []);

    const handleHideTooltip = useCallback(() => {
        setTooltip(null);
    }, []);

    return (
        <>
            <div 
                data-billboard-grid
                className="w-[95vw] md:w-[80vw] max-w-[1600px] aspect-[2/1] max-h-[calc(100vh-250px)] bg-gray-900 grid grid-cols-[repeat(28,minmax(0,1fr))] grid-rows-[repeat(14,minmax(0,1fr))] gap-px border-2 border-black overflow-hidden"
            >
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, index) => {
                    const row = Math.floor(index / GRID_COLS);
                    const col = index % GRID_COLS;
                    const plotId = `${row}-${col}`;
                    
                    const plotAdInfo = adDataMap.get(plotId);

                    if (plotAdInfo) {
                        if (plotAdInfo.isTopLeft) {
                            return (
                                <PurchasedAd 
                                    key={plotAdInfo.ad.id} 
                                    ad={plotAdInfo.ad}
                                    isAdmin={isAdmin}
                                    onDeleteAd={onDeleteAd}
                                    onMouseEnter={handleShowTooltip}
                                    onMouseLeave={handleHideTooltip}
                                    isHovered={tooltip?.ad.id === plotAdInfo.ad.id}
                                 />
                            );
                        }
                        return null;
                    } else {
                        return (
                            <EmptyPlot
                                key={plotId}
                                plotId={plotId}
                                isSelected={selectedPlotsSet.has(plotId)}
                                onMouseDown={handleMouseDown}
                                onMouseEnter={handleMouseEnter}
                            />
                        );
                    }
                })}
            </div>
            {tooltip && <AdTooltip ad={tooltip.ad} rect={tooltip.rect} />}
        </>
    );
}