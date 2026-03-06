
import type { SiteData, TileProperties } from './types';

// Default properties for a new tile
export const defaultTileProperties: TileProperties = {
    nameKey: 'default_tile_name',
    internalName: '',
    descriptionKey: 'default_tile_description',
    color: '#FFFFFF', // Default to white background for new tiles
    font: 'Verdana',
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
    siteNameKey: 'default_site_name',
    headerContentKey: 'default_header_content',
    footerContentKey: 'default_footer_content',
    translations: {
        'default_site_name': { en: 'My Nested Site', es: 'Mi Sitio Anidado' },
        'default_header_content': { en: '<h1 class="text-3xl md:text-4xl font-bold text-blue-600">My Custom Site Title</h1><p class="text-lg text-gray-600 mt-1">My custom tagline here!</p>', es: '<h1 class="text-3xl md:text-4xl font-bold text-blue-600">Título de Mi Sitio</h1><p class="text-lg text-gray-600 mt-1">¡Mi eslogan personalizado aquí!</p>' },
        'default_footer_content': { en: `<p>&copy; ${new Date().getFullYear()} My Custom Company. All rights reserved.</p>`, es: `<p>&copy; ${new Date().getFullYear()} Mi Empresa. Todos los derechos reservados.</p>` },
        'default_tile_name': { en: 'New Tile', es: 'Nuevo Mosaico' },
        'default_tile_description': { en: 'A brief description for this tile.', es: 'Una breve descripción para este mosaico.' }
    },
    tiles: [],
    templates: []
};