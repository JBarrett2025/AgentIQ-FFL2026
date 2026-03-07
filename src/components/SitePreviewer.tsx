
import React from 'react';
import type { SiteData, Tile } from '../types';
import TileDisplay from './TileDisplay';

interface SitePreviewerProps {
    siteData: SiteData;
    currentPath: string[];
    onNavigateToChildren: (tileId: string) => void;
    onNavigateToTile: (tileId: string) => void;
    findTileById: (id: string) => Tile | null;
    onPlayVideo: (url: string) => void;
    highlightedTileId: string | null;
    onHighlightComplete: () => void;
    currentLanguage?: 'en' | 'es';
}

const SitePreviewer: React.FC<SitePreviewerProps> = ({ siteData, currentPath, onNavigateToChildren, findTileById, onNavigateToTile, onPlayVideo, highlightedTileId, onHighlightComplete, currentLanguage = 'en' }) => {

    const getTilesToDisplay = () => {
        if (currentPath.length === 0) {
            return siteData.tiles;
        }
        let currentParent = siteData.tiles;
        for (const id of currentPath) {
            const foundTile = findTileById(id);
            if (foundTile && foundTile.children) {
                currentParent = foundTile.children;
            } else {
                return siteData.tiles; // Fallback to root if path is broken
            }
        }
        return currentParent;
    };

    const tilesToDisplay = getTilesToDisplay();

    return (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tilesToDisplay.length === 0 ? (
                <p className="text-gray-600 text-center text-lg p-8 bg-white rounded-lg shadow-md col-span-full">No tiles at this level.</p>
            ) : (
                tilesToDisplay.map((tile) => (
                    <TileDisplay
                        key={tile.id}
                        tile={tile}
                        translations={siteData.translations}
                        onEdit={() => { }}
                        onDelete={() => { }}
                        onAddChild={() => { }}
                        onReorder={() => { }}
                        parentId={null}
                        onNavigateToChildren={onNavigateToChildren}
                        onNavigateToTile={onNavigateToTile}
                        onPlayVideo={onPlayVideo}
                        isBuilderMode={false}
                        isSelectedParent={currentPath.length > 0 && currentPath[currentPath.length - 1] === tile.id}
                        isHighlighted={tile.id === highlightedTileId}
                        onHighlightComplete={onHighlightComplete}
                        currentLanguage={currentLanguage}
                    />
                ))
            )}
        </div>
    );
};

export default SitePreviewer;