# Tile Configuration Guide

This guide is entirely dedicated to the **Tile Editor window**. Tiles are the core building blocks of your Nested Site Builder project. Whenever you click the **Edit** button on a tile, a detailed window opens, packed with configuration options. 

Below is a complete breakdown of every single feature found inside the Tile Editor, explaining **what it is**, **what it's used for**, and **how to set it**.

---

## 1. General Properties

The General Properties dictate how the tile identifies itself to your users and to you as an admin.

### Language Toggle (English / Español)
- **What it is:** A pair of buttons at the top of the General Properties section.
- **What it's for:** Allows you to input text (like names and descriptions) specifically for English readers, and separately for Spanish readers.
- **How to set it:** Click "English" to type your English text. Click "Español" to type your Spanish translation.

### Name (EN/ES)
- **What it is:** The public-facing title of the tile.
- **What it's for:** This text appears prominently on the tile itself. It tells the user what the tile represents (e.g., "HR Documents" or "Marketing Strategy").
- **How to set it:** Type directly into the text box. Alternatively, click the **Generate (AI)** spark icon, describe what the tile is about, and let the AI write a concise title for you.

### Internal Name (Admin Only)
- **What it is:** A private label that only you (the site builder) can see.
- **What it's for:** Keeping track of tiles without cluttering the public view. For example, you might have two tiles named "Contact Us" in different parts of your site. You can use the internal name to label one "Contact Us - Sales Dept" privately.
- **How to set it:** Type a descriptive label into the *Internal Name* blue-highlighted text box. 

### Description (EN/ES)
- **What it is:** A subtitle or brief paragraph explaining the tile in more detail.
- **What it's for:** Gives users context before they click into the tile. 
- **How to set it:** Type directly into the text box, or use the **Generate (AI)** spark icon to have the AI write one based on your topic.

---

## 2. Access Control

### Access Tags
- **What it is:** A comma-separated list of keywords that restrict who is allowed to view this tile.
- **What it's for:** Creating private, secure, or role-based areas of your site. If you add the tag `admin`, only logged-in users whose profile has the `admin` tag will be able to see or click this tile.
  - *Deep Linking / Internal Links:* These routing methods are securely tied to access tags. If an unauthorized user clicks a direct deep link pointing to a restricted tile, they will be taken to the parent folder, but the restricted destination tile will be completely invisible to them. This fail-closed design ensures a direct link cannot bypass your security tags.
- **How to set it:** Type tags separated by commas (e.g., `admin, premium-user, staff`). If you leave this box entirely blank, the tile is **100% public** and visible to everyone.

---

## 3. Appearance

This section controls the visual aesthetic of the specific tile.

### AI Designer
- **What it is:** An automated design assistant.
- **What it's for:** Instantly picking a harmonious background color and font based on a requested mood.
- **How to set it:** Click the **AI Designer** button, type a mood or brand description (e.g., "Professional corporate blue", "Playful and bright"), and confirm.

### Background Color
- **What it is:** A standard color picker.
- **What it's for:** Setting the solid background color of the tile.
- **How to set it:** Click the color swatch to open your device's color picker tool, or type a HEX code (e.g., `#FF0000` for red). Note: This is disabled if "Use Logo as Background" is turned on.

### Use Logo as Background
- **What it is:** A checkbox toggle.
- **What it's for:** Stretching the image provided in the "Logo Image URL" field so that it entirely covers the background of the tile, rather than just floating in the middle. 
- **How to set it:** Check the box. (Make sure you have actually added a Logo Image URL in the Content & Links section below!).

### Font
- **What it is:** A dropdown menu of typography choices (Verdana, Inter, Arial, etc.).
- **What it's for:** Changing the text style of the tile's Name and Description.
- **How to set it:** Select a font from the dropdown list.

---

## 4. Content Visibility

### Visibility Toggles (Checkboxes)
- **What they are:** A grid of checkboxes (e.g., Name, Description, Links, etc.).
- **What they are for:** Allowing you to hide specific pieces of text on the tile while keeping the underlying data intact. For example, if you use a beautifully designed image as your tile background, the standard text "Name" might look ugly layered over it. You can uncheck "Name" to hide the text, but the system still knows what the tile is called.
- **How to set it:** Uncheck a box to hide that element on the live site. Check it to show it.

---

## 5. Content & Media Links

This section is where you attach visual media and overarching documents to the tile.

### Logo Image URL
- **What it is:** A web link pointing directly to an image file (PNG, JPG, etc.).
- **What it's for:** Displaying an icon, photo, or logo on the face of the tile.
- **How to set it:** Paste an image URL. Or, click the **Generate (AI)** photo icon to describe an image and have the AI draw a custom logo for you instantly.
- **Spanish Variation:** You can provide a different image URL in the `(ES)` field if your logo contains English text and you have a Spanish version of the image.

### Overview Video URL
- **What it is:** A web link pointing to a main video (like a YouTube or Vimeo link).
- **What it's for:** Featuring a prominent, primary video at the top of the tile when a user opens it.
- **How to set it:** Paste the video URL. Or, click **Find Video (AI)** and type a topic; the system will search the web for a relevant video and paste it for you.
- **Spanish Variation:** Provide an alternate video link in the `(ES)` bucket bridging to a Spanish-dubbed option.

### Overview Thumbnail URL
- **What it is:** An image link that acts as the cover photo for the Overview Video.
- **What it's for:** Showing a preview image before the user clicks "Play". 
- **How to set it:** When you paste a video URL, the system usually fetches this automatically! If it fails, or if you want a custom cover, paste an image link here manually.

### Documentation Folder URL
- **What it is:** A single overarching web link to a repository.
- **What it's for:** Directing users to a shared Google Drive, Dropbox folder, or SharePoint directory associated with this entire topic.
- **How to set it:** Paste the folder URL.

---

## 6. Training Videos

### Add Video List
- **What it is:** A playlist builder inside the tile.
- **What it's for:** Stacking multiple informational or training videos below the "Overview" video. Excellent for step-by-step courses or tutorial sets.
- **How to set it:** Click the **Add** button. Paste the video URL (and an optional Spanish video URL). Use the **Find (AI)** button next to any blank row to search the web for a specific video. Click **Remove** to delete a row.

---

## 7. Links & Resources

### External Links
- **What it is:** A list of standard web hyperlinks.
- **What it's for:** Routing users to general websites (e.g., "Our Company Homepage", "Support Portal").
- **How to set it:** Click **Add**. Type text into the "Name" box (this is what the user clicks), and paste the destination address into the "URL" box. You can translate the Name and URL into Spanish using the global language toggle.

### Resources
- **What it is:** A list identical in function to External Links, but visually separated on the live site.
- **What it's for:** Organizing downloadable files (PDFs, templates, spreadsheets) or secondary reading materials away from standard web links.
- **How to set it:** Handled exactly the same as External Links. Click **Add**, provide a Name and a URL.

---

## 8. Internal Links

### Link to other Tiles
- **What it is:** A shortcut generator.
- **What it's for:** Creating a clickable button that teleports the user straight to an entirely different tile within your Nested Site Builder, without them having to click the "Back" arrow and find it manually. 
- **How to set it:** Click **Add Internal Link**. A window will open showing your entire site structure. Click the tile you want to link to. The system will create a connection string instantly.

---

## 9. Workflow Link

### Choose Next Tile
- **What it is:** A linear progression tool.
- **What it's for:** Creating a guided "step-by-step" path or course. When you set a "Next Tile", a forward arrow icon appears on the live site, heavily directing the user to click it to proceed to the next logical step in a sequence.
- **How to set it:** Click **Choose Next Tile**, browse your site map, and select the tile that should logically follow the current one. Click **Clear** if you want to remove the linear path.

---

## 10. Templates (Top Right Area)

### Apply Template Menu
- **What it is:** A dropdown and an "Apply" button.
- **What it's for:** Quickly overwriting the current tile's appearance and structure with a pre-saved layout. 
- **How to set it:** Select a template from the dropdown and click **Apply**. *Warning: This overwrites your current unsaved changes.*

### Save as New Template
- **What it is:** A save button.
- **What it's for:** Taking all the work you just did (colors, fonts, layout, links) and saving it to your template library. This allows you to stamp out identical tiles in the future without re-typing everything.
- **How to set it:** Click **Save as New Template**, give your template a name, and press confirm.

---

*Once you are finished configuring your tile, remember to click **Save Changes** at the bottom right of the window!*
