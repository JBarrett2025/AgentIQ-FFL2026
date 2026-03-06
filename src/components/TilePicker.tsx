
import React from 'react';
import type { Tile } from '../types';

interface TilePickerNodeProps {
  tile: Tile;
  translations: import('../types').TranslationDictionary;
  onSelect: (tile: Tile) => void;
  level?: number;
}

const TilePickerNode: React.FC<TilePickerNodeProps> = ({ tile, translations, onSelect, level = 0 }) => {
  return (
    <div>
      <div
        onClick={() => onSelect(tile)}
        className="p-2 hover:bg-blue-100 cursor-pointer rounded transition-colors duration-150 flex items-center justify-between"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <div>
          <span className="text-gray-800 font-medium">{tile.internalName || translations[tile.nameKey]?.en || 'Tile'}</span>
          {tile.internalName && translations[tile.nameKey]?.en && (
            <span className="text-gray-400 text-sm ml-2 italic">({translations[tile.nameKey]?.en})</span>
          )}
        </div>
        {tile.children && tile.children.length > 0 && <span className="text-gray-500 text-sm ml-2">({tile.children.length} children)</span>}
      </div>
      {tile.children && tile.children.length > 0 && (
        <div>
          {tile.children.map(child => (
            <TilePickerNode key={child.id} tile={child} translations={translations} onSelect={onSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface TilePickerProps {
  tiles: Tile[];
  translations: import('../types').TranslationDictionary;
  onClose: () => void;
  onSelect: (tile: Tile) => void;
}

const TilePicker: React.FC<TilePickerProps> = ({ tiles, translations, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-800">Select a Tile to Link To</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold">&times;</button>
        </div>
        <div className="overflow-y-auto flex-grow">
          {tiles.map(tile => (
            <TilePickerNode key={tile.id} tile={tile} translations={translations} onSelect={onSelect} />
          ))}
        </div>
        <div className="mt-6 flex justify-end border-t pt-4">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default TilePicker;
