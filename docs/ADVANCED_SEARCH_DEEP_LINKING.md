# Advanced: Search & Deep Linking

To enable searching/filtering within the component from the main website URL (e.g., `website.com#search-term`), add this script after the component script at the bottom of your `<body>`.

```html
<script>
    document.addEventListener('DOMContentLoaded', () => {
        const siteViewer = document.getElementById('my-viewer');
        if (!siteViewer) return;

        // Function to handle URL hash changes
        const handleHashSearch = () => {
            const rawHash = window.location.hash.substring(1);
            const searchTerm = decodeURIComponent(rawHash);

            // Pass the search term as an access tag to filter tiles
            if (searchTerm) {
                console.log(`Filtering for: ${searchTerm}`);
                siteViewer.setAccessTags([searchTerm]);
            } else {
                // Reset if no hash
                siteViewer.setAccessTags([]);
            }
        };

        // Wait for component to load, then check initial hash
        siteViewer.addEventListener('componentReady', () => {
            handleHashSearch();
        });

        // Listen for live URL changes
        window.addEventListener('hashchange', handleHashSearch);
    });
</script>
```
