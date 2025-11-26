
export const darkenColor = (hex: string, percent: number): string => {
    if (!hex || typeof hex !== 'string') return '#cccccc'; // Return a default gray for invalid input
    
    // Remove #
    hex = hex.replace(/^#/, '');

    // Handle 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    if (hex.length !== 6) {
        return '#cccccc'; // Return default gray if still invalid
    }

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const factor = 1 - percent / 100;
    r = Math.floor(r * factor);
    g = Math.floor(g * factor);
    b = Math.floor(b * factor);

    r = Math.max(0, r);
    g = Math.max(0, g);
    b = Math.max(0, b);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
