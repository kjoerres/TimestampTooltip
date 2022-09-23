chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'greet',
        title: 'Say hi',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'greet') {
        console.log('hello');
        alert('here')
    }
});