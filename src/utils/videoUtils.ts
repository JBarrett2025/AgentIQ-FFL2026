
export const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;

    // Robust regex for YouTube: captures ID from watch, youtu.be, embed, and shorts links
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);

    // Robust regex for Vimeo: captures ID from standard and player links
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (youtubeMatch && youtubeMatch[1]) {
        // For simple iframe embedding, origin is a critical security feature.
        const origin = window.location.origin;
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?origin=${encodeURIComponent(origin)}`;
    } 
    
    if (vimeoMatch && vimeoMatch[1]) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    // Fallback for URLs that might already be embed links but are missing the origin
    if (url.includes('youtube.com/embed/') && !url.includes('origin=')) {
        const origin = window.location.origin;
        return `${url}${url.includes('?') ? '&' : '?'}origin=${encodeURIComponent(origin)}`;
    }

    // If it's not a recognized YouTube or Vimeo URL, we can't guarantee it can be embedded.
    // Returning the original URL might work for some services, but returning null is safer
    // to prevent trying to embed unsupported content. For this app, we will return the URL
    // and let the iframe attempt to load it.
    return url;
};

export const getThumbnailUrl = async (url: string): Promise<string | null> => {
    if (!url) return null;

    // Robust regex for YouTube, same as getEmbedUrl
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);

    if (youtubeMatch && youtubeMatch[1]) {
        // Return the standard high-quality YouTube thumbnail URL
        return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
    }

    // Robust regex for Vimeo, same as getEmbedUrl
    const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);

    if (vimeoMatch) {
        try {
            // Use the original full URL for the oEmbed API call for better accuracy
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json();
                return data.thumbnail_url_with_play_button || data.thumbnail_url;
            }
        } catch (error) {
            console.error("Error fetching Vimeo thumbnail for URL:", url, error);
            return null;
        }
    }

    return null; // Return null if not a recognized or supported video URL
};