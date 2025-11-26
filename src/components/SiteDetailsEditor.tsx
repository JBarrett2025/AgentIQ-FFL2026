
import React, { useState } from 'react';
import type { SiteData, Tile } from '../types';
import { findTileById } from '../utils/tileUtils';

interface SiteDetailsEditorProps {
    currentSiteData: SiteData;
    onClose: () => void;
    onSave: (details: Pick<SiteData, 'siteName' | 'headerContent' | 'footerContent' | 'helpTileId'>) => void;
    isNewSiteFlow: boolean;
    onShowTilePicker: (onSelect: (tile: Tile) => void) => void;
}

const SiteDetailsEditor: React.FC<SiteDetailsEditorProps> = ({ currentSiteData, onClose, onSave, isNewSiteFlow, onShowTilePicker }) => {
    const [siteName, setSiteName] = useState(currentSiteData.siteName);
    const [headerContent, setHeaderContent] = useState(currentSiteData.headerContent);
    const [footerContent, setFooterContent] = useState(currentSiteData.footerContent);
    const [helpTileId, setHelpTileId] = useState(currentSiteData.helpTileId);

    const handleSaveClick = () => {
        if (siteName.trim()) {
            onSave({ siteName: siteName.trim(), headerContent, footerContent, helpTileId });
        } else {
            alert("Site name cannot be empty.");
        }
    };

    const handleChooseHelpTile = () => {
        onShowTilePicker((tile) => {
            setHelpTileId(tile.id);
        });
    };

    const handleClearHelpTile = () => {
        setHelpTileId(undefined);
    };
    
    const helpTile = helpTileId ? findTileById(currentSiteData.tiles, helpTileId) : null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">{isNewSiteFlow ? "Create New Site" : "Edit Site Details"}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold">&times;</button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="site-name-input" className="block text-sm font-medium text-gray-700 mb-1">Site Name:</label>
                        <input id="site-name-input" type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="header-content-textarea" className="block text-sm font-medium text-gray-700 mb-1">Header HTML Content:</label>
                        <textarea id="header-content-textarea" value={headerContent} onChange={(e) => setHeaderContent(e.target.value)} rows={6} className="w-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm" />
                    </div>
                    <div>
                        <label htmlFor="footer-content-textarea" className="block text-sm font-medium text-gray-700 mb-1">Footer HTML Content:</label>
                        <textarea id="footer-content-textarea" value={footerContent} onChange={(e) => setFooterContent(e.target.value)} rows={4} className="w-full p-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm" />
                    </div>
                    <div className="p-4 bg-gray-50 rounded-md border">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800">Global Help Link</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Link a global "Help" button in the deployed site's header to a specific tile.
                        </p>
                        <div className="flex items-center space-x-3">
                             <button onClick={handleChooseHelpTile} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold">Choose Help Tile</button>
                             {helpTileId && (
                                <button onClick={handleClearHelpTile} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold">Clear</button>
                             )}
                        </div>
                        {helpTile ? (
                            <p className="text-sm text-green-700 mt-3">
                                Currently linked to: <span className="font-semibold">{helpTile.name}</span>
                            </p>
                        ) : (
                            <p className="text-sm text-gray-500 mt-3">No help tile selected. The help button will not be shown.</p>
                        )}
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
                    <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={handleSaveClick} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">{isNewSiteFlow ? "Create Site" : "Save Details"}</button>
                </div>
            </div>
        </div>
    );
};

export default SiteDetailsEditor;