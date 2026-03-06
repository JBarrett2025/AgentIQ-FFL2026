import type { SiteData } from '../types';
import { defaultTileProperties } from '../constants';
import { domPurifySource } from './dompurify';
import { reactSource, reactDomSource, tailwindSource } from './bundledDependencies';
import { deploymentControllerSource } from './deploymentController';

/**
 * This function contains the complete, self-contained logic for the deployed application.
 * It's defined as a standard function here for readability and maintainability.
 * Its source code will be converted to a string and injected into the deployment targets.
 * DO NOT call this function directly. It is meant to be stringified.
 */
const deployedAppLogic = (React: any, siteData: SiteData, defaultIsVisible: any) => {
    const { useState, useEffect, useCallback, useMemo, createElement: h, forwardRef, useImperativeHandle, Component, useRef } = React;

    class ErrorBoundary extends (Component as any) {
        props: any;
        state: any;
        constructor(props: any) {
            super(props);
            this.state = { hasError: false, error: null };
        }
        static getDerivedStateFromError(error: Error) {
            return { hasError: true, error: error };
        }
        componentDidCatch(error: Error, errorInfo: any) {
            console.error("Error caught by Nested Site Viewer boundary:", error, errorInfo);
        }
        render() {
            if (this.state.hasError) {
                return h('div', { style: { padding: '20px', border: '2px solid #ef4444', margin: '20px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px' } },
                    h('h3', { style: { color: '#dc2626', fontWeight: 'bold' } }, 'Something went wrong.'),
                    h('p', { style: { marginTop: '8px' } }, 'This component has encountered an error and cannot be displayed.'),
                    h('pre', { style: { whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '12px', marginTop: '12px', backgroundColor: '#fecaca', padding: '10px', borderRadius: '4px' } }, this.state.error && this.state.error.toString())
                );
            }
            return this.props.children;
        }
    }

    const sanitizeHTML = (dirtyHTML: string) => {
        if (typeof (window as any).DOMPurify?.sanitize !== 'function') {
            console.error("DOMPurify is not available. Cannot sanitize HTML. Rendering empty string for safety.");
            return '';
        }
        return (window as any).DOMPurify.sanitize(dirtyHTML);
    };

    const darkenColor = (hex: string, percent: number) => { if (!hex || typeof hex !== 'string') return '#cccccc'; hex = hex.replace(/^#/, ''); if (hex.length === 3) hex = hex.split('').map(c => c + c).join(''); if (hex.length !== 6) return '#cccccc'; let r = parseInt(hex.substring(0, 2), 16), g = parseInt(hex.substring(2, 4), 16), b = parseInt(hex.substring(4, 6), 16); const factor = 1 - percent / 100; r = Math.floor(r * factor); g = Math.floor(g * factor); b = Math.floor(b * factor); r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b); const toHex = (c: number) => c.toString(16).padStart(2, '0'); return `#${toHex(r)}${toHex(g)}${toHex(b)}`; };

    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const origin = (typeof window !== 'undefined' && window.location.origin !== 'null') ? window.location.origin : 'https://example.com';
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);

        if (youtubeMatch && youtubeMatch[1]) { return `https://www.youtube.com/embed/${youtubeMatch[1]}?origin=${encodeURIComponent(origin)}`; }
        if (vimeoMatch && vimeoMatch[1]) { return `https://player.vimeo.com/video/${vimeoMatch[1]}`; }
        if (url.includes('youtube.com/embed/') && !url.includes('origin=')) { return `${url}${url.includes('?') ? '&' : '?'}origin=${encodeURIComponent(origin)}`; }
        return url;
    };

    const PreviousArrowIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M11 17l-5-5m0 0l5-5m-5 5h12" }));
    const HomeIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-7 4h6" }));
    const FolderIcon = () => h('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-8 w-8 text-gray-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" }));
    const PlayIcon = ({ className }: any) => h('svg', { className, fill: "currentColor", viewBox: "0 0 20 20" }, h('path', { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z", clipRule: "evenodd" }));
    const NextArrowIcon = ({ className }: any) => h('svg', { xmlns: "http://www.w3.org/2000/svg", className: className || "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2 }, h('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 7l5 5m0 0l-5 5m5-5H6" }));

    const DeployedVideoPlayer = ({ url, onClose }: any) => { useEffect(() => { const l = (e: any) => e.key === 'Escape' && onClose(); document.addEventListener('keydown', l); return () => document.removeEventListener('keydown', l); }, [onClose]); return h('div', { className: "fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-[9999]", onClick: onClose, role: "dialog", "aria-modal": "true" }, h('div', { className: "bg-black w-full max-w-4xl relative shadow-2xl rounded-lg", style: { aspectRatio: '16 / 9' }, onClick: (e: any) => e.stopPropagation() }, h('iframe', { src: url, width: "100%", height: "100%", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, title: "Embedded Video Player", className: "rounded-lg" }), h('button', { onClick: onClose, className: "absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-600 text-white text-xl flex items-center justify-center" }, '×'))); };

    const DeployedTileDisplay = ({ tile, currentLanguage, onNavigateToChildren, onNavigateToTile, onPlayVideo, _internalOnTileClick, isHighlighted, onHighlightComplete }: any) => {
        const tileRef = useRef(null);
        const [isAnimating, setIsAnimating] = useState(false);

        useEffect(() => {
            if (isHighlighted && tileRef.current) {
                (tileRef.current as any).scrollIntoView({ behavior: 'smooth', block: 'center' });

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

        const isVisible = { ...defaultIsVisible, ...tile.isVisible };
        const isSimpleButtonTile = tile.logoUrl && !tile.useLogoAsBackground && (!tile.description || !isVisible.description) && (!tile.overviewVideo || !isVisible.overviewVideo) && (!tile.trainingVideos?.length || !isVisible.trainingVideos);
        const getFontColor = (hex: string) => { if (!hex || hex.length < 7) return '#333'; try { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 160 ? '#333333' : '#FFFFFF'; } catch (e) { return '#333'; } };
        const textColor = getFontColor(tile.color);
        const labelColor = isVisible.color ? textColor : '#374151';
        const useLogoBg = tile.useLogoAsBackground && tile.logoUrl;

        const tileStyle: any = { fontFamily: isVisible.font ? tile.font + ', sans-serif' : 'inherit', backgroundColor: isVisible.color ? tile.color : '#FFFFFF' };
        if (useLogoBg) { Object.assign(tileStyle, { backgroundImage: `url('${tile.logoUrl}')`, backgroundSize: 'contain', backgroundPosition: 'center center', backgroundRepeat: 'no-repeat' }); }
        tileStyle.border = `6px solid ${isVisible.color ? darkenColor(tile.color, 15) : '#E5E7EB'}`;

        const mainClickAction = () => { _internalOnTileClick(tile); if (tile.children && tile.children.length > 0) onNavigateToChildren(tile.id); };

        const content: any[] = [];
        if (isVisible.logo && tile.logoUrl && !useLogoBg) { content.push(h('div', { key: 'logo', className: "mb-4 h-24 flex items-center justify-center" }, h('img', { src: tile.logoUrl, alt: `${siteData.translations[tile.nameKey]?.en || 'Tile'} Logo`, className: "max-h-24 mx-auto object-contain" }))); }
        const translatedName = siteData.translations[tile.nameKey]?.[currentLanguage as 'en' | 'es'] || siteData.translations[tile.nameKey]?.en || 'Tile';
        if (isVisible.name && !useLogoBg) { content.push(h('h3', { key: 'name', className: "text-2xl font-semibold text-center", style: { color: isVisible.color ? textColor : '#333' } }, translatedName)); }
        const descriptionText = siteData.translations[tile.descriptionKey]?.[currentLanguage as 'en' | 'es'] || siteData.translations[tile.descriptionKey]?.en || '';
        if (isVisible.description && descriptionText && !useLogoBg) { content.push(h('p', { key: 'desc', className: "text-md mt-2 text-center", style: { color: isVisible.color ? textColor : '#4B5563' } }, descriptionText)); }
        if (isVisible.overviewVideo && tile.overviewVideo) { content.push(h('div', { key: 'overview', className: "mt-4 text-center" }, h('button', { onClick: (e: any) => { e.stopPropagation(); onPlayVideo(tile.overviewVideo) }, className: "inline-block relative group" }, h('img', { src: tile.thumbnailUrl || "https://picsum.photos/120/80?grayscale", alt: "Overview", className: "rounded-md shadow-md" }), h('div', { className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity" }, h(PlayIcon, { className: "w-12 h-12 text-white" }))))); }
        if (isVisible.trainingVideos && tile.trainingVideos && tile.trainingVideos.length > 0) {
            content.push(h('div', { key: 'training', className: "mt-4" },
                h('h4', { className: "font-semibold text-lg mb-2 text-left", style: { color: labelColor } }, "Training Videos:"),
                h('div', { className: "grid grid-cols-2 sm:grid-cols-3 gap-2" },
                    tile.trainingVideos.map((v: any, i: number) => h('button', { key: i, onClick: (e: any) => { e.stopPropagation(); onPlayVideo(v.url) }, className: "inline-block relative group" }, h('img', { src: v.thumbnailUrl || `https://picsum.photos/100/60?grayscale&random=${i}`, alt: `Training ${i + 1}`, className: "rounded-md shadow-sm w-full" }), h('div', { className: "absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity" }, h(PlayIcon, { className: "w-8 h-8 text-white" }))))
                )
            ));
        }
        if (isVisible.documentation && tile.documentation) { content.push(h('div', { key: 'docs', className: "mt-4 pt-2 border-t" }, h('h4', { className: "font-semibold text-lg mb-2 text-left", style: { color: labelColor } }, "Documentation:"), h('a', { href: tile.documentation, target: "_blank", rel: "noopener noreferrer", className: "inline-block p-2 rounded-full bg-gray-100 hover:bg-gray-200" }, h(FolderIcon)))); }
        const renderLinks = (list: any, title: string, colorClass: string, key: string) => {
            if (isVisible[key] && list && list.length > 0) {
                return h('div', { key: key, className: "mt-4 pt-2 border-t" }, h('h4', { className: "font-semibold text-lg mb-2 text-left", style: { color: labelColor } }, title), h('div', { className: "flex flex-wrap gap-2" }, list.map((l: any, i: number) => h('a', { key: i, href: l.url, target: "_blank", rel: "noopener noreferrer", className: `px-3 py-1 ${colorClass} text-white rounded-md hover:opacity-90 text-lg shadow` }, l.name))));
            } return null;
        }
        content.push(renderLinks(tile.links, "Links:", "bg-blue-500", "links"));
        content.push(renderLinks(tile.resources, "Resources:", "bg-green-500", "resources"));
        if (isVisible.internalLinks && tile.internalLinks && tile.internalLinks.length > 0) { content.push(h('div', { key: "internal", className: "mt-4 pt-2 border-t" }, h('h4', { className: "font-semibold text-lg mb-2 text-left", style: { color: labelColor } }, "Internal Links:"), h('div', { className: "flex flex-wrap gap-2" }, tile.internalLinks.map((l: any, i: number) => h('button', { key: i, onClick: (e: any) => { e.stopPropagation(); onNavigateToTile(l.targetTileId) }, className: "px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-lg shadow" }, l.name))))); }

        const heightAspectClass = useLogoBg ? 'aspect-square' : isSimpleButtonTile ? 'aspect-square sm:aspect-auto' : 'sm:min-h-[450px]';
        const tileClasses = `rounded-lg shadow-lg flex flex-col relative transition-transform duration-150 w-full cursor-pointer hover:scale-105 ${heightAspectClass} ${isSimpleButtonTile ? "" : "justify-between"} ${isAnimating ? "tile-highlight-pulse" : ""}`;

        return h('div', { ref: tileRef, className: tileClasses, style: tileStyle, onClick: mainClickAction },
            tile.workflow?.nextTileId && isVisible.workflow && h('button', {
                onClick: (e: any) => {
                    e.stopPropagation();
                    onNavigateToTile(tile.workflow.nextTileId);
                },
                className: "absolute top-2 right-2 z-30 p-2 bg-white/70 backdrop-blur-sm rounded-full text-blue-600 hover:bg-white hover:text-blue-800 shadow-md transition-all",
                "aria-label": "Go to next tile"
            }, h(NextArrowIcon, { className: "h-5 w-5" })),
            h('div', { className: `relative flex flex-col flex-grow ${useLogoBg ? 'p-12' : 'p-4'}` },
                h('div', { className: `flex-grow ${isSimpleButtonTile ? 'flex flex-col items-center justify-center text-center' : ''}` }, ...content)
            )
        );
    };

    const DeployedApp = forwardRef(({ initialAccessTags = [], _internalOnTileClick = (_tile: any) => { }, _internalOnNavigate = (_data: any) => { }, _internalOnReady = () => { } }: any, ref: any) => {
        const [currentLanguage, setCurrentLanguage] = useState('en');
        const [currentPath, setCurrentPath] = useState([] as string[]);
        const [history, setHistory] = useState([[]] as string[][]);
        const [videoUrl, setVideoUrl] = useState(null);
        const [accessTags, setAccessTags] = useState(initialAccessTags);
        const [highlightedTileId, setHighlightedTileId] = useState(null);

        const allTiles = useMemo(() => {
            const tileMap = new Map();
            const processTiles = (tiles: any[]) => { tiles.forEach(t => { tileMap.set(t.id, t); if (t.children) processTiles(t.children); }); };
            processTiles(siteData.tiles);
            return tileMap;
        }, []);

        const findTileById = useCallback((id: string) => allTiles.get(id), [allTiles]);

        const findPathToTile = (id: string, tiles: any[] = siteData.tiles, path: string[] = []): any => {
            for (const tile of tiles) {
                const newPath = [...path, tile.id];
                if (tile.id === id) return newPath;
                if (tile.children) {
                    const found = findPathToTile(id, tile.children, newPath);
                    if (found) return found;
                }
            }
            return null;
        };

        const handleNavigateToChildren = useCallback((tileId: string) => {
            const newPath = [...currentPath, tileId];
            setCurrentPath(newPath);
            setHistory((prev: string[][]) => [...prev, newPath]);
            _internalOnNavigate({ path: newPath, tile: findTileById(tileId) });
        }, [currentPath, _internalOnNavigate, findTileById]);

        const handleNavigateToTile = useCallback((tileId: string) => {
            const path = findPathToTile(tileId);
            if (path) {
                const parentPath = path.slice(0, -1);
                setCurrentPath(parentPath);
                setHistory((prev: string[][]) => [...prev, parentPath]);
                setHighlightedTileId(tileId);
                _internalOnNavigate({ path: parentPath, tile: findTileById(parentPath[parentPath.length - 1] || tileId) });
            } else { console.warn(`Tile not found: ${tileId}`); }
        }, [findPathToTile, _internalOnNavigate, findTileById]);

        const handleHighlightComplete = useCallback(() => {
            setHighlightedTileId(null);
        }, []);

        const handleGoToPrevious = useCallback(() => {
            if (history.length <= 1) return;
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            const newPath = newHistory[newHistory.length - 1] || [];
            setCurrentPath(newPath);
            _internalOnNavigate({ path: newPath, tile: findTileById(newPath[newPath.length - 1]) });
        }, [history, _internalOnNavigate, findTileById]);

        const handleGoHome = useCallback(() => { setCurrentPath([]); setHistory((prev: string[][]) => [...prev, []]); _internalOnNavigate({ path: [], tile: null }); }, [_internalOnNavigate]);
        const handlePlayVideo = useCallback((url: string) => { if (!url) return; const embedUrl = getEmbedUrl(url); if (embedUrl) { setVideoUrl(embedUrl); } else { window.open(url, '_blank', 'noopener,noreferrer'); } }, []);
        const handleCloseVideo = useCallback(() => setVideoUrl(null), []);
        const isTileVisible = useCallback((tile: any) => { if (!tile.accessTags || tile.accessTags.length === 0) return true; if (tile.accessTags.includes('all')) return true; if (accessTags.length === 0) return false; return tile.accessTags.some((tag: string) => accessTags.includes(tag)); }, [accessTags]);

        const getTilesToDisplay = useCallback(() => {
            let tiles = siteData.tiles;
            if (currentPath.length > 0) {
                let currentParent = findTileById(currentPath[currentPath.length - 1]);
                if (!currentParent || !currentParent.children) { setCurrentPath([]); setHistory([[]]); _internalOnNavigate({ path: [], tile: null }); return siteData.tiles.filter(isTileVisible); }
                tiles = currentParent.children;
            }
            return tiles.filter(isTileVisible);
        }, [currentPath, findTileById, siteData.tiles, isTileVisible, _internalOnNavigate]);

        useImperativeHandle(ref, () => ({
            navigateToTile: (id: string) => { handleNavigateToTile(id); },
            navigateToHome: () => { handleGoHome(); },
            goBack: () => { handleGoToPrevious(); },
            getCurrentPath: () => currentPath,
            setAccessTags: (tags: string[]) => { if (Array.isArray(tags)) setAccessTags(tags.map(String)); else console.error('setAccessTags expects an array of strings.'); },
        }));

        useEffect(() => { _internalOnReady(); }, [_internalOnReady]);

        const sanitizedHeader = useMemo(() => sanitizeHTML(siteData.translations[siteData.headerContentKey]?.[currentLanguage as 'en' | 'es'] || siteData.translations[siteData.headerContentKey]?.en || ''), [siteData.headerContentKey, siteData.translations, currentLanguage]);
        // const sanitizedFooter = useMemo(() => sanitizeHTML(siteData.translations[siteData.footerContentKey]?.en || ''), [siteData.footerContentKey, siteData.translations]);
        const tilesToDisplay = getTilesToDisplay();

        const header = h('header', { className: "bg-white shadow-md py-4 md:py-6 mb-10" },
            h('div', { className: "w-full px-4 sm:px-6 grid grid-cols-3 items-center gap-4" },
                h('div', { className: "flex items-center space-x-2 justify-self-start" },
                    history.length > 1 && h('button', { onClick: handleGoToPrevious, className: "text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xl p-2 rounded-md" }, h(PreviousArrowIcon), h('span', { className: "ml-2 hidden sm:inline" }, "Previous")),
                    currentPath.length > 0 && h('button', { onClick: handleGoHome, className: "text-blue-600 hover:text-blue-800 transition-colors flex items-center text-xl p-2 rounded-md" }, h(HomeIcon), h('span', { className: "ml-2 hidden sm:inline" }, "Home"))
                ),
                h('div', { className: "min-w-0 text-center col-start-2 site-header-content", dangerouslySetInnerHTML: { __html: sanitizedHeader } }),
                h('div', { className: "justify-self-end flex items-center space-x-3" },
                    h('select', {
                        value: currentLanguage,
                        onChange: (e: any) => setCurrentLanguage(e.target.value),
                        className: "bg-white border border-gray-300 text-sm font-semibold text-gray-700 py-1.5 px-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    },
                        h('option', { value: 'en' }, 'English'),
                        h('option', { value: 'es' }, 'Español')
                    ),
                    siteData.helpTileId && h('button', { onClick: () => handleNavigateToTile(siteData.helpTileId), className: "px-4 py-2 bg-blue-100 text-blue-700 rounded-lg shadow font-semibold hover:bg-blue-200" }, "Help")
                )
            )
        );
        const main = h('main', { className: "container mx-auto px-6" }, h('div', { className: "mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" }, tilesToDisplay.length === 0 ? h('p', { className: "text-gray-600 text-center text-lg p-8 col-span-full" }, "No tiles available for your access level.") : tilesToDisplay.map((tile: any) => h(DeployedTileDisplay, { key: tile.id, currentLanguage: currentLanguage, tile, onNavigateToChildren: handleNavigateToChildren, onNavigateToTile: handleNavigateToTile, onPlayVideo: handlePlayVideo, _internalOnTileClick, isHighlighted: tile.id === highlightedTileId, onHighlightComplete: handleHighlightComplete }))));
        // Footer removed for deployment as per user request
        // const footer = h('footer', { className: "bg-gray-800 text-white py-8 mt-16" }, h('div', { className: "container mx-auto px-6 text-center", dangerouslySetInnerHTML: { __html: sanitizedFooter } }));

        return h(ErrorBoundary, null,
            h('div', { className: "p-0 m-0 bg-gray-100 font-sans", style: { fontFamily: "'Inter', sans-serif" } },
                header, main, // footer removed
                videoUrl && h(DeployedVideoPlayer, { url: videoUrl, onClose: handleCloseVideo })
            )
        );
    });

    return DeployedApp;
};

export const generateDeploymentHtml = (siteData: SiteData): string => {
    const siteDataJson = JSON.stringify(siteData);
    const defaultIsVisibleJson = JSON.stringify(defaultTileProperties.isVisible);
    const appLogicString = deployedAppLogic.toString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteData.translations[siteData.siteNameKey]?.en || 'Site'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script>
        ${domPurifySource}
    </script>
    <style>
      body { font-family: 'Inter', sans-serif; }
      .site-header-content > h1 { line-height: 1.1; margin-bottom: 0; }
      .site-header-content > p { margin-top: 0.1rem; font-size: 0.9rem; color: #4B5563; line-height: 1.2; }
      @keyframes pulse-glow {
        0% { box-shadow: 0 0 0 0px rgba(217, 119, 6, 0.7); }
        50% { box-shadow: 0 0 0 12px rgba(217, 119, 6, 0); }
        100% { box-shadow: 0 0 0 0px rgba(217, 119, 6, 0); }
      }
      .tile-highlight-pulse { animation: pulse-glow 7.5s ease-out; }
    </style>
</head>
<body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <script type="text/javascript">
        (() => {
            const siteData = ${siteDataJson};
            const defaultIsVisible = ${defaultIsVisibleJson};
            const DeployedApp = (${appLogicString})(React, siteData, defaultIsVisible);
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(DeployedApp, {}));
        })();
    </script>
</body>
</html>`;
};


export const generateComponentJavaScript = (siteData: SiteData): string => {
    const siteDataJson = JSON.stringify(siteData);
    const defaultIsVisibleJson = JSON.stringify(defaultTileProperties.isVisible);
    const appLogicString = deployedAppLogic.toString();

    return `
(() => {
    const siteData = ${siteDataJson};
    const defaultIsVisible = ${defaultIsVisibleJson};
    let DeployedApp = null; // Lazily initialized on first connect

    class NestedSiteViewerElement extends HTMLElement {
        #reactRoot = null;
        #reactRef = null;
        #mountPoint = null;

        constructor() {
            super();
            // Shadow DOM removed to allow Tailwind CSS to apply
        }
        
        #renderError(title, message, instructions) {
            const errorContainer = document.createElement('div');
            errorContainer.style.cssText = 'background-color: #fff5f5; color: #c53030; border: 2px solid #f56565; border-radius: 8px; padding: 24px; margin: 16px; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";';
            
            const errorTitleEl = document.createElement('h3');
            errorTitleEl.style.cssText = 'margin: 0 0 12px 0; font-size: 1.25rem; font-weight: 600; color: #9b2c2c;';
            errorTitleEl.textContent = title;

            const errorMessageEl = document.createElement('p');
            errorMessageEl.style.cssText = 'margin: 0 0 16px 0; line-height: 1.5;';
            errorMessageEl.textContent = message;
            
            const errorInstructionsEl = document.createElement('code');
            errorInstructionsEl.style.cssText = 'display: block; background-color: #fed7d7; padding: 12px; border-radius: 4px; font-family: Consolas, monaco, "Andale Mono", "Ubuntu Mono", monospace; font-size: 0.875rem; white-space: pre-wrap; word-break: break-all;';
            errorInstructionsEl.textContent = instructions;

            errorContainer.appendChild(errorTitleEl);
            errorContainer.appendChild(errorMessageEl);
            errorContainer.appendChild(errorInstructionsEl);
            
            while (this.firstChild) { this.removeChild(this.firstChild); }
            this.appendChild(errorContainer);
        }

        connectedCallback() {
            if (!DeployedApp) {
                // 1. Inject React if missing
                if (!window.React) {
                    const script = document.createElement('script');
                    script.textContent = ${JSON.stringify(reactSource)};
                    document.head.appendChild(script);
                }

                // 2. Inject ReactDOM if missing
                if (!window.ReactDOM) {
                    const script = document.createElement('script');
                    script.textContent = ${JSON.stringify(reactDomSource)};
                    document.head.appendChild(script);
                }

                // 3. Inject Tailwind if missing
                if (!window.tailwind) {
                    const script = document.createElement('script');
                    script.textContent = ${JSON.stringify(tailwindSource)};
                    document.head.appendChild(script);
                }

                DeployedApp = (${appLogicString})(window.React, siteData, defaultIsVisible);
                this.#reactRef = window.React.createRef();
            }

            if (this.#mountPoint) return;
            
            this.#mountPoint = document.createElement('div');
            this.#mountPoint.style.height = '100%';
            this.#mountPoint.style.width = '100%';
            this.#mountPoint.style.overflow = 'auto';
            
            const fontsLink1 = document.createElement('link');
            fontsLink1.rel = 'preconnect';
            fontsLink1.href = 'https://fonts.googleapis.com';
            
            const fontsLink2 = document.createElement('link');
            fontsLink2.rel = 'preconnect';
            fontsLink2.href = 'https://fonts.gstatic.com';
            fontsLink2.crossOrigin = 'anonymous';

            const fontsLink3 = document.createElement('link');
            fontsLink3.rel = 'stylesheet';
            fontsLink3.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';

            const domPurifyScript = document.createElement('script');
            domPurifyScript.textContent = ${JSON.stringify(domPurifySource)};

            const style = document.createElement('style');
            style.textContent = \`
                :host { display: block; }
                .site-header-content > h1 { line-height: 1.1; margin-bottom: 0; }
                .site-header-content > p { margin-top: 0.1rem; font-size: 0.9rem; color: #4B5563; line-height: 1.2; }
                @keyframes pulse-glow {
                  0% { box-shadow: 0 0 0 0px rgba(217, 119, 6, 0.7); }
                  50% { box-shadow: 0 0 0 12px rgba(217, 119, 6, 0); }
                  100% { box-shadow: 0 0 0 0px rgba(217, 119, 6, 0); }
                }
                .tile-highlight-pulse { animation: pulse-glow 7.5s ease-out; }
            \`;
            
            this.appendChild(fontsLink1);
            this.appendChild(fontsLink2);
            this.appendChild(fontsLink3);
            this.appendChild(domPurifyScript);
            this.appendChild(style);
            this.appendChild(this.#mountPoint);
            
            this.#reactRoot = window.ReactDOM.createRoot(this.#mountPoint);

            const initialAccessTags = (this.getAttribute('data-access-tags') || '').split(',').map(t => t.trim()).filter(Boolean);
            
            const props = {
                ref: this.#reactRef,
                initialAccessTags: initialAccessTags,
                _internalOnTileClick: (tile) => this.dispatchEvent(new CustomEvent('tileClicked', { detail: { tileId: tile.id, tileName: siteData.translations[tile.nameKey]?.en || 'Tile', tile } })),
                _internalOnNavigate: (data) => this.dispatchEvent(new CustomEvent('navigationChanged', { detail: { currentPath: data.path, currentParentTile: data.tile } })),
                _internalOnReady: () => this.dispatchEvent(new CustomEvent('componentReady', { bubbles: true, composed: true, detail: { component: this } }))
            };
            
            this.#reactRoot.render(window.React.createElement(DeployedApp, props));
        }

        disconnectedCallback() {
            if (this.#reactRoot) {
                this.#reactRoot.unmount();
                this.#reactRoot = null;
                this.#mountPoint = null; // Reset mount point
            }
        }

        setAccessTags(tags) {
            if (this.#reactRef && this.#reactRef.current && typeof this.#reactRef.current.setAccessTags === 'function') {
                this.#reactRef.current.setAccessTags(tags);
            } else {
                console.warn('Cannot setAccessTags: component is not ready or API is not available.');
            }
        }

        navigateToHome() {
            if (this.#reactRef && this.#reactRef.current && typeof this.#reactRef.current.navigateToHome === 'function') {
                this.#reactRef.current.navigateToHome();
            } else {
                 console.warn('Cannot navigateToHome: component is not ready or API is not available.');
            }
        }
        
        goBack() {
            if (this.#reactRef && this.#reactRef.current && typeof this.#reactRef.current.goBack === 'function') {
                this.#reactRef.current.goBack();
            } else {
                 console.warn('Cannot goBack: component is not ready or API is not available.');
            }
        }

        navigateToTile(tileId) {
            if (this.#reactRef && this.#reactRef.current && typeof this.#reactRef.current.navigateToTile === 'function') {
                this.#reactRef.current.navigateToTile(tileId);
            } else {
                 console.warn('Cannot navigateToTile: component is not ready or API is not available.');
            }
        }
    }

    if (!customElements.get('nested-site-viewer')) {
        customElements.define('nested-site-viewer', NestedSiteViewerElement);
    }
})();

${deploymentControllerSource}
`;
};