export function fetchMenuItemsAndHandleMenuClick(menuId, urlId, info) {
    chrome.storage.sync.get('menuItems', (result) => {
        if (chrome.runtime.lastError) {
            console.error('Error loading menu items from storage:', chrome.runtime.lastError.message);
            fetchMenuItemsFromFile(menuId, urlId, info);
        } else {
            const menuItems = result.menuItems;
            if (menuItems) {
                handleMenuClick(menuItems, menuId, urlId, info);
            }
        }
    });
}

function handleMenuClick(menuItems, menuId, urlId, info) {
    const menuItem = menuItems.find(item => item.id === menuId);
    if (menuItem) {
        const url = menuItem.urls.find(url => url.id === urlId);
        if (url) {
            handleUrlAction(url, info);
        } else {
            console.error('URL not found for ID:', urlId);
        }
    } else {
        console.error('Menu item not found for ID:', menuId);
    }
}

function handleUrlAction(url, info) {
    let alteredText = info.selectionText;
    if (url.encodings) {
        url.encodings.forEach(encoding => {
            alteredText = applyEncoding(alteredText, encoding);
        });
    }

    if (url.replace) {
        Object.entries(url.replace).forEach(([search, replace]) => {
            alteredText = alteredText.replaceAll(search, replace);
        });
    }

    const fullUrl = url.url + alteredText;
    chrome.tabs.create({ url: fullUrl });
}

function applyEncoding(text, encoding) {
    switch (encoding) {
        case "urlencode":
            return encodeURIComponent(text);
        case "base64":
            return btoa(text);
        default:
            return text;
    }
}
