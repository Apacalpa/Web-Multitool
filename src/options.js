document.addEventListener('DOMContentLoaded', function () {
    const jsonDisplay = document.getElementById('jsonDisplay');
    const saveButton = document.getElementById('saveButton');
    const importButton = document.getElementById('importButton');
    const exportButton = document.getElementById('exportButton');
    const fileInput = document.getElementById('fileInput');
    const linterOutput = document.getElementById('linterOutput');

    const editor = CodeMirror.fromTextArea(document.getElementById('jsonDisplay'), {
        lineNumbers: true,
        mode: "application/json",
        gutters: ["CodeMirror-lint-markers"],
        lint: true
    });

    
    // Function to fetch and display menuItems.json
    function displayMenuItemsJSON() {
        chrome.storage.sync.get('menuItems', (result) => {
            if (chrome.runtime.lastError) {
                console.error('Error loading menu items from storage:', chrome.runtime.lastError.message);
            } else {
                const menuItems = result.menuItems;
                if (menuItems) {
                    const menuItemsJSON = JSON.stringify(menuItems, null, 2);
                    editor.setValue(menuItemsJSON);
                } else {
                    editor.setValue('No menu items found.');
                    linterOutput.textContent = '';
                    saveButton.disabled = false;
                }
            }
        });
    }


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

    function importMenuItemsJSON(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const importedJSON = event.target.result;
                editor.setValue(importedJSON);
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

    function sendMessageToBackground() {
        chrome.runtime.sendMessage({ refreshMenu: true }, (response) => {
            console.log('Message sent to background script');
        });
    }
    
    displayMenuItemsJSON();

    saveButton.addEventListener('click', function () {
        saveMenuItemsJSON(editor.getValue());
        sendMessageToBackground();
    });

    importButton.addEventListener('click', function () {
        fileInput.click();
    });

    fileInput.addEventListener('change', function () {
        const file = fileInput.files[0];
        if (file) {
            importMenuItemsJSON(file);
        }
    });

    exportButton.addEventListener('click', function () {
        exportMenuItemsJSON();
    });
});
