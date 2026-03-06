import React, { useState, useEffect } from 'react';
import type { Tile, Template, InternalLink, TranslationDictionary } from '../types';
import { defaultTileProperties } from '../constants';
import { generateUniqueId } from '../utils/id';
import { generateContent, findVideoWithAi, generateImageWithAi, generateDesignSuggestionsWithAi } from '../utils/aiUtils';
import { getThumbnailUrl } from '../utils/videoUtils';
import { SparklesIcon, FilmIcon, PhotoIcon, PaletteIcon } from './icons';
import PromptModal from './PromptModal';


interface TileEditorProps {
    tile: Tile;
    onClose: () => void;
    onSave: (tile: Tile, updatedTranslations: TranslationDictionary) => void;
    onSaveAsTemplate: (tile: Tile) => void;
    templates: Template[];
    onShowTilePicker: (onSelect: (tile: Tile) => void) => void;
    findTileById: (id: string) => Tile | null;
    translations: TranslationDictionary;
}

const TileEditor: React.FC<TileEditorProps> = ({ tile, translations, onClose, onSave, onSaveAsTemplate, templates, onShowTilePicker, findTileById }) => {
    const [editedTile, setEditedTile] = useState<Tile>(tile);
    const [nameEn, setNameEn] = useState(translations[tile.nameKey]?.en || '');
    const [nameEs, setNameEs] = useState(translations[tile.nameKey]?.es || '');
    const [descriptionEn, setDescriptionEn] = useState(translations[tile.descriptionKey]?.en || '');
    const [descriptionEs, setDescriptionEs] = useState(translations[tile.descriptionKey]?.es || '');
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'es'>('en');
    const [aiPromptState, setAiPromptState] = useState<{
        isOpen: boolean;
        title: string;
        label: string;
        defaultValue?: string;
        isLoading: boolean;
        fieldToUpdate: 'name' | 'description';
    } | null>(null);

    const [aiVideoPromptState, setAiVideoPromptState] = useState<{
        isOpen: boolean;
        isLoading: boolean;
        index?: number; // To identify which training video
    } | null>(null);

    const [aiImagePromptState, setAiImagePromptState] = useState<{
        isOpen: boolean;
        isLoading: boolean;
    } | null>(null);

    const [aiDesignPromptState, setAiDesignPromptState] = useState<{
        isOpen: boolean;
        isLoading: boolean;
    } | null>(null);


    useEffect(() => {
        setEditedTile(tile);
        setNameEn(translations[tile.nameKey]?.en || 'Tile');
        setNameEs(translations[tile.nameKey]?.es || '');
        setDescriptionEn(translations[tile.descriptionKey]?.en || '');
        setDescriptionEs(translations[tile.descriptionKey]?.es || '');
    }, [tile, translations]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        if (type === 'checkbox') {
            if (name === 'useLogoAsBackground') {
                setEditedTile(prev => ({
                    ...prev,
                    [name]: checked,
                    isVisible: checked ? {
                        ...prev.isVisible,
                        name: false,
                        description: false
                    } : prev.isVisible
                }));
            } else {
                const isVisibilityToggle = Object.keys(defaultTileProperties.isVisible).includes(name);
                if (isVisibilityToggle) {
                    setEditedTile(prev => ({ ...prev, isVisible: { ...prev.isVisible, [name]: checked } }));
                } else {
                    setEditedTile(prev => ({ ...prev, [name]: checked }));
                }
            }
        } else {
            setEditedTile(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleListChange = (listName: 'links' | 'resources' | 'trainingVideos' | 'internalLinks', index: number, field: string, value: string) => {
        const list = [...editedTile[listName]];
        (list[index] as any)[field] = value;
        setEditedTile(prev => ({ ...prev, [listName]: list as any }));
    };

    const handleAddListItem = (listName: 'links' | 'resources' | 'trainingVideos') => {
        const newItem = listName === 'trainingVideos' ? { url: '', thumbnailUrl: '' } : { name: '', url: '' };
        setEditedTile(prev => ({ ...prev, [listName]: [...prev[listName], newItem] as any }));
    };

    const handleAddInternalLink = (targetTile: Tile) => {
        const newLink: InternalLink = { name: translations[targetTile.nameKey]?.en || 'Tile', targetTileId: targetTile.id, id: generateUniqueId() };
        setEditedTile(prev => ({ ...prev, internalLinks: [...(prev.internalLinks || []), newLink] }));
    };

    const handleRemoveListItem = (listName: 'links' | 'resources' | 'trainingVideos' | 'internalLinks', index: number) => {
        setEditedTile(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) as any }));
    };

    const handleChooseNextTile = () => {
        onShowTilePicker((selectedTile) => {
            setEditedTile(prev => ({
                ...prev,
                workflow: {
                    ...(prev.workflow || {}),
                    nextTileId: selectedTile.id
                }
            }));
        });
    };

    const handleClearNextTile = () => {
        setEditedTile(prev => {
            const { nextTileId, ...restWorkflow } = prev.workflow || {};
            const newWorkflow = Object.keys(restWorkflow).length > 0 ? restWorkflow : undefined;
            return {
                ...prev,
                workflow: newWorkflow
            };
        });
    };

    const handleSave = () => {
        const updatedTranslations = { ...translations };
        updatedTranslations[editedTile.nameKey] = { ...updatedTranslations[editedTile.nameKey], en: nameEn.trim(), es: nameEs.trim() };
        updatedTranslations[editedTile.descriptionKey] = { ...updatedTranslations[editedTile.descriptionKey], en: descriptionEn.trim(), es: descriptionEs.trim() };

        onSave(editedTile, updatedTranslations);
    };

    const handleSaveTemplate = () => {
        onSaveAsTemplate(editedTile);
    };

    const handleApplyTemplate = () => {
        if (!selectedTemplateId) return;
        const template = templates.find(t => t.templateId === selectedTemplateId);
        if (template) {
            setEditedTile(prev => ({
                ...prev,
                ...template.properties,
                id: prev.id,
                children: prev.children,
                isVisible: { ...defaultTileProperties.isVisible, ...(template.properties.isVisible || {}) }
            }));
        }
    };

    const handleGenerateClick = (field: 'name' | 'description') => {
        setAiPromptState({
            isOpen: true,
            title: `Generate ${field.charAt(0).toUpperCase() + field.slice(1)} with AI`,
            label: field === 'name' ? 'Describe the tile\'s purpose:' : 'What should the description be about?',
            defaultValue: field === 'description' ? nameEn : '',
            isLoading: false,
            fieldToUpdate: field,
        });
    };

    const handleAiPromptConfirm = async (userInput: string) => {
        if (!aiPromptState) return;
        setAiPromptState(prev => ({ ...prev!, isLoading: true }));

        try {
            const prompt = aiPromptState.fieldToUpdate === 'name'
                ? `Based on the following description, generate a concise and professional tile name (3-5 words max): "${userInput}"`
                : `Based on the following topic, generate a clear and informative tile description (2-3 sentences): "${userInput}"`;

            const generatedText = await generateContent(prompt);

            if (generatedText) {
                if (aiPromptState.fieldToUpdate === 'name') {
                    setNameEn(generatedText);
                } else {
                    setDescriptionEn(generatedText);
                }
            } else {
                alert('AI generation failed. The model returned an empty response. Please try again.');
            }
        } catch (error) {
            console.error('AI Generation Error:', error);
            alert(`An error occurred during AI generation: ${(error as Error).message}`);
        } finally {
            setAiPromptState(null);
        }
    };

    const handleAiPromptCancel = () => {
        setAiPromptState(null);
    };

    const handleVideoUrlBlur = async (
        e: React.FocusEvent<HTMLInputElement>,
        videoType: 'overview' | 'training',
        index?: number
    ) => {
        const videoUrl = e.target.value.trim();
        if (!videoUrl) return;

        let currentThumbnailUrl = '';
        if (videoType === 'overview') {
            currentThumbnailUrl = editedTile.thumbnailUrl;
        } else if (index !== undefined) {
            currentThumbnailUrl = editedTile.trainingVideos[index].thumbnailUrl;
        }

        if (currentThumbnailUrl) {
            const shouldOverwrite = window.confirm(
                'A thumbnail URL already exists. Do you want to automatically replace it?'
            );
            if (!shouldOverwrite) return;
        }

        try {
            const newThumbnailUrl = await getThumbnailUrl(videoUrl);
            if (newThumbnailUrl) {
                setEditedTile(prev => {
                    if (videoType === 'overview') {
                        return { ...prev, thumbnailUrl: newThumbnailUrl };
                    } else if (index !== undefined) {
                        const newTrainingVideos = [...prev.trainingVideos];
                        newTrainingVideos[index] = { ...newTrainingVideos[index], thumbnailUrl: newThumbnailUrl };
                        return { ...prev, trainingVideos: newTrainingVideos };
                    }
                    return prev;
                });
            }
        } catch (error) {
            console.error("Failed to fetch thumbnail:", error);
        }
    };

    const handleFindVideoClick = (index?: number) => {
        setAiVideoPromptState({ isOpen: true, isLoading: false, index });
    };

    const handleAiVideoPromptConfirm = async (topic: string) => {
        if (!aiVideoPromptState) return;
        setAiVideoPromptState(prev => ({ ...prev!, isLoading: true }));
        try {
            const result = await findVideoWithAi(topic);
            if (result) {
                const { index } = aiVideoPromptState;
                setEditedTile(prev => {
                    if (index !== undefined) {
                        const newTrainingVideos = [...prev.trainingVideos];
                        // Ensure we have a valid object at the index
                        newTrainingVideos[index] = { ...newTrainingVideos[index], url: result.videoUrl, thumbnailUrl: result.thumbnailUrl };
                        return { ...prev, trainingVideos: newTrainingVideos };
                    } else {
                        return {
                            ...prev,
                            overviewVideo: result.videoUrl,
                            thumbnailUrl: result.thumbnailUrl,
                        };
                    }
                });
            } else {
                alert('AI video search failed. The model could not find a suitable video. Please try a different topic.');
            }
        } catch (error) {
            console.error('AI Video Search Error:', error);
            alert(`An error occurred during AI video search: ${(error as Error).message}`);
        } finally {
            setAiVideoPromptState(null);
        }
    };

    const handleAiVideoPromptCancel = () => {
        setAiVideoPromptState(null);
    };

    const handleGenerateImageClick = () => {
        setAiImagePromptState({ isOpen: true, isLoading: false });
    };

    const handleAiImagePromptConfirm = async (prompt: string) => {
        setAiImagePromptState(prev => ({ ...prev!, isLoading: true }));
        try {
            const imageUrl = await generateImageWithAi(prompt);
            if (imageUrl) {
                setEditedTile(prev => ({
                    ...prev,
                    logoUrl: imageUrl,
                    useLogoAsBackground: false,
                    color: '#FFFFFF' // Automatically set background to white for a perfect match
                }));
            } else {
                alert('AI image generation failed. The model returned no image. Please try a different prompt.');
            }
        } catch (error) {
            console.error('AI Image Generation Error:', error);
            alert(`An error occurred during AI image generation: ${(error as Error).message}`);
        } finally {
            setAiImagePromptState(null);
        }
    };

    const handleAiImagePromptCancel = () => {
        setAiImagePromptState(null);
    };

    const fontOptions = ['Verdana', 'Inter', 'Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Roboto', 'Montserrat'];

    const handleAiDesignerClick = () => {
        setAiDesignPromptState({ isOpen: true, isLoading: false });
    };

    const handleAiDesignerConfirm = async (topic: string) => {
        setAiDesignPromptState(prev => ({ ...prev!, isLoading: true }));
        try {
            const result = await generateDesignSuggestionsWithAi(topic, fontOptions);
            if (result) {
                setEditedTile(prev => ({
                    ...prev,
                    color: result.color,
                    font: result.font,
                }));
            } else {
                alert('AI design suggestion failed. The model returned invalid data. Please try a different prompt.');
            }
        } catch (error) {
            console.error('AI Design Suggestion Error:', error);
            alert(`An error occurred during AI design suggestion: ${(error as Error).message}`);
        } finally {
            setAiDesignPromptState(null);
        }
    };

    const handleAiDesignerCancel = () => {
        setAiDesignPromptState(null);
    };


    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-2xl font-bold text-gray-800">Edit Tile: {nameEn || 'Untitled'}</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-semibold">&times;</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            {/* Templates */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-3">Templates</h3>
                                <div className="flex items-center space-x-2 mb-3">
                                    <label htmlFor="template-select" className="sr-only">Select a template to apply</label>
                                    <select id="template-select" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)} className="flex-grow p-2 border rounded-md shadow-sm">
                                        <option value="">Select a template...</option>
                                        {templates.map(t => <option key={t.templateId} value={t.templateId}>{t.name}</option>)}
                                    </select>
                                    <button onClick={handleApplyTemplate} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-semibold">Apply</button>
                                </div>
                                <button onClick={handleSaveTemplate} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-semibold">Save as New Template</button>
                            </div>
                            {/* General */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-lg font-semibold">General Properties</h3>
                                    <div className="bg-gray-200 p-1 rounded-full inline-flex">
                                        <button
                                            onClick={() => setCurrentLanguage('en')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${currentLanguage === 'en' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => setCurrentLanguage('es')}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${currentLanguage === 'es' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                                        >
                                            Español
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="tile-name" className="block text-sm font-medium">Name ({currentLanguage.toUpperCase()})</label>
                                    <button onClick={() => handleGenerateClick('name')} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold" aria-label="Generate Name with AI">
                                        <SparklesIcon className="h-4 w-4 mr-1" /> Generate
                                    </button>
                                </div>
                                <input type="text" id="tile-name" name="name" value={currentLanguage === 'en' ? nameEn : nameEs} onChange={(e) => currentLanguage === 'en' ? setNameEn(e.target.value) : setNameEs(e.target.value)} className="w-full p-2 border rounded-md mb-3" />

                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="tile-description" className="block text-sm font-medium">Description ({currentLanguage.toUpperCase()})</label>
                                    <button onClick={() => handleGenerateClick('description')} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold" aria-label="Generate Description with AI">
                                        <SparklesIcon className="h-4 w-4 mr-1" /> Generate
                                    </button>
                                </div>
                                <textarea id="tile-description" name="description" value={currentLanguage === 'en' ? descriptionEn : descriptionEs} onChange={(e) => currentLanguage === 'en' ? setDescriptionEn(e.target.value) : setDescriptionEs(e.target.value)} rows={3} className="w-full p-2 border rounded-md" />
                            </div>
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-3">Access Control</h3>
                                <label htmlFor="tile-access-tags" className="block text-sm font-medium">Access Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    id="tile-access-tags"
                                    name="accessTags"
                                    value={(editedTile.accessTags || []).join(', ')}
                                    onChange={(e) => {
                                        const tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                                        setEditedTile(prev => ({ ...prev, accessTags: tags }));
                                    }}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="e.g. admin, premium-user, staff"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave blank for public access. Users with at least one matching tag can see this tile.</p>
                            </div>
                            {/* Appearance */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold">Appearance</h3>
                                    <button onClick={handleAiDesignerClick} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold" aria-label="Generate Design with AI">
                                        <PaletteIcon className="h-4 w-4 mr-1" /> AI Designer
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label htmlFor="tile-color" className="block text-sm font-medium">Background Color</label>
                                        <input type="color" id="tile-color" name="color" value={editedTile.color} onChange={handleChange} className="w-full h-10 p-1 border rounded-md" disabled={editedTile.useLogoAsBackground} />
                                    </div>
                                </div>
                                <label className="flex items-center space-x-2 mt-4">
                                    <input type="checkbox" id="use-logo-as-background" name="useLogoAsBackground" checked={editedTile.useLogoAsBackground || false} onChange={handleChange} />
                                    {/* FIX: The htmlFor attribute is not valid on a span element. The wrapping label implicitly links the text to the checkbox. */}
                                    <span>Use Logo as Background</span>
                                </label>
                                <label htmlFor="tile-font" className="block text-sm font-medium mt-3">Font</label>
                                <select id="tile-font" name="font" value={editedTile.font} onChange={handleChange} className="w-full p-2 border rounded-md">
                                    {fontOptions.map(font => <option key={font} value={font}>{font}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            {/* Visibility */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-3">Content Visibility</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {Object.keys(defaultTileProperties.isVisible).map(key => {
                                        const isDisabled = editedTile.useLogoAsBackground && (key === 'name' || key === 'description');
                                        return (
                                            <label key={key} htmlFor={`visibility-${key}`} className={`flex items-center space-x-2 text-sm ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <input type="checkbox" id={`visibility-${key}`} name={key} checked={isDisabled ? false : editedTile.isVisible[key as keyof typeof editedTile.isVisible]} onChange={handleChange} disabled={isDisabled} />
                                                <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* URLs */}
                            <div className="mb-6 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-3">Content & Links</h3>
                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="tile-logo-url" className="block text-sm font-medium">Logo Image URL</label>
                                    <button onClick={handleGenerateImageClick} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold" aria-label="Generate Logo with AI">
                                        <PhotoIcon className="h-4 w-4 mr-1" /> Generate
                                    </button>
                                </div>
                                <input type="url" id="tile-logo-url" name="logoUrl" value={editedTile.logoUrl || ''} onChange={handleChange} className="w-full p-2 border rounded-md mb-3" placeholder="https://example.com/logo.png" />

                                <div className="flex items-center justify-between mb-1">
                                    <label htmlFor="tile-overview-video" className="block text-sm font-medium">Overview Video URL</label>
                                    <button onClick={() => handleFindVideoClick()} className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold" aria-label="Find Video with AI">
                                        <FilmIcon className="h-4 w-4 mr-1" /> Find Video
                                    </button>
                                </div>
                                <input type="url" id="tile-overview-video" name="overviewVideo" value={editedTile.overviewVideo} onChange={handleChange} onBlur={(e) => handleVideoUrlBlur(e, 'overview')} className="w-full p-2 border rounded-md mb-3" />

                                <label htmlFor="tile-thumbnail-url" className="block text-sm font-medium">Overview Thumbnail URL</label>
                                <input type="url" id="tile-thumbnail-url" name="thumbnailUrl" value={editedTile.thumbnailUrl} onChange={handleChange} className="w-full p-2 border rounded-md mb-3" />
                                <label htmlFor="tile-documentation-url" className="block text-sm font-medium">Documentation Folder URL</label>
                                <input type="url" id="tile-documentation-url" name="documentation" value={editedTile.documentation} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            {/* Training Videos */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-2">Training Videos</h3>
                                {editedTile.trainingVideos.map((item, index) => (
                                    <div key={index} className="space-y-2 mb-3 p-2 border-b last:border-b-0 pb-3">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="url"
                                                placeholder="Video URL"
                                                aria-label={`URL for training video ${index + 1}`}
                                                value={item.url || ''}
                                                onChange={e => handleListChange('trainingVideos', index, 'url', e.target.value)}
                                                onBlur={(e) => handleVideoUrlBlur(e, 'training', index)}
                                                className="w-full p-2 border rounded-md flex-grow"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleFindVideoClick(index)}
                                                className="flex items-center text-xs text-blue-600 hover:text-blue-800 font-semibold p-2 rounded-md hover:bg-blue-50 flex-shrink-0"
                                                aria-label="Find Training Video with AI"
                                            >
                                                <FilmIcon className="h-4 w-4 mr-1" /> Find
                                            </button>
                                        </div>
                                        <input
                                            type="url"
                                            placeholder="Thumbnail URL"
                                            aria-label={`Thumbnail URL for training video ${index + 1}`}
                                            value={item.thumbnailUrl || ''}
                                            onChange={e => handleListChange('trainingVideos', index, 'thumbnailUrl', e.target.value)}
                                            className="w-full p-2 border rounded-md"
                                        />
                                        <button type="button" onClick={() => handleRemoveListItem('trainingVideos', index)} className="text-red-500 text-sm hover:underline">Remove</button>
                                    </div>
                                ))}
                                <button onClick={() => handleAddListItem('trainingVideos')} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Add</button>
                            </div>
                            {/* Links and Resources */}
                            {[{ title: 'Links', name: 'links' }, { title: 'Resources', name: 'resources' }].map(list => (
                                <div key={list.name} className="mb-4 p-4 bg-gray-50 rounded-md border">
                                    <h3 className="text-lg font-semibold mb-2">{list.title}</h3>
                                    {editedTile[list.name as 'links' | 'resources'].map((item, index) => (
                                        <div key={index} className="space-y-2 mb-3 p-2 border-b last:border-b-0 pb-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <input type="text" placeholder="Name" aria-label={`Name for ${list.title.slice(0, -1)} ${index + 1}`} value={item.name || ''} onChange={e => handleListChange(list.name as 'links' | 'resources', index, 'name', e.target.value)} className="w-full p-2 border rounded-md" />
                                                <input type="url" placeholder="URL" aria-label={`URL for ${list.title.slice(0, -1)} ${index + 1}`} value={item.url || ''} onChange={e => handleListChange(list.name as 'links' | 'resources', index, 'url', e.target.value)} className="w-full p-2 border rounded-md" />
                                            </div>
                                            <button onClick={() => handleRemoveListItem(list.name as 'links' | 'resources', index)} className="text-red-500 text-sm hover:underline">Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => handleAddListItem(list.name as 'links' | 'resources')} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">Add</button>
                                </div>
                            ))}
                            {/* Internal Links */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-2">Internal Links</h3>
                                {(editedTile.internalLinks || []).map((link, index) => (
                                    <div key={index} className="flex items-center space-x-2 mb-2">
                                        <input type="text" placeholder="Link Name" aria-label={`Name for internal link ${index + 1}`} value={link.name} onChange={e => handleListChange('internalLinks', index, 'name', e.target.value)} className="flex-grow p-2 border rounded-md" />
                                        <button onClick={() => handleRemoveListItem('internalLinks', index)} className="text-red-500 text-sm hover:underline">Remove</button>
                                    </div>
                                ))}
                                <button onClick={() => onShowTilePicker(handleAddInternalLink)} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm">Add Internal Link</button>
                            </div>
                            {/* Workflow */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-md border">
                                <h3 className="text-lg font-semibold mb-2">Workflow Link</h3>
                                <p className="text-sm text-gray-500 mb-3">
                                    Create a guided path by linking to the next logical tile in a sequence. This will show a 'Next' arrow icon on the tile.
                                </p>
                                {editedTile.workflow?.nextTileId ? (
                                    <div className="flex items-center justify-between p-2 bg-blue-50 rounded-md">
                                        <span className="text-sm text-blue-800">
                                            Next Tile: <span className="font-semibold">{translations[findTileById(editedTile.workflow.nextTileId)?.nameKey || '']?.en || 'Unknown Tile'}</span>
                                        </span>
                                        <button onClick={handleClearNextTile} className="text-red-500 text-sm hover:underline font-semibold">Clear</button>
                                    </div>
                                ) : (
                                    <button onClick={handleChooseNextTile} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Choose Next Tile</button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
                        <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                        <button onClick={handleSave} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Save Changes</button>
                    </div>
                </div>
            </div>
            {aiPromptState?.isOpen && (
                <PromptModal
                    isOpen={aiPromptState.isOpen}
                    title={aiPromptState.title}
                    label={aiPromptState.label}
                    defaultValue={aiPromptState.defaultValue}
                    onConfirm={handleAiPromptConfirm}
                    onCancel={handleAiPromptCancel}
                    isLoading={aiPromptState.isLoading}
                    confirmText="Generate"
                />
            )}
            {aiVideoPromptState?.isOpen && (
                <PromptModal
                    isOpen={aiVideoPromptState.isOpen}
                    title="Find Video with AI"
                    label="Describe the video you want to find:"
                    defaultValue=""
                    onConfirm={handleAiVideoPromptConfirm}
                    onCancel={handleAiVideoPromptCancel}
                    isLoading={aiVideoPromptState.isLoading}
                    confirmText="Search"
                />
            )}
            {aiImagePromptState?.isOpen && (
                <PromptModal
                    isOpen={aiImagePromptState.isOpen}
                    title="Generate Logo with AI"
                    label="Describe the logo you want to create:"
                    defaultValue={`A clean, modern logo for "${nameEn || 'the tile'}". Note: The tile's background will be set to white to match the generated logo.`}
                    onConfirm={handleAiImagePromptConfirm}
                    onCancel={handleAiImagePromptCancel}
                    isLoading={aiImagePromptState.isLoading}
                    confirmText="Generate Image"
                />
            )}
            {aiDesignPromptState?.isOpen && (
                <PromptModal
                    isOpen={aiDesignPromptState.isOpen}
                    title="AI Designer"
                    label="Describe the mood, brand, or topic:"
                    defaultValue={`A design for a tile about "${nameEn || 'the tile'}". The mood should be...`}
                    onConfirm={handleAiDesignerConfirm}
                    onCancel={handleAiDesignerCancel}
                    isLoading={aiDesignPromptState.isLoading}
                    confirmText="Suggest Design"
                />
            )}
        </>
    );
};

export default TileEditor;