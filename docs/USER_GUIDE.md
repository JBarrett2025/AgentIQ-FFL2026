# Nested Site Builder - User Guide

Welcome to the **Nested Site Builder**! This guide will walk you through the core features of the web application, explaining what each button and section does from a user's perspective. Our builder helps you create, organize, and share multi-layered menus and content structures effortlessly.

---

## 1. Dashboard (The Home Screen)

When you first log in, you will be taken to your **Dashboard**. This is the control center where you manage all your projects.

### Local Offline Project
- **Open Local Project**: This opens an offline project that is saved directly within your browser. Changes here do not sync to the cloud, making it perfect for private exploration or testing out ideas without affecting live data.

### Cloud Projects
- **Create New Cloud Project**: Starts a brand new collaborative project that is saved to the cloud. You will be prompted to give it a name.
- **Share (Button in a project row)**: Allows you to invite other users to view and edit your project in real-time by entering their email address.
- **Archive / Restore**: Hides a project from your main active list (Archive) or brings it back (Restore) when you need it again. **Note:** Archiving does not delete the project.
- **View Archived Projects / Active Projects**: Toggles the list to show either your currently active projects or the ones you have put away into the archive.
- **Shared Dropdown List**: If you have shared a project, you'll see a dropdown that lists the email addresses of all the collaborators currently shared on that project.

---

## 2. Global Navigation (Top Bar)

Once inside a project, you'll see a navigation bar at the top of your screen. This helps you move through the layers of your site.

- **← Dashboard**: Returns you to the main Dashboard screen.
- **Previous (Left Arrow)**: Moves you up one level in your nested site structure (like the "Back" button in a folder).
- **Home (House Icon)**: Takes you instantly back to the very top or root level of your site, no matter how deep you have navigated.

---

## 3. The Builder Tools (Action Bar)

In the middle of your screen, you'll find the primary toolkit for managing the overall website data and behavior.

- **Builder Mode / Preview Site (Toggle)**: 
  - *Builder Mode* allows you to edit the site's structure, add tiles, and change settings.
  - *Preview Site* lets you browse your site exactly as a visitor would see it, hiding the editing controls.
- **New Site**: Wipes the current site completely to let you start fresh. *Be careful: If you haven't saved your work, it will be lost!*
- **Edit Site**: Opens a window to change your global site details, such as the Site Name, Header text, and Footer text.
- **Import JSON**: Allows you to upload a previously downloaded backup file (`.json`) from your computer to restore a past version of your site.
- **Save JSON**: Downloads a backup file (`.json`) of your current site to your computer. It is highly recommended to do this regularly to keep a hard copy of your work!
- **Force AI Clean Up**: Automatically translates any missing text into Spanish (or your target language) using our AI integration. Ideal when you've just typed a lot of new content.
- **Deploy HTML**: Exports your entire structured site as a single, fully functional webpage (`.html`) file that can be opened in any browser or hosted anywhere.
- **Deploy Component**: Exports your site as a JavaScript component file for software developers to plug directly into larger applications.
- **Preview Language (Dropdown)**: Switches your working language. Because Nested Site Builder is multi-lingual by default, you can seamlessly construct your site in English (EN) and Spanish (ES) at the same time.

---

## 4. Building with Tiles

**"Tiles"** are the core building blocks of your site. They function like folders, buttons, or pages combined into one. They can hold content, links, and even other tiles nested inside them.

### Managing the Layout
- **Add New Tile**: Creates a brand new tile at your current level.
- **Add from Template (Dropdown)**: Lets you instantly stamp out a customized tile you previously saved as a template.
- **Drag & Drop Reordering**: You can click and hold any tile in *Builder Mode* to drag it around and change the display order.

### Editing a specific Tile
On each tile, you will see a series of action buttons:
- **Edit**: Opens the Tile Editor window where you can change the tile's title, description, colors, icons, add resource links, or embed videos.
- **Add Child**: Creates a new, nested layer *inside* this specific tile. This is how you build out "nested" menus and deeper categories.
- **Delete**: Permanently removes the tile *and any nested tiles inside it*. You will be asked to confirm this action.
- **Navigate / Open**: Clicking the main body of a tile (or the prompt arrow) dives deeper into that tile to show its children.

### The Tile Editor Features (Inside the Edit Window)
When you click **Edit** on a tile, a detailed window opens with several sections that let you customize everything about that tile:

#### 1. Templates
- **Apply Template Menu**: Quickly overwrite the current tile's look and feel with a previously saved template.
- **Save as New Template**: Takes the current layout, colors, and structure and saves it to your template library for future reuse.

#### 2. General Properties
- **Name & Description (EN/ES)**: Set the public-facing title and description of the tile. You can switch between English and Spanish. Click the **Generate (AI)** spark icon to let AI write these for you based on a short topic.
- **Internal Name**: A private label only visible to admins to help organize tiles (e.g., "Secret Hidden Tile"), avoiding clutter in the public view.
- **Access Tags**: Restrict who can see this tile. If you type a tag like `premium-user`, only logged-in visitors with that tag can view the tile. Leave blank for public access.

#### 3. Appearance
- **AI Designer**: Click the palette icon and describe the mood or brand. The AI will automatically pick a suitable background color and font for you.
- **Background Color**: Use the color picker to set the tile's background hue.
- **Use Logo as Background**: A toggle switch that stretches your uploaded Logo Image to fill the entire tile background (useful for large photo-based tiles).
- **Font**: Select from several typography options (like Verdana, Inter, or Roboto) to customize the text style.

#### 4. Content Visibility
- **Toggle Switches**: A checklist of toggles that let you manually show or hide specific parts of the tile. For example, you can choose to hide the Name or Description while keeping the background image visible.

#### 5. Content & Media Links
- **Logo Image URL**: Paste a link to an image to display it on the tile. Click the **Generate (AI)** photo icon to describe an image and have the AI draw a custom logo for you instantly!
- **Overview Video URL**: Paste a link to a main video (like YouTube or Vimeo) to feature on the tile. Use the **Find Video (AI)** tool to automatically search the web for a relevant video based on a topic you enter.
- **Overview Thumbnail URL**: An image to display as the video cover. This is often fetched automatically when you paste a video URL.
- **Documentation Folder URL**: Attach a direct link to a shared folder, Google Drive, or external document repository.

#### 6. Training Videos
- **Add Video List**: Create a playlist of multiple training or informational videos inside the tile. You can add as many as you need, and you have access to the same AI search tools to find videos quickly.

#### 7. Links & Resources
- **External Links**: Add a list of clickable web links (like 'Our Website' or 'Support Page') to route users to outside pages.
- **Resources**: Similar to links, but you can use this section to represent downloadable files or secondary reading materials.

#### 8. Internal Links
- **Link to other Tiles**: Create shortcuts to other tiles within your site structure. Clicking this link acts as a warp pipe, jumping the user straight to the target tile without having to navigate backwards.

#### 9. Workflow Link
- **Choose Next Tile**: Create a guided "step-by-step" path for your users. Linking to a "Next Tile" adds a Next step logic, directing the user where they should go after finishing the content on the current tile.

--- 

*Happy building! Use the "Save JSON" button frequently, and don't hesitate to "Preview" your site to see your hard work come to life.*
