# Nested Site Viewer: Host Integration Guide

This document provides technical instructions for embedding the `<nested-site-viewer>` web component into an external host website.

## 1. Overview

The Nested Site Viewer is a self-contained JavaScript web component that renders a complete, interactive tile-based microsite.

*   **Technology:** Custom Elements (Web Components) + Shadow DOM.
*   **Dependencies:** None (React, ReactDOM, and Tailwind CSS are bundled internally and auto-injected if missing).
*   **Isolation:** Styles are encapsulated within the Shadow DOM and will not bleed into or be affected by the host site's CSS.

## 2. Implementation Steps

### Step A: Host the Script

The component script file (e.g., `my-site.js`) must be hosted on a web server accessible to the public internet or your internal network.

*   **Do not** paste the script code directly into your HTML.
*   **Do** upload the `.js` file to your CMS media library, CDN (S3/Cloudflare), or static assets folder.

### Step B: Embed in HTML

Add the following two lines to the HTML of the page where you want the site to appear.

**1. Load the Script**
Place this line anywhere on the page (commonly before the closing `</body>` tag). Replace `[URL_TO_SCRIPT]` with the actual URL from Step A.

```html
<script src="[URL_TO_SCRIPT]" defer></script>
```

**2. Place the Component**
Insert the custom element tag exactly where you want the microsite to render.

```html
<nested-site-viewer></nested-site-viewer>
```

### Step C: Styling the Container (Optional)

The component fills 100% of the width and height of its container. You can control its dimensions using standard CSS on the host page.

```css
nested-site-viewer {
  display: block;
  width: 100%;
  height: 800px; /* Or use vh units, e.g., 80vh */
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
```

## 3. Access Control (User Permissions)

If the nested site contains protected content, you can control visibility by passing the current user's roles or tags to the component.

### Method 1: Static Attribute (Server-Side Rendering)

If you know the user's roles at the time the HTML is generated (e.g., PHP, ASP.NET), output them as a comma-separated string in the `data-access-tags` attribute.

```html
<nested-site-viewer data-access-tags="admin,staff,premium"></nested-site-viewer>
```

### Method 2: Dynamic JavaScript (Single Page Apps)

If you load user permissions asynchronously (e.g., after an API call), set the tags programmatically.

**Important:** You must wait for the `componentReady` event before calling methods.

```javascript
const viewer = document.querySelector('nested-site-viewer');

// 1. Listen for the component to initialize
viewer.addEventListener('componentReady', () => {
    console.log('Viewer is ready');
    
    // 2. Fetch your user roles (Example logic)
    const userRoles = ['admin', 'editor'];
    
    // 3. Pass roles to the component
    viewer.setAccessTags(userRoles);
});
```

## 4. API Reference

The component exposes a JavaScript API for deeper integration.

| Method | Description |
| :--- | :--- |
| `setAccessTags(['tag1', 'tag2'])` | Updates the list of authorized tags. Hides/Shows tiles accordingly. |
| `navigateToHome()` | Resets the view to the root level. |
| `goBack()` | Navigates up one level in the history. |
| `navigateToTile('tile-id')` | Deep links to a specific tile view. |

| Event | Description |
| :--- | :--- |
| `componentReady` | Fired when the component is fully loaded and API is available. |
| `tileClicked` | Fired when a user clicks a tile. Detail: `{ tileId, tileName }` |
| `navigationChanged` | Fired when the view changes. Detail: `{ currentPath }` |

## 5. Troubleshooting

*   **Component is blank:** Check the browser console (F12). If you see "404 Not Found," verify the URL in the `<script src="...">` tag.
*   **Tiles are missing:** Ensure the `data-access-tags` match the tags defined in the Builder exactly (case-sensitive).
*   **Layout issues:** Ensure the `<nested-site-viewer>` tag has a defined height in your CSS, otherwise it may collapse to 0px.
