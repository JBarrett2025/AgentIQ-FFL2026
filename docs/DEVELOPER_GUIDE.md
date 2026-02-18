# Nested Site Builder - Developer Guide

## Project Overview
The **Nested Site Builder** is a client-side Single Page Application (SPA) built with the modern React ecosystem. It allows users to visually construct hierarchical content structures and export them as portable artifacts.

### Key Technologies
-   **Framework**: React 19 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **AI Integration**: Google Generative AI SDK (Gemini)
-   **Sanitization**: DOMPurify

## Setup and Installation

### Prerequisites
-   Node.js (v18 or higher recommended)
-   npm or yarn

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Environment Variables
To enable AI features, you need a Google Gemini API key.
1.  Create a `.env` file in the root directory.
2.  Add your key:
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    ```

### Running Locally
Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## Architecture

### Directory Structure
```
src/
├── components/       # UI Components
│   ├── TileEditor.tsx    # detailed form for editing tiles
│   ├── TileDisplay.tsx   # card component for individual tiles
│   ├── SitePreviewer.tsx # recursive renderer for the final view
│   └── ...
├── utils/            # Helper logic
│   ├── aiUtils.ts        # Gemini API integration
│   ├── deployment.ts     # HTML/JS generation logic for exports
│   └── tileUtils.ts      # Tree traversal and manipulation helpers
├── types.ts          # TypeScript interfaces (SiteData, Tile, etc.)
└── App.tsx           # Main state manager and router
```

### Data Model
The entire site is stored as a single JSON object (`SiteData`).
-   **SiteData**: Root object containing site-wide settings and the top-level `tiles` array.
-   **Tile**: Recursive structure.
    ```typescript
    interface Tile {
        id: string;
        name: string;
        children: Tile[]; // Nested array for hierarchy
        // ... content fields (video, links, etc.)
    }
    ```

### State Management
-   **Local State**: `App.tsx` holds the "source of truth" in a massive state object.
-   **Persistence**: `localStorage` is subscribed to state changes to prevent data loss.
-   **Exporting**: The `deployment.ts` utility serializes the current `SiteData` and injects it into a template string to create the standalone HTML export.

## Customization

### Adding New Content Fields
1.  Update `Tile` interface in `src/types.ts`.
2.  Update `defaultTileProperties` in `src/constants.ts`.
3.  Add input fields to `src/components/TileEditor.tsx`.
4.  Update `src/components/TileDisplay.tsx` to render the new field.

### Modifying the Exported Site
The logic for the "Deploy HTML" feature is in `src/utils/deployment.ts`. This file contains a string template of the runtime (a mini-React app or vanilla JS implementation) that gets embedded into the downloaded HTML. If you change the main look and feel, remember to update the deployment template to match.

## Building for Production
To build the builder tool itself (not an exported site):
```bash
npm run build
```
The output will be in the `dist` directory.

## Contributing
-   **Linting**: Run `npm run lint` to check for code issues.
-   **formatting**: Ensure consistent code style before committing.
