export function fetchMenuItemsAndCreateMenus() {
    fetch(chrome.runtime.getURL('menuItems.json'))
        .then(response => response.json())
        .then(createMenus)
        .catch(error => console.error('Error loading menu items:', error));
}

function createMenus(menuItems) {
    createMainMenu();
    menuItems.forEach(menuItem => {
        createMenuItem(menuItem);
    });
}

function createMainMenu() {
    chrome.contextMenus.create({
        id: "mainMenu",
        title: "Web Multi-tool",
        contexts: ["selection"]
    });
}

function createMenuItem(menuItem, parentId = null) {
    const menuId = parentId ? parentId + "|" + menuItem.id : menuItem.id;
    const parentMenuId = parentId ? parentId + "|" : "";

    if (menuItem.urls) {
        createMenuWithSubItems(menuItem, menuId, parentMenuId);
    } else {
        createSingleMenuItem(menuItem, menuId, parentMenuId);
    }
}

function createMenuWithSubItems(menuItem, menuId, parentMenuId) {
    chrome.contextMenus.create({
        id: menuId,
        title: menuItem.title,
        contexts: ["selection"],
        parentId: parentMenuId + (menuItem.parentId || "mainMenu")
    });
    menuItem.urls.forEach(url => {
        createSingleMenuItem(url, menuId + "|" + url.id, menuId);
    });
}

function createSingleMenuItem(item, itemId, parentId) {
    chrome.contextMenus.create({
        id: itemId,
        title: item.name,
        contexts: ["selection"],
        parentId: parentId
    });
}