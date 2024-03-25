chrome.runtime.onInstalled.addListener(() => {
    fetch(chrome.runtime.getURL('menuItems.json'))
        .then(response => response.json())
        .then(data => {        
            function createMenus(menuItems, parentId = null) {
                menuItems.forEach(menuItem => {
                    const menuId = parentId ? parentId + "|" + menuItem.id : menuItem.id;
                    const parentMenuId = parentId ? parentId + "|" : "";
                    
                    if (menuItem.urls) {
                        chrome.contextMenus.create({
                            id: menuId,
                            title: menuItem.title,
                            contexts: ["selection"],
                            parentId: parentMenuId + (menuItem.parentId || "mainMenu")
                        });
                        menuItem.urls.forEach(url => {
                            const urlId = menuId + "|" + url.id;
                            chrome.contextMenus.create({
                                id: urlId,
                                title: url.name,
                                contexts: ["selection"],
                                parentId: menuId
                            });
                        });
                    } else {
                        chrome.contextMenus.create({
                            id: menuId,
                            title: menuItem.name,
                            contexts: ["selection"],
                            parentId: parentMenuId + (menuItem.parentId || "mainMenu")
                        });
                    }
                });
            }

            chrome.contextMenus.create({
                id: "mainMenu",
                title: "Web Multi-tool",
                contexts: ["selection"]
            });

            createMenus(data);
        })
        .catch(error => console.error('Error loading menu items:', error));
});

// Add event listener for context menu item clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.includes("|")) {
        const [menuId, urlId] = info.menuItemId.split("|");

        fetch(chrome.runtime.getURL('menuItems.json'))
            .then(response => response.json())
            .then(data => {
                const menuItem = data.find(item => item.id === menuId);
                const url = menuItem.urls.find(url => url.id === urlId);


                if (url) {
                    const fullUrl = url.url + encodeURIComponent(info.selectionText);
                    chrome.tabs.create({ url: fullUrl });
                } else {
                    console.error('URL not found for ID:', urlId);
                }
            })
            .catch(error => console.error('Error loading menu items:', error));
    }
});
