import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { SiteData, Tile, Template, TranslationDictionary } from './types';
import { defaultSiteProperties, defaultTileProperties } from './constants';
import { generateUniqueId } from './utils/id';
import { findTileById, findAndUpdateTile, findAndAddChildTile, findPathToTile } from './utils/tileUtils';
import { generateDeploymentHtml, generateComponentJavaScript } from './utils/deployment';
import { getEmbedUrl } from './utils/videoUtils';
import TileDisplay from './components/TileDisplay';
import TileEditor from './components/TileEditor';
import SiteDetailsEditor from './components/SiteDetailsEditor';
import SitePreviewer from './components/SitePreviewer';
import TilePicker from './components/TilePicker';
import ConfirmationModal from './components/ConfirmationModal';
import PromptModal from './components/PromptModal';
import DOMPurify from 'dompurify';
import VideoPlayer from './components/VideoPlayer';
import { PreviousArrowIcon, HomeIcon } from './components/icons';

const LOCAL_STORAGE_KEY = 'nestedSiteBuilderData_v2';

/**
 * Sanitizes an HTML string using DOMPurify to prevent XSS attacks.
 * It's fail-closed: if DOMPurify is not available, it returns an empty string.
 * @param dirty The potentially unsafe HTML string.
 * @returns A sanitized HTML string, or an empty string if sanitization fails.
 */
const sanitizeHTML = (dirty: string): string => {
    return DOMPurify.sanitize(dirty);
};


const App: React.FC = () => {
    const [siteData, setSiteData] = useState<SiteData>(defaultSiteProperties);
    const [editingTile, setEditingTile] = useState<Tile | null>(null);
    const [isEditingSiteDetails, setIsEditingSiteDetails] = useState(false);
    const [isNewSiteFlowActive, setIsNewSiteFlowActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPath, setCurrentPath] = useState<string[]>([]);
    const [navigationHistory, setNavigationHistory] = useState<string[][]>([[]]);
    const [isViewingPreview, setIsViewingPreview] = useState(false);
    const [isTilePickerVisible, setIsTilePickerVisible] = useState(false);
    const [tilePickerCallback, setTilePickerCallback] = useState<((tile: Tile) => void) | null>(null);
    const [highlightedTileId, setHighlightedTileId] = useState<string | null>(null);
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);


    const [confirmationState, setConfirmationState] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDanger?: boolean;
    } | null>(null);
    const [promptState, setPromptState] = useState<{
        isOpen: boolean;
        title: string;
        label: string;
        onConfirm: (value: string) => void;
        defaultValue?: string;
    } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);

                const ensureVisibility = (tiles: any[]): Tile[] => {
                    return tiles.map(tile => {
                        const { borderColor, ...restOfTile } = tile;
                        const { borderColor: vBorderColor, ...restOfVisibility } = (tile.isVisible || {});
                        return {
                            ...restOfTile,
                            isVisible: { ...defaultTileProperties.isVisible, ...restOfVisibility },
                            children: tile.children ? ensureVisibility(tile.children) : []
                        };
                    });
                };

                const ensuredTemplates = (parsedData.templates || []).map((template: any) => {
                    const { borderColor, ...restOfProps } = template.properties;
                    const { borderColor: vBorderColor, ...restOfVisibility } = (template.properties.isVisible || {});
                    return {
                        ...template,
                        properties: {
                            ...restOfProps,
                            isVisible: { ...defaultTileProperties.isVisible, ...restOfVisibility }
                        }
                    }
                });

                setSiteData({
                    siteNameKey: parsedData.siteNameKey || defaultSiteProperties.siteNameKey,
                    headerContentKey: parsedData.headerContentKey || defaultSiteProperties.headerContentKey,
                    footerContentKey: parsedData.footerContentKey || defaultSiteProperties.footerContentKey,
                    translations: parsedData.translations || defaultSiteProperties.translations,
                    tiles: ensureVisibility(parsedData.tiles || []),
                    templates: ensuredTemplates,
                    helpTileId: parsedData.helpTileId
                });
            } else {
                setSiteData(defaultSiteProperties);
            }
        } catch (e) {
            console.error("Error loading data from localStorage:", e);
            setError("Failed to load saved data. Data might be corrupted.");
            setSiteData(defaultSiteProperties);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveSiteData = useCallback((dataToSave: SiteData) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
            setError("Failed to save data. Local storage might be full or inaccessible.");
        }
    }, []);

    const updateAndSaveSiteData = useCallback((newData: Partial<SiteData>) => {
        setSiteData(prevSiteData => {
            const updatedSiteData = { ...prevSiteData, ...newData };
            saveSiteData(updatedSiteData);
            return updatedSiteData;
        });
    }, [saveSiteData]);

    const showConfirmation = (title: string, message: string, onConfirm: () => void, isDanger: boolean = false) => {
        setConfirmationState({
            isOpen: true,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmationState(null);
            },
            isDanger,
        });
    };

    const handleCancelConfirmation = () => {
        setConfirmationState(null);
    };

    const showPrompt = (title: string, label: string, onConfirm: (value: string) => void, defaultValue: string = '') => {
        setPromptState({
            isOpen: true,
            title,
            label,
            onConfirm: (value: string) => {
                onConfirm(value);
                setPromptState(null);
            },
            defaultValue
        });
    };

    const handleCancelPrompt = () => {
        setPromptState(null);
    };


    const handleNavigateToChildren = useCallback((tileId: string) => {
        const newPath = [...currentPath, tileId];
        setCurrentPath(newPath);
        setNavigationHistory(prev => [...prev, newPath]);
    }, [currentPath]);

    const handleAddTileToCurrentLevel = useCallback((templateProperties: Partial<Tile> = {}) => {
        const uniqueSuffix = Date.now().toString();
        const newNameKey = templateProperties.nameKey || `new_tile_name_${uniqueSuffix}`;
        const newDescKey = templateProperties.descriptionKey || `new_tile_desc_${uniqueSuffix}`;

        const newTile: Tile = {
            id: generateUniqueId(),
            ...defaultTileProperties,
            ...templateProperties,
            nameKey: newNameKey,
            descriptionKey: newDescKey,
            children: [],
            isVisible: {
                ...defaultTileProperties.isVisible,
                ...(templateProperties.isVisible || {})
            }
        };

        const newTranslations = {
            [newNameKey]: { en: 'New Tile', es: 'Nuevo Mosaico' },
            [newDescKey]: { en: 'A brief description for this tile.', es: 'Una breve descripción para este mosaico.' }
        };

        let updatedTiles;
        if (currentPath.length > 0) {
            const currentParentId = currentPath[currentPath.length - 1];
            updatedTiles = findAndAddChildTile(siteData.tiles, currentParentId, newTile);
        } else {
            updatedTiles = [...siteData.tiles, newTile];
        }
        updateAndSaveSiteData({
            tiles: updatedTiles,
            translations: { ...siteData.translations, ...newTranslations }
        });
    }, [currentPath, siteData.tiles, siteData.translations, updateAndSaveSiteData]);

    const handleAddChildTile = useCallback((parentId: string) => {
        const uniqueSuffix = Date.now().toString();
        const newNameKey = `new_child_tile_name_${uniqueSuffix}`;
        const newDescKey = `new_child_tile_desc_${uniqueSuffix}`;

        const newTile: Tile = {
            id: generateUniqueId(),
            ...defaultTileProperties,
            nameKey: newNameKey,
            descriptionKey: newDescKey,
            children: [],
            isVisible: { ...defaultTileProperties.isVisible }
        };

        const newTranslations = {
            [newNameKey]: { en: 'New Child Tile', es: 'Nuevo Mosaico Secundario' },
            [newDescKey]: { en: 'A brief description for this child tile.', es: 'Una breve descripción para este mosaico secundario.' }
        };

        const updatedTiles = findAndAddChildTile(siteData.tiles, parentId, newTile);
        updateAndSaveSiteData({
            tiles: updatedTiles,
            translations: { ...siteData.translations, ...newTranslations }
        });
    }, [siteData.tiles, siteData.translations, updateAndSaveSiteData]);

    const handleDeleteTile = useCallback((tileId: string, parentId: string | null) => {
        showConfirmation(
            'Delete Tile',
            'Are you sure you want to delete this tile and all its children? This action cannot be undone.',
            () => {
                let updatedTiles;
                if (parentId) {
                    updatedTiles = findAndUpdateTile(siteData.tiles, parentId, (parentTile) => ({
                        ...parentTile,
                        children: parentTile.children.filter(child => child.id !== tileId)
                    }));
                } else {
                    updatedTiles = siteData.tiles.filter(tile => tile.id !== tileId);
                }
                updateAndSaveSiteData({ tiles: updatedTiles });
            },
            true
        );
    }, [siteData.tiles, updateAndSaveSiteData]);

    const handleEditTile = useCallback((tile: Tile) => {
        const tileWithFullVisibility = {
            ...tile,
            isVisible: {
                ...defaultTileProperties.isVisible,
                ...(tile.isVisible || {})
            }
        };
        setEditingTile(tileWithFullVisibility);
    }, []);

    const handleSaveEditedTile = useCallback((updatedTile: Tile, updatedTranslations?: TranslationDictionary) => {
        setSiteData(prev => {
            const updatedTiles = findAndUpdateTile(prev.tiles, updatedTile.id, () => updatedTile);
            const newSiteData = { ...prev, tiles: updatedTiles, translations: updatedTranslations || prev.translations };
            saveSiteData(newSiteData);
            return newSiteData;
        });
        setEditingTile(null);
    }, [saveSiteData]);

    const handleReorderTiles = useCallback((draggedId: string, droppedOnId: string) => {
        const reorder = (list: Tile[]): Tile[] => {
            const draggedIndex = list.findIndex(t => t.id === draggedId);
            const targetIndex = list.findIndex(t => t.id === droppedOnId);

            if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
                return list;
            }

            const newList = [...list];
            const [draggedItem] = newList.splice(draggedIndex, 1);
            newList.splice(targetIndex, 0, draggedItem);
            return newList;
        };

        const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

        if (parentId) {
            const updatedTiles = findAndUpdateTile(siteData.tiles, parentId, (parentTile) => ({
                ...parentTile,
                children: reorder(parentTile.children),
            }));
            updateAndSaveSiteData({ tiles: updatedTiles });
        } else {
            const updatedTiles = reorder(siteData.tiles);
            updateAndSaveSiteData({ tiles: updatedTiles });
        }
    }, [currentPath, siteData.tiles, updateAndSaveSiteData]);

    const handleSaveAsTemplate = useCallback((tileToTemplate: Tile) => {
        showPrompt(
            'Save as New Template',
            'Template Name:',
            (templateName) => {
                const { id, children, ...properties } = tileToTemplate;
                const newTemplate: Template = {
                    templateId: generateUniqueId(),
                    name: templateName,
                    properties,
                };
                updateAndSaveSiteData({ templates: [...siteData.templates, newTemplate] });
            },
            (`${tileToTemplate.nameKey} Template`)
        );
    }, [siteData.templates, updateAndSaveSiteData]);


    const handleDeleteTemplate = useCallback((templateId: string) => {
        showConfirmation(
            'Delete Template',
            'Are you sure you want to delete this template?',
            () => {
                const updatedTemplates = siteData.templates.filter(t => t.templateId !== templateId);
                updateAndSaveSiteData({ templates: updatedTemplates });
            },
            true
        );
    }, [siteData.templates, updateAndSaveSiteData]);

    const handleAddTileToCurrentLevelFromTemplate = useCallback((templateId: string) => {
        const template = siteData.templates.find(t => t.templateId === templateId);
        if (template) {
            handleAddTileToCurrentLevel({ ...template.properties } as Partial<Tile>);
        }
    }, [siteData.templates, handleAddTileToCurrentLevel]);

    const handleGoToPrevious = useCallback(() => {
        if (navigationHistory.length <= 1) return;
        const newHistory = navigationHistory.slice(0, -1);
        setNavigationHistory(newHistory);
        setCurrentPath(newHistory[newHistory.length - 1] || []);
    }, [navigationHistory]);

    const handleNavigateHome = useCallback(() => {
        setCurrentPath([]);
        setNavigationHistory(prev => [...prev, []]);
    }, []);

    const handleNavigateToTile = useCallback((tileId: string) => {
        const path = findPathToTile(siteData.tiles, tileId);
        if (path) {
            const parentPath = path.slice(0, -1);
            setCurrentPath(parentPath);
            setNavigationHistory(prev => [...prev, parentPath]);
            setHighlightedTileId(tileId);
        } else {
            console.warn(`Could not find path for tileId: ${tileId}`);
            alert(`Error: The linked tile with ID ${tileId} could not be found.`);
        }
    }, [siteData.tiles]);

    const handleHighlightComplete = useCallback(() => {
        setHighlightedTileId(null);
    }, []);

    const getTilesToDisplay = useCallback(() => {
        if (currentPath.length === 0) {
            return siteData.tiles;
        } else {
            let currentParent = siteData.tiles;
            for (const id of currentPath) {
                const foundTile = findTileById(currentParent, id);
                if (foundTile && foundTile.children) {
                    currentParent = foundTile.children;
                } else {
                    setCurrentPath([]);
                    setNavigationHistory([[]]);
                    return siteData.tiles;
                }
            }
            return currentParent;
        }
    }, [currentPath, siteData.tiles]);

    const handleNewSite = useCallback(() => {
        showConfirmation(
            "Create New Site",
            "This will erase all current work.\n\nTo save your current site, please use the 'Save JSON' button first.",
            () => {
                const newSiteData = { ...defaultSiteProperties };
                setSiteData(newSiteData);
                saveSiteData(newSiteData);

                setCurrentPath([]);
                setNavigationHistory([[]]);
                setIsViewingPreview(false);

                setIsNewSiteFlowActive(true);
                setIsEditingSiteDetails(true);
            },
            true
        );
    }, [saveSiteData]);

    const handleOpenEditSiteDetailsModal = useCallback(() => {
        setIsNewSiteFlowActive(false);
        setIsEditingSiteDetails(true);
    }, []);

    const handleSaveSiteDetails = useCallback((details: Pick<SiteData, 'helpTileId'> & { siteNameEn: string, siteNameEs: string, headerContentEn: string, headerContentEs: string, footerContentEn: string, footerContentEs: string }) => {
        setSiteData(prev => {
            const newTranslations = { ...prev.translations };
            newTranslations[prev.siteNameKey] = { ...newTranslations[prev.siteNameKey], en: details.siteNameEn, es: details.siteNameEs || newTranslations[prev.siteNameKey]?.es || '' };
            newTranslations[prev.headerContentKey] = { ...newTranslations[prev.headerContentKey], en: details.headerContentEn, es: details.headerContentEs || newTranslations[prev.headerContentKey]?.es || '' };
            newTranslations[prev.footerContentKey] = { ...newTranslations[prev.footerContentKey], en: details.footerContentEn, es: details.footerContentEs || newTranslations[prev.footerContentKey]?.es || '' };

            const updatedSiteData = {
                ...prev,
                translations: newTranslations,
                helpTileId: details.helpTileId,
            };
            saveSiteData(updatedSiteData);
            return updatedSiteData;
        });
        setIsEditingSiteDetails(false);
        setIsNewSiteFlowActive(false);
    }, [saveSiteData]);

    const handleImportSiteFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target?.result as string);
                if (importedData.tiles && Array.isArray(importedData.tiles)) {
                    showConfirmation(
                        "Import Site Data",
                        "Importing this file will overwrite your current site data. Continue?",
                        () => {
                            const sanitizeTiles = (tiles: any[], dict: TranslationDictionary): Tile[] => {
                                return tiles.map(tile => {
                                    const { borderColor, ...restOfTile } = tile;
                                    const { borderColor: vBorderColor, ...restOfVisibility } = (tile.isVisible || {});

                                    // MIGRATION SCRIPT: Fix 'default_tile_name' collisions from Phase 1 bug
                                    let safeNameKey = tile.nameKey || defaultTileProperties.nameKey;
                                    let safeDescKey = tile.descriptionKey || defaultTileProperties.descriptionKey;

                                    if (safeNameKey === 'default_tile_name' || safeDescKey === 'default_tile_description') {
                                        const uniqueSuffix = Date.now().toString() + Math.random().toString(36).substring(7);
                                        safeNameKey = `migrated_title_${uniqueSuffix}`;
                                        safeDescKey = `migrated_desc_${uniqueSuffix}`;

                                        // Rescue string values if they existed in the imported dictionary at the old collided key
                                        // Using ?? to ensure intentional empty strings "" are not overridden by falsy fallbacks
                                        const oldName = importedData.translations?.[tile.nameKey]?.en ?? tile.name ?? '';
                                        const oldNameEs = importedData.translations?.[tile.nameKey]?.es ?? '';
                                        const oldDesc = importedData.translations?.[tile.descriptionKey]?.en ?? tile.description ?? '';
                                        const oldDescEs = importedData.translations?.[tile.descriptionKey]?.es ?? '';

                                        dict[safeNameKey] = { en: oldName, es: oldNameEs };
                                        dict[safeDescKey] = { en: oldDesc, es: oldDescEs };
                                    }

                                    const sanitizedTile: Tile = {
                                        ...defaultTileProperties,
                                        ...restOfTile,
                                        id: tile.id || generateUniqueId(),
                                        nameKey: safeNameKey,
                                        descriptionKey: safeDescKey,
                                        children: tile.children ? sanitizeTiles(tile.children, dict) : [],
                                        accessTags: Array.isArray(tile.accessTags) ? tile.accessTags.map(String) : [],
                                        isVisible: {
                                            ...defaultTileProperties.isVisible,
                                            ...restOfVisibility
                                        }
                                    };
                                    return sanitizedTile;
                                });
                            };

                            const sanitizeTemplates = (templates: any[] = []): Template[] => {
                                return templates.map((template: any) => {
                                    const { borderColor, ...restOfProps } = template.properties;
                                    const { borderColor: vBorderColor, ...restOfVisibility } = (template.properties?.isVisible || {});
                                    return {
                                        templateId: template.templateId || generateUniqueId(),
                                        name: template.name || 'Untitled Template',
                                        properties: {
                                            ...defaultTileProperties,
                                            ...(restOfProps || {}),
                                            accessTags: Array.isArray(template.properties?.accessTags) ? template.properties.accessTags.map(String) : [],
                                            isVisible: {
                                                ...defaultTileProperties.isVisible,
                                                ...restOfVisibility
                                            }
                                        }
                                    }
                                });
                            };

                            const newTranslations: TranslationDictionary = { ...(importedData.translations || defaultSiteProperties.translations) };
                            const safeTiles = sanitizeTiles(importedData.tiles || [], newTranslations);

                            const newSiteData: SiteData = {
                                siteNameKey: importedData.siteNameKey || defaultSiteProperties.siteNameKey,
                                headerContentKey: importedData.headerContentKey || defaultSiteProperties.headerContentKey,
                                footerContentKey: importedData.footerContentKey || defaultSiteProperties.footerContentKey,
                                translations: newTranslations,
                                tiles: safeTiles,
                                templates: sanitizeTemplates(importedData.templates || []),
                                helpTileId: importedData.helpTileId,
                            };

                            setSiteData(() => {
                                saveSiteData(newSiteData);
                                return newSiteData;
                            });

                            setCurrentPath([]);
                            setNavigationHistory([[]]);
                            setIsViewingPreview(false);
                        },
                        true
                    );
                } else {
                    setError("Invalid JSON file. Please ensure it has a 'tiles' array.");
                }
            } catch (parseError) {
                setError("Error parsing JSON file. Please ensure it's a valid JSON format.");
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    }, [saveSiteData]);

    const handleSaveSiteAsJson = useCallback(() => {
        try {
            const jsonString = JSON.stringify(siteData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `site_data.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            setError("Failed to export site data as JSON.");
        }
    }, [siteData]);

    const handleSaveSiteForDeployment = useCallback(() => {
        try {
            // Deploying the builder architecture for multi-lingual
            const deploymentSiteData = {
                ...siteData,
                headerContentKey: siteData.headerContentKey,
                footerContentKey: siteData.footerContentKey,
                translations: siteData.translations
            };
            const deployedHtmlContent = generateDeploymentHtml(deploymentSiteData);
            const blob = new Blob([deployedHtmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deployed_site.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            setError("Failed to export deployed site.");
        }
    }, [siteData]);

    const handleSaveSiteAsComponent = useCallback(() => {
        try {
            // Deploying the builder architecture for multi-lingual
            const deploymentSiteData = {
                ...siteData,
                headerContentKey: siteData.headerContentKey,
                footerContentKey: siteData.footerContentKey,
                translations: siteData.translations
            };
            const componentJsContent = generateComponentJavaScript(deploymentSiteData);
            const blob = new Blob([componentJsContent], { type: 'text/javascript' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `component.js`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            setError("Failed to export site as a component.");
        }
    }, [siteData]);

    const handleShowTilePicker = useCallback((onSelect: (tile: Tile) => void) => {
        setTilePickerCallback(() => onSelect);
        setIsTilePickerVisible(true);
    }, []);

    const handleTilePickerClose = useCallback(() => {
        setIsTilePickerVisible(false);
        setTilePickerCallback(null);
    }, []);

    const handleTilePickerSelect = useCallback((tile: Tile) => {
        if (tilePickerCallback) {
            tilePickerCallback(tile);
        }
        handleTilePickerClose();
    }, [tilePickerCallback, handleTilePickerClose]);

    const handlePlayVideo = useCallback((url: string) => {
        const embedUrl = getEmbedUrl(url);
        if (embedUrl) {
            setCurrentVideoUrl(embedUrl);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }, []);

    const handleCloseVideo = useCallback(() => {
        setCurrentVideoUrl(null);
    }, []);

    // Sanitize header and footer content for safe rendering within the builder UI.
    const rawHeader = siteData.translations[siteData.headerContentKey]?.en || '';
    const rawFooter = siteData.translations[siteData.footerContentKey]?.en || '';
    const sanitizedHeader = useMemo(() => sanitizeHTML(rawHeader), [rawHeader]);
    const sanitizedFooter = useMemo(() => sanitizeHTML(rawFooter), [rawFooter]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-xl text-gray-700">Loading site data...</p></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-100 text-red-800 p-4">
                <p className="text-xl font-semibold mb-4">Error:</p>
                <p>{error}</p>
                <button onClick={() => { localStorage.removeItem(LOCAL_STORAGE_KEY); window.location.reload(); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Clear Data & Reload</button>
            </div>
        );
    }

    const tilesToDisplay = getTilesToDisplay();
    const currentParentTile = currentPath.length > 0 ? findTileById(siteData.tiles, currentPath[currentPath.length - 1]) : null;
    const currentLevelTitle = currentParentTile ? `Editing Children of: ${siteData.translations[currentParentTile.nameKey]?.en ?? ''}` : "Site Structure (Root Level)";

    return (
        <div className="p-6 md:p-10 bg-gray-100 min-h-screen">
            <header className="bg-white shadow-md py-4 md:py-6 mb-10">
                <div className="container mx-auto px-4 sm:px-6 grid grid-cols-3 items-center gap-4">
                    <div className="flex items-center space-x-2 justify-self-start">
                        {navigationHistory.length > 1 && (
                            <button onClick={handleGoToPrevious} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-lg p-2 bg-gray-100 hover:bg-gray-200 rounded-md shadow hover:shadow-md" aria-label="Go to Previous">
                                <PreviousArrowIcon /><span className="ml-2 hidden sm:inline">Previous</span>
                            </button>
                        )}
                        {currentPath.length > 0 && (
                            <button onClick={handleNavigateHome} className="text-blue-600 hover:text-blue-800 transition-colors flex items-center text-lg p-2 bg-gray-100 hover:bg-gray-200 rounded-md shadow hover:shadow-md" aria-label="Go Home">
                                <HomeIcon /><span className="ml-2 hidden sm:inline">Home</span>
                            </button>
                        )}
                    </div>
                    <div className="min-w-0 text-center col-start-2 site-header-content" dangerouslySetInnerHTML={{ __html: sanitizedHeader }} />
                    <div />
                </div>
            </header>

            <main className="container mx-auto px-6">
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md flex justify-center flex-wrap gap-3">
                    <button onClick={() => setIsViewingPreview(false)} className={`px-4 py-2 rounded-lg shadow font-semibold transition-colors ${!isViewingPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Builder Mode</button>
                    <button onClick={() => { setIsViewingPreview(true); setCurrentPath([]); setNavigationHistory([[]]); }} className={`px-4 py-2 rounded-lg shadow font-semibold transition-colors ${isViewingPreview ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Preview Site</button>
                    <button onClick={handleNewSite} className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 font-semibold">New Site</button>
                    <button onClick={handleOpenEditSiteDetailsModal} className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow hover:bg-orange-600 font-semibold">Edit Site</button>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 font-semibold">Import JSON</button>
                    <input type="file" ref={fileInputRef} onChange={handleImportSiteFile} accept=".json" style={{ display: 'none' }} />
                    <button onClick={handleSaveSiteAsJson} className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 font-semibold">Save JSON</button>
                    <button onClick={handleSaveSiteForDeployment} className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow hover:bg-teal-700 font-semibold">Deploy HTML</button>
                    <button onClick={handleSaveSiteAsComponent} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 font-semibold">Deploy Component</button>
                </div>

                {isViewingPreview ? (
                    <SitePreviewer siteData={siteData} currentPath={currentPath} onNavigateToChildren={handleNavigateToChildren} findTileById={(id) => findTileById(siteData.tiles, id)} onNavigateToTile={handleNavigateToTile} onPlayVideo={handlePlayVideo} highlightedTileId={highlightedTileId} onHighlightComplete={handleHighlightComplete} />
                ) : (
                    <>
                        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{currentLevelTitle}</h2>
                            <div className="flex flex-wrap items-center gap-4">
                                <button onClick={() => handleAddTileToCurrentLevel()} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-semibold">Add New Tile</button>
                                {siteData.templates.length > 0 && (
                                    <div className="relative">
                                        <select onChange={(e) => { if (e.target.value) { handleAddTileToCurrentLevelFromTemplate(e.target.value); e.target.value = ""; } }} className="px-6 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-semibold appearance-none pr-10" defaultValue="">
                                            <option value="" disabled>Add from Template...</option>
                                            {siteData.templates.map(template => <option key={template.templateId} value={template.templateId}>{template.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tilesToDisplay.length === 0 ? (
                                <p className="text-gray-600 text-center text-lg p-8 bg-white rounded-lg shadow-md col-span-full">No tiles at this level. Add one!</p>
                            ) : (
                                tilesToDisplay.map((tile) => (
                                    <TileDisplay key={tile.id} tile={tile} translations={siteData.translations} onEdit={handleEditTile} onDelete={handleDeleteTile} onAddChild={handleAddChildTile} onReorder={handleReorderTiles} parentId={currentPath.length > 0 ? currentPath[currentPath.length - 1] : null} onNavigateToChildren={handleNavigateToChildren} onNavigateToTile={handleNavigateToTile} onPlayVideo={handlePlayVideo} isBuilderMode={true} isSelectedParent={false} isHighlighted={tile.id === highlightedTileId} onHighlightComplete={handleHighlightComplete} />
                                ))
                            )}
                        </div>

                        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Saved Templates</h2>
                            {siteData.templates.length === 0 ? (
                                <p className="text-gray-600">No templates saved yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {siteData.templates.map(template => (
                                        <div key={template.templateId} className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center">
                                            <span className="font-medium text-gray-800">{template.name}</span>
                                            <button onClick={() => handleDeleteTemplate(template.templateId)} className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200" aria-label="Delete template">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm6 2a1 1 0 100 2h-4a1 1 0 100-2h4z" clipRule="evenodd" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            <footer className="bg-gray-800 text-white py-8 mt-16">
                <div className="container mx-auto px-6 text-center" dangerouslySetInnerHTML={{ __html: sanitizedFooter }} />
            </footer>

            {editingTile && <TileEditor tile={editingTile} translations={siteData.translations} onClose={() => setEditingTile(null)} onSave={handleSaveEditedTile} onSaveAsTemplate={handleSaveAsTemplate} templates={siteData.templates} onShowTilePicker={handleShowTilePicker} findTileById={(id) => findTileById(siteData.tiles, id)} />}
            {isEditingSiteDetails && <SiteDetailsEditor currentSiteData={siteData} translations={siteData.translations} onClose={() => { setIsEditingSiteDetails(false); setIsNewSiteFlowActive(false); }} onSave={handleSaveSiteDetails} isNewSiteFlow={isNewSiteFlowActive} onShowTilePicker={handleShowTilePicker} />}
            {isTilePickerVisible && <TilePicker tiles={siteData.tiles} translations={siteData.translations} onClose={handleTilePickerClose} onSelect={handleTilePickerSelect} />}
            {confirmationState?.isOpen && (
                <ConfirmationModal
                    isOpen={confirmationState.isOpen}
                    title={confirmationState.title}
                    message={confirmationState.message}
                    onConfirm={confirmationState.onConfirm}
                    onCancel={handleCancelConfirmation}
                    isDanger={confirmationState.isDanger}
                />
            )}
            {promptState?.isOpen && (
                <PromptModal
                    isOpen={promptState.isOpen}
                    title={promptState.title}
                    label={promptState.label}
                    defaultValue={promptState.defaultValue}
                    onConfirm={promptState.onConfirm}
                    onCancel={handleCancelPrompt}
                />
            )}
            {currentVideoUrl && <VideoPlayer url={currentVideoUrl} onClose={handleCloseVideo} />}
        </div>
    );
};

export default App;