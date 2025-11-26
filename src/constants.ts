
import type { SiteData, TileProperties } from './types';

// Default properties for a new tile
export const defaultTileProperties: TileProperties = {
    name: 'New Tile',
    description: 'A brief description for this tile.',
    color: '#FFFFFF', // Default to white background for new tiles
    font: 'Inter',
    logoUrl: '',
    useLogoAsBackground: false,
    overviewVideo: '',
    thumbnailUrl: '', // Thumbnail for the OVERVIEW video
    trainingVideos: [], // Now an array of { url, thumbnailUrl } objects
    documentation: '',
    links: [],
    resources: [],
    internalLinks: [],
    accessTags: [], // Tiles are public by default
    isVisible: {
        name: true,
        logo: true,
        description: true,
        color: true,
        font: false,
        overviewVideo: true,
        trainingVideos: true,
        documentation: true,
        links: true,
        resources: true,
        internalLinks: true,
        workflow: true,
    }
};

// Default site-wide properties
export const defaultSiteProperties: SiteData = {
    siteName: 'My Nested Site',
    headerContent: '<h1 class="text-3xl md:text-4xl font-bold text-blue-600">My Custom Site Title</h1><p class="text-lg text-gray-600 mt-1">My custom tagline here!</p>',
    footerContent: `<p>&copy; ${new Date().getFullYear()} My Custom Company. All rights reserved.</p>`,
    tiles: [],
    templates: []
};