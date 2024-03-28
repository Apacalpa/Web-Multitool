import { fetchMenuItemsAndCreateMenus } from './menu/menu.js';
import { fetchMenuItemsAndHandleMenuClick } from './menu/menuClick.js';

chrome.runtime.onInstalled.addListener(() => {
    fetchMenuItemsAndCreateMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.includes("|")) {
        const [menuId, urlId] = info.menuItemId.split("|");
        fetchMenuItemsAndHandleMenuClick(menuId, urlId, info);
    }
});

