import { fetchMenuItemsAndCreateMenus, fetchMenuItemsFromFile } from './menu/menu.js';
import { fetchMenuItemsAndHandleMenuClick } from './menu/menuClick.js';

// Check if menuItems are stored in chrome.storage.sync
chrome.storage.sync.get('menuItems', (result) => {
    if (chrome.runtime.lastError) {
        console.error('Error loading menu items from storage:', chrome.runtime.lastError.message);
    } else {
        const menuItems = result.menuItems;
        if (!menuItems) {
            fetchMenuItemsFromFile();
        } else {
            fetchMenuItemsAndCreateMenus();
        }
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.includes("|")) {
        const [menuId, urlId] = info.menuItemId.split("|");
        fetchMenuItemsAndHandleMenuClick(menuId, urlId, info);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received from options page:', message);
    if (message.refreshMenu) {
        fetchMenuItemsAndCreateMenus();
    }
});

chrome.action.onClicked.addListener(() => {
    chrome.runtime.openOptionsPage();
});
