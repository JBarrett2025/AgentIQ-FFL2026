
import React from 'react';
import type { Tile } from '../types';

interface TilePickerNodeProps {
  tile: Tile;
  onSelect: (tile: Tile) => void;
  level?: number;
}

const TilePickerNode: React.FC<TilePickerNodeProps> = ({ tile, onSelect, level = 0 }) => {
  return (
    <div>
      <div 
        onClick={() => onSelect(tile)}
        className="p-2 hover:bg-blue-100 cursor-pointer rounded transition-colors duration-150"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <span className="text-gray-800">{tile.name}</span>
        {tile.children && tile.children.length > 0 && <span className="text-gray-500 text-sm ml-2">({tile.children.length})</span>}
      </div>
      {tile.children && tile.children.length > 0 && (
        <div>
          {tile.children.map(child => (
            <TilePickerNode key={child.id} tile={child} onSelect={onSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface TilePickerProps {
    tiles: Tile[];
    onClose: () => void;
    onSelect: (tile: Tile) => void;
}

const TilePicker: React.FC<TilePickerProps> = ({ tiles, onClose, onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[70vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">Select a Tile to Link To</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold">&times;</button>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {tiles.map(tile => (
                        <TilePickerNode key={tile.id} tile={tile} onSelect={onSelect} />
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
