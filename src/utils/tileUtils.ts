
import type { Tile } from '../types';

export const findTileById = (tiles: Tile[], id: string): Tile | null => {
    for (const tile of tiles) {
        if (tile.id === id) return tile;
        if (tile.children && tile.children.length > 0) {
            const found = findTileById(tile.children, id);
            if (found) return found;
        }
    }
    return null;
};

export const findAndUpdateTile = (tiles: Tile[], tileId: string, updateFn: (tile: Tile) => Tile): Tile[] => {
    return tiles.map(tile => {
        if (tile.id === tileId) return updateFn(tile);
        if (tile.children && tile.children.length > 0) {
            return { ...tile, children: findAndUpdateTile(tile.children, tileId, updateFn) };
        }
        return tile;
    });
};

export const findAndAddChildTile = (tiles: Tile[], parentId: string, newTile: Tile): Tile[] => {
    return tiles.map(tile => {
        if (tile.id === parentId) {
            return { ...tile, children: [...(tile.children || []), newTile] };
        }
        if (tile.children && tile.children.length > 0) {
            return { ...tile, children: findAndAddChildTile(tile.children, parentId, newTile) };
        }
        return tile;
    });
};

export const findPathToTile = (tiles: Tile[], id: string, currentPath: string[] = []): string[] | null => {
    for (const tile of tiles) {
        const newPath = [...currentPath, tile.id];
        if (tile.id === id) {
            return newPath;
        }
        if (tile.children && tile.children.length > 0) {
            const foundPath = findPathToTile(tile.children, id, newPath);
            if (foundPath) return foundPath;
        }
    }
    return null;
}
