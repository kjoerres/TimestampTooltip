// Service worker for Timestamp Tooltip extension (Manifest V3)

// Add a listener to create the ContextMenu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'addTimestamp',
        title: "Add timestamp tooltip",
        contexts: ["selection"]
    });
});

// Handler for the clicking of the "add timestamp" action
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ('addTimestamp' === info.menuItemId) {
        // Inject the content script and execute the timestamp conversion
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: addTimestampToSelection,
        });
    }
});

// Function to be injected into the page
function addTimestampToSelection() {
    // Define helper function to update the page with tooltip
    function updatePage(newTimestamp, originalText, range) {
        const html = `
        <style>
    .tooltipLabel {
        display: inline;
        position: relative;
        white-space: nowrap;
        cursor: text;
    }
    .tooltipLabel .tooltipContent {
        visibility: hidden;
        text-align: center;
        font-weight: normal;
        font-size: 14px;
        bottom: 26px;
        left: 50%;
        position: absolute;
        z-index: 998;
        transform: translateX(-50%);
        background-color: #6e6d6d;
        border-radius: 5px;
        color: white;
        padding: 5px 10px;
        min-width: 230px;
    }
    .tooltipLabel:hover .tooltipContent {
        visibility: visible;
    }
    .tooltipLabel:hover .tooltipContentTriangle {
        visibility: visible;
    }
    .tooltipContentTriangle {
        visibility: hidden;
        position: absolute;
        z-index: 999;
        top: 0px;
        left: 50%;
        transform: translate(-9px, -12px);
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 10px solid #6e6d6d;
    }
</style>
<span class="tooltipLabel">
    <span>` + originalText + `</span>
<span class="tooltipContentTriangle"></span>
    <span class="tooltipContent">
` + newTimestamp + `
    </span>
</span>`;

        // Remove contents of current range
        range.extractContents();

        const el = document.createElement("span");
        el.innerHTML = html;
        let frag = document.createDocumentFragment(), node, lastNode;
        while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
    }

    let sel, range;
    let jsDate;

    if (window.getSelection) {
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {
            // Get the selected text
            range = window.getSelection().getRangeAt(0);
            let stringSelection = sel.toString();

            // Check if input is a Unix timestamp (numeric)
            const numericInput = parseFloat(stringSelection);
            if (!isNaN(numericInput) && /^\d+(\.\d+)?$/.test(stringSelection.trim())) {
                // Handle Unix timestamps - check if it's in seconds or milliseconds
                let timestamp = numericInput;

                // If timestamp appears to be in seconds, convert to milliseconds
                if (timestamp < 10000000000) {
                    timestamp = timestamp * 1000;
                }

                jsDate = new Date(timestamp);
            } else {
                // Try to parse as regular date string
                jsDate = new Date(stringSelection.replace(/(\n|\t)/gm, ''));
            }

            if (!isNaN(jsDate.getTime()) && jsDate.toString() !== 'Invalid Date') {
                // Successfully parsed with JS Date
                let newTime = jsDate.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                });

                let formattedDate = jsDate.toString();
                // Replace hour, minute, second with better formatted version
                formattedDate = formattedDate.replace(/[0-9]{1,2}[:][0-9]{1,2}[:][0-9]{1,2}/gm, newTime);
                // Remove anything in parentheses
                formattedDate = formattedDate.replace(/\((.*?)\)/gm, '');
                // Replace timezone format
                formattedDate = formattedDate.replace(/0{2}$/gm, ':00');

                updatePage(formattedDate, stringSelection, range);
            } else {
                // Unable to parse with JavaScript Date
                alert('Unable to convert \'' + stringSelection + '\' to a timestamp');
            }
        }
    }
}
