// We use the ?raw suffix to tell Vite to load these files as text strings
// instead of trying to execute them. This avoids all syntax errors.
import reactRaw from './vendor/react.js?raw';
import reactDomRaw from './vendor/react-dom.js?raw';
import tailwindRaw from './vendor/tailwind.js?raw';
import domPurifyRaw from './Vendor/dompurify.js?raw';

export const reactSource = reactRaw;
export const reactDomSource = reactDomRaw;
export const tailwindSource = tailwindRaw;
export const domPurifySource = domPurifyRaw;