document.addEventListener('DOMContentLoaded', function () {
    const jsonDisplay = document.getElementById('jsonDisplay');
    const saveButton = document.getElementById('saveButton');
    const importButton = document.getElementById('importButton');
    const exportButton = document.getElementById('exportButton');
    const fileInput = document.getElementById('fileInput');
    const linterOutput = document.getElementById('linterOutput');

    // Function to fetch and display menuItems.json
    function displayMenuItemsJSON() {
        chrome.storage.sync.get('menuItems', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading menu items from storage:', chrome.runtime.lastError.message);
            } else {
                const menuItems = result.menuItems;
                if (menuItems) {
                    const menuItemsJSON = JSON.stringify(menuItems, null, 2);
                    jsonDisplay.value = menuItemsJSON;
                    // Call the JSON linter function
                    lintJSON(menuItemsJSON);
                } else {
                    jsonDisplay.value = 'No menu items found.';
                    linterOutput.textContent = ''; // Clear previous linting result
                    saveButton.disabled = false; // Enable save button
                }
            }
        });
    }

    // Function to lint JSON data
    function lintJSON(jsonContent) {
        try {
            JSON.parse(jsonContent);
            linterOutput.textContent = ''; // Clear linting error message
            saveButton.disabled = false; // Enable save button
        } catch (error) {
            linterOutput.textContent = 'JSON is not valid: ' + error.message;
            saveButton.disabled = true; // Disable save button
        }
    }

    // Function to save modified JSON content to storage
    function saveMenuItemsJSON(jsonContent) {
        try {
            const parsedJSON = JSON.parse(jsonContent);
            chrome.storage.sync.set({ 'menuItems': parsedJSON }, () => {
                displayMenuItemsJSON();
            });
        } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid JSON format!');
        }
    }

    // Function to import JSON file
    function importMenuItemsJSON(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedJSON = event.target.result;
                jsonDisplay.value = importedJSON;
                saveMenuItemsJSON(importedJSON);
            } catch (error) {
                console.error('Error importing JSON:', error);
                alert('Error importing JSON file.');
            }
        };
        reader.onerror = function () {
            console.error('Error reading file:', reader.error);
            alert('Error reading file.');
        };
        reader.readAsText(file);
    }

    // Function to export JSON data
    function exportMenuItemsJSON() {
        chrome.storage.sync.get('menuItems', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading menu items from storage:', chrome.runtime.lastError.message);
                alert('Error exporting menu items. Please try again.');
            } else {
                const menuItems = result.menuItems;
                if (menuItems) {
                    const menuItemsJSON = JSON.stringify(menuItems, null, 2);
                    const blob = new Blob([menuItemsJSON], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'menuItems.json';
                    a.click();
                    URL.revokeObjectURL(url);
                } else {
                    alert('No menu items to export.');
                }
            }
        });
    }

    // Display menuItems.json when the options page loads
    displayMenuItemsJSON();

    // Save button click handler
    saveButton.addEventListener('click', function () {
        saveMenuItemsJSON(jsonDisplay.value);
    });

    // Import button click handler
    importButton.addEventListener('click', function () {
        fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        if (file) {
            importMenuItemsJSON(file); // Make sure to pass the 'file' parameter
        }
    });

    // Export button click handler
    exportButton.addEventListener('click', function () {
        exportMenuItemsJSON();
    });

    // JSON display input event handler (for live linting)
    jsonDisplay.addEventListener('input', function () {
        lintJSON(jsonDisplay.value);
    });
});
