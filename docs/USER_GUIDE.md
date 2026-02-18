# Nested Site Builder - User Guide

## Introduction
The **Nested Site Builder** is a powerful, visual tool designed to help you organize and present complex information in a simple, hierarchical structure. Instead of traditional web pages, you build your site using **Tiles**. Each tile can contain information (videos, links, documents) and can also lead to a deeper level of sub-tiles.

This "drill-down" approach makes it perfect for:
- Employee Training Portals
- Knowledge Bases
- Interactive Site Maps
- Educational Course Structure

## Getting Started

### Accessing the Builder
Open the application in your web browser. You will see the main dashboard with options to create a new site, edit the current one, or import an existing site configuration.

### The Two Modes
1.  **Builder Mode**: This is where you create content. You can add, edit, delete, and reorder tiles. You will see "Add New Tile" buttons and edit icons.
2.  **Preview Site**: This shows you exactly what your end-users will see. Use this to test the navigation and user experience.

## Core Concepts

### Tiles
A **Tile** is the fundamental building block. It represents a topic or a category.
- **Visuals**: A tile has a title, description, and can have a background color, an image logo, or a background image.
- **Content**: You can attach training videos, external links, resource documents, and internal links to other parts of the site.
- **Hierarchy**: A tile can be a "parent," meaning if you click it, you go deeper into a new level of "child" tiles.

### Navigation
- **Drill Down**: Click a tile to enter it.
- **Breadcrumbs**: The top bar shows your current location (e.g., Home > Human Resources > Onboarding).
- **Home Button**: Quickly return to the top level.
- **Previous Button**: Go back one step.

## Step-by-Step Instructions

### 1. Creating a New Site
1.  Click the **New Site** button (Red).
2.  Confirm that you want to start fresh (make sure to save your current work first!).
3.  Enter your **Site Name** and customize the Header/Footer text.

### 2. Adding and Editing Tiles
To add a tile:
1.  Ensure you are in **Builder Mode**.
2.  Click **Add New Tile**.
3.  A new tile appears. Click the **Edit (Pencil)** icon on the tile.

In the **Tile Editor**, you can configure:
-   **General**: Name and Description.
-   **Appearance**: Background color, font, and logo.
-   **Content**:
    -   **Overview Video**: A main video for this topic (YouTube URL).
    -   **Training Videos**: A list of additional tutorial videos.
    -   **Links & Resources**: URLs to external sites or documents.
    -   **Internal Links**: Shortcuts to other tiles in your site.
-   **Visibility**: Toggle what elements (Description, Quick Links, etc.) are shown on the card.
-   **Access Control**: Add tags (e.g., `admin`, `staff`) to restrict visibility (requires integration with an auth system).

### 3. Using AI Features
The builder has built-in AI tools to speed up creation. Look for the **Sparkles**, **Film**, or **Photo** icons in the editor:
-   **Generate Name/Description**: Enter a rough idea, and AI will write polished text for you.
-   **Find Video**: Describe a topic, and AI will find a relevant YouTube video and thumbnail.
-   **Generate Logo**: Describe an image, and AI will create a custom logo/icon.
-   **AI Designer**: Describe a mood (e.g., "Corporate Professional"), and AI will suggest color schemes and fonts.

### 4. Building the Hierarchy (Nesting)
To create sub-sections:
1.  In Builder Mode, locate the parent tile (e.g., "HR").
2.  Click the **Folder (Open)** icon on that tile.
3.  You are now "inside" that tile.
4.  Click **Add New Tile** here to create children (e.g., "Benefits", "Payroll").

### 5. Managing Templates
If you have a tile layout you use often:
1.  Edit the tile.
2.  Click **Save as New Template**.
3.  Index future, you can instantly create a matching tile by selecting it from the "Add from Template..." dropdown or applying it inside the editor.

## Saving and Sharing

### Auto-Save
The application automatically saves your changes to your browser's local storage. You won't lose work if you refresh the page.

### Backing Up (Export JSON)
**Crucial Step**: To safely back up your work or move it to another computer:
1.  Click **Save JSON** (Purple).
2.  This downloads a `.json` file containing your entire site structure.
3.  Use **Import JSON** (Yellow) to restore it later.

### Publishing (Deployment)
To share your site with others, you have two options:
1.  **Deploy HTML** (Teal): Downloads a single `.html` file. You can email this file or upload it to any file server. It works immediately in any browser.
2.  **Deploy Component** (Indigo): Downloads a JavaScript file for developers to embed into existing React applications.

## Troubleshooting

-   **Videos not playing**: Ensure the YouTube URL is public. Some videos restricts embedding.
-   **Changes lost**: If you cleared your browser cache, your local saves might be gone. Always use **Save JSON** for permanent backups.
-   **AI Errors**: Check your internet connection. AI features require an active connection to Google's Gemini API.
