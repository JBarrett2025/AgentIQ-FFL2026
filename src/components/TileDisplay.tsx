import React, { useState, useRef, useEffect } from 'react';
import type { Tile } from '../types';
import { FolderIcon, NextArrowIcon } from './icons';
import { darkenColor } from '../utils/colors';

interface TileDisplayProps {
    tile: Tile;
    translations: import('../types').TranslationDictionary;
    onEdit: (tile: Tile) => void;
    onDelete: (tileId: string, parentId: string | null) => void;
    onAddChild: (parentId: string) => void;
    onReorder: (draggedId: string, droppedOnId: string) => void;
    parentId: string | null;
    onNavigateToChildren: (tileId: string) => void;
    onNavigateToTile: (tileId: string) => void;
    onPlayVideo: (url: string) => void;
    isBuilderMode: boolean;
    isSelectedParent: boolean;
    isHighlighted?: boolean;
    onHighlightComplete?: () => void;
    currentLanguage?: 'en' | 'es';
}

const TileDisplay: React.FC<TileDisplayProps> = ({ tile, translations, onEdit, onDelete, onAddChild, onReorder, parentId, onNavigateToChildren, onNavigateToTile, onPlayVideo, isBuilderMode, isSelectedParent, isHighlighted, onHighlightComplete, currentLanguage = 'en' }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const dragCounter = useRef(0);
    const tileRef = useRef<HTMLDivElement>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isHighlighted && tileRef.current) {
            tileRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

            const scrollTimeout = setTimeout(() => {
                setIsAnimating(true);

                const animationTimeout = setTimeout(() => {
                    setIsAnimating(false);
                    if (onHighlightComplete) {
                        onHighlightComplete();
                    }
                }, 7500);

                return () => clearTimeout(animationTimeout);
            }, 300);

            return () => clearTimeout(scrollTimeout);
        }
    }, [isHighlighted, onHighlightComplete]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        e.dataTransfer.setData('tileId', tile.id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            (e.target as HTMLDivElement).classList.add('opacity-50');
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        (e.target as HTMLDivElement).classList.remove('opacity-50');
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        e.preventDefault();
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        e.preventDefault();
        dragCounter.current++;
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (!isBuilderMode) return;
        e.preventDefault();
        setIsDragOver(false);
        dragCounter.current = 0;
        const draggedTileId = e.dataTransfer.getData('tileId');
        if (draggedTileId && draggedTileId !== tile.id) {
            onReorder(draggedTileId, tile.id);
        }
    };


    const getFontColorForBackground = (hexColor: string): string => {
        if (!hexColor) return '#333333';
        const hex = hexColor.replace('#', '');
        if (hex.length !== 6) return '#333333';
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luminance > 160 ? '#333333' : '#FFFFFF';
    };

    // Heuristic to identify simple, button-like tiles that should be square on mobile
    const tileDescription = translations[tile.descriptionKey]?.en || '';
    const isSimpleButtonTile =
        tile.logoUrl &&
        !tile.useLogoAsBackground &&
        (!tileDescription || !tile.isVisible.description) &&
        (!tile.overviewVideo || !tile.isVisible.overviewVideo) &&
        (!tile.trainingVideos?.length || !tile.isVisible.trainingVideos);


    const dynamicTextColor = getFontColorForBackground(tile.color);

    const badgeStyle: React.CSSProperties = {};
    if (tile.isVisible.color) {
        badgeStyle.color = dynamicTextColor;
        if (dynamicTextColor === '#FFFFFF') {
            badgeStyle.backgroundColor = 'rgba(0, 0, 0, 0.25)';
        } else {
            badgeStyle.backgroundColor = 'rgba(255, 255, 255, 0.5)';
        }
    }

    const renderContent = (key: keyof Tile | 'description', value: any) => {
        if (!tile.isVisible[key as keyof typeof tile.isVisible]) return null;

        const labelColor = tile.isVisible.color ? dynamicTextColor : '#374151';

        switch (key) {
            case 'description':
                return <p className="text-lg mt-2 text-center" style={{ color: tile.isVisible.color ? dynamicTextColor : '#4B5563' }}>{value}</p>;
            case 'overviewVideo':
                return value && (
                    <div className="mt-4 text-center">
                        <button onClick={(e) => { e.stopPropagation(); onPlayVideo(value); }} className="inline-block relative group" aria-label="Play overview video">
                            <img src={tile.thumbnailUrl || "https://picsum.photos/120/80?grayscale"} alt="Overview Video Thumbnail" className="rounded-md shadow-md group-hover:shadow-lg transition-shadow" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                            </div>
                        </button>
                    </div>
                );
            case 'trainingVideos':
                return value && value.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold text-lg mb-2 text-left" style={{ color: labelColor }}>{currentLanguage === 'es' ? 'Videos de Entrenamiento:' : 'Training Videos:'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {value.map((video: { url: string, thumbnailUrl: string }, i: number) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); onPlayVideo(video.url); }} className="inline-block text-center relative group" aria-label={`Play training video ${i + 1}`}>
                                    <img src={video.thumbnailUrl || `https://picsum.photos/100/60?grayscale&random=${i}`} alt={`Training Video Thumbnail ${i + 1}`} className="rounded-md shadow-sm group-hover:shadow-md transition-shadow w-full" />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'documentation':
                return value && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <h4 className="font-semibold text-lg mb-2 text-left" style={{ color: labelColor }}>{currentLanguage === 'es' ? 'Documentación:' : 'Documentation:'}</h4>
                        <a href={value} target="_blank" rel="noopener noreferrer" className="inline-block p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <FolderIcon />
                        </a>
                    </div>
                );
            case 'links':
                return value && value.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <h4 className="font-semibold text-lg mb-2 text-left" style={{ color: labelColor }}>{currentLanguage === 'es' ? 'Enlaces:' : 'Links:'}</h4>
                        <div className="flex flex-wrap gap-2">
                            {value.map((link: { name: string, url: string }, i: number) => (
                                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-lg text-center transition-colors shadow">
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </div>
                );
            case 'resources':
                return value && value.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <h4 className="font-semibold text-lg mb-2 text-left" style={{ color: labelColor }}>{currentLanguage === 'es' ? 'Recursos:' : 'Resources:'}</h4>
                        <div className="flex flex-wrap gap-2">
                            {value.map((resource: { name: string, url: string }, i: number) => (
                                <a key={i} href={resource.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-lg text-center transition-colors shadow">
                                    {resource.name}
                                </a>
                            ))}
                        </div>
                    </div>
                );
            case 'internalLinks':
                return value && value.length > 0 && (
                    <div className="mt-4 pt-2 border-t border-gray-200">
                        <h4 className="font-semibold text-lg mb-2 text-left" style={{ color: labelColor }}>{currentLanguage === 'es' ? 'Enlaces Internos:' : 'Internal Links:'}</h4>
                        <div className="flex flex-wrap gap-2">
                            {value.map((link: { name: string, targetTileId: string }, i: number) => (
                                <button key={i} onClick={(e) => { e.stopPropagation(); onNavigateToTile(link.targetTileId); }} className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-lg text-center transition-colors shadow">
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const useLogoBg = tile.useLogoAsBackground && tile.logoUrl;

    const tileStyle: React.CSSProperties = {
        fontFamily: tile.isVisible.font ? (tile.font + ', sans-serif') : 'inherit',
        backgroundColor: tile.isVisible.color ? tile.color : '#FFFFFF',
    };

    if (useLogoBg) {
        tileStyle.backgroundImage = `url('${tile.logoUrl}')`;
        tileStyle.backgroundSize = 'contain';
        tileStyle.backgroundPosition = 'center center';
        tileStyle.backgroundRepeat = 'no-repeat';
    }

    const borderColor = tile.isVisible.color ? darkenColor(tile.color, 15) : '#E5E7EB';
    const currentBorderColor = isSelectedParent ? '#3B82F6' : borderColor;
    const currentBorderWidth = isSelectedParent ? '8px' : '6px';
    const dynamicBorderStyle = { border: `${currentBorderWidth} solid ${currentBorderColor}` };

    let heightAspectClass = 'sm:min-h-[450px]'; // Default
    if (useLogoBg) {
        heightAspectClass = 'aspect-square';
    } else if (isSimpleButtonTile) {
        heightAspectClass = 'aspect-square sm:aspect-auto';
    }

    const tileClasses = [
        "rounded-lg shadow-lg flex flex-col relative transition-all duration-150 w-full",
        heightAspectClass,
        isSimpleButtonTile ? "" : "justify-between",
        isBuilderMode ? "cursor-grab" : "cursor-pointer hover:scale-105",
        isDragOver ? "ring-4 ring-blue-400 ring-offset-2" : "",
        isAnimating ? "tile-highlight-pulse" : "",
    ].join(' ');


    return (
        <div
            ref={tileRef}
            className={tileClasses}
            style={{ ...tileStyle, ...dynamicBorderStyle }}
            draggable={isBuilderMode}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {tile.workflow?.nextTileId && tile.isVisible.workflow && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTile(tile.workflow!.nextTileId!);
                    }}
                    className="absolute top-2 right-2 z-30 p-2 bg-white/70 backdrop-blur-sm rounded-full text-blue-600 hover:bg-white hover:text-blue-800 shadow-md transition-all"
                    aria-label="Go to next tile"
                >
                    <NextArrowIcon className="h-5 w-5" />
                </button>
            )}
            <div className={`relative z-20 flex flex-col flex-grow ${useLogoBg ? 'p-12' : 'p-4'}`}>
                <div
                    className={`flex-grow ${isSimpleButtonTile ? 'flex flex-col items-center justify-center text-center' : ''}`}
                    onClick={() => { if (tile.children && tile.children.length > 0) onNavigateToChildren(tile.id); }}
                >
                    {tile.isVisible.logo && tile.logoUrl && !tile.useLogoAsBackground && (
                        <div className="mb-4 text-center h-40 flex items-center justify-center">
                            <img src={tile.logoUrl} alt={`${translations[tile.nameKey]?.en ?? ''} Logo`} className="max-h-40 mx-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    )}
                    <div className="flex justify-center items-center mb-2 gap-2">
                        {tile.isVisible.name && !useLogoBg && (
                            <h3 className="text-3xl font-semibold text-center" style={{ color: tile.isVisible.color ? dynamicTextColor : '#333333' }}>
                                {translations[tile.nameKey]?.[currentLanguage] ?? translations[tile.nameKey]?.en ?? ''}
                            </h3>
                        )}
                        {isBuilderMode && tile.children && tile.children.length > 0 && (
                            <span
                                className={`text-lg font-semibold px-2 py-1 rounded-full ${!tile.isVisible.color ? 'bg-blue-100 text-blue-800' : ''}`}
                                style={tile.isVisible.color ? badgeStyle : {}}
                                aria-label={`${tile.children.length} child items`}
                            >
                                {tile.children.length}
                            </span>
                        )}
                    </div>

                    {!useLogoBg && renderContent('description' as keyof Tile, translations[tile.descriptionKey]?.en || '')}
                    {renderContent('overviewVideo', tile.overviewVideo)}
                    {renderContent('trainingVideos', tile.trainingVideos)}
                    {renderContent('documentation', tile.documentation)}
                    {renderContent('links', tile.links)}
                    {renderContent('resources', tile.resources)}
                    {renderContent('internalLinks', tile.internalLinks)}
                </div>

                {isBuilderMode && (
                    <div className="flex justify-end space-x-2 mt-4 pt-2 border-t border-gray-100 border-opacity-50 z-20">
                        <button onClick={() => onAddChild(tile.id)} className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200" aria-label="Add Child"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
                        <button onClick={() => onEdit(tile)} className="p-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200" aria-label="Edit"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" /></svg></button>
                        <button onClick={() => onDelete(tile.id, parentId)} className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 2a1 1 0 100 2h-4a1 1 0 100-2h4z" clipRule="evenodd" /></svg></button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TileDisplay;