

function addTimestamp(info, tab) {

    // Define helper function within addTimestamp function. Otherwise it does not seem that this function can be
    // "seen" as we keep getting 'updatePage is not defined' ReferenceError.
    function updatePage(newTimestamp, range) {
        const html = `
        <style>
    .tooltipLabel {
        display: inline;
        position: relative;
        white-space: nowrap;
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
        min-width:  230px;
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
    <span>` + range + `</span>
<span class="tooltipContentTriangle"></span>
    <span class="tooltipContent">
` + newTimestamp + `
    </span>
</span>`;
        // Remove contents of current range. Could also use: range.deleteContents();
        range.extractContents();

        const el = document.createElement("span");
        el.innerHTML = html;
        let frag = document.createDocumentFragment(), node, lastNode;
        while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);
    }

    //console.log(self,"self")  //log self (should be Window)
    let window = self;
    let sel, range;
    let jsDate;

    if (window.getSelection) {

        sel = window.getSelection();
        //console.log(sel.toString()) // log selection text
        //console.log(sel)            // log selection

        if (sel.getRangeAt && sel.rangeCount) {
            // Get the selected text.
            range = window.getSelection().getRangeAt(0);

            // Convert the selection to a string
            let stringSelection = sel.toString();

            // Try to parse the selection using the js Date object. This is much quicker than the alternative to call
            // an API to parse the date.
            jsDate = new Date(stringSelection.replace(/\n/gm, ''));
            if (jsDate != 'Invalid Date') {
                //console.log("Using JS Date") // Log that we are using the JS path to interpret date
                let newTime;
                newTime = jsDate.toLocaleString('en-US', {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true
                });
                jsDate = jsDate.toString();
                // Replace hour, minute, second with better formated version (using 12hour format rather than 24h)
                jsDate = jsDate.replace(/[0-9]{1,2}[:][0-9]{1,2}[:][0-9]{1,2}/gm, newTime);

                // Remove anything in parentheses. The js Date by default puts the timezone name within parentheses.
                jsDate = jsDate.replace(/\((.*?)\)/gm, '');

                // Replace the timezone GMTXX00 with GMTXX:00. // As of 9/26/22 this does not seem to be working perhaps due to the end of line '$' constraint?
                jsDate = jsDate.replace(/0{2}$/gm, ':00');

                updatePage(jsDate, range)
            } else {
                // console.log("Using Wolfram Date") // Log that we are using the Wolfram API path to interpret date
                var request = new XMLHttpRequest();
                request.open('GET', 'https://www.wolframcloud.com/obj/kjoerres/timestampConvert?i=' + encodeURIComponent(range));
                request.send();
                request.onload = () => {
                    if (request.response != '$Failed') {
                        const betterTimestamp = JSON.parse(request.response);
                        updatePage(betterTimestamp, range)
                    } else {
                        alert('Unable to convert \'' +  stringSelection + '\' to a timestamp')
                    }
                }
            }
        }
    } else if (document.selection && document.selection.createRange) {
        console.log('here2')
        range = document.selection.createRange();
        range.collapse(false);
        range.pasteHTML(html);
    }
  }


//Add a listener to create the ContextMenu
chrome.runtime.onInstalled.addListener( () => {
    chrome.contextMenus.create({
        id: 'addTimestamp',
        title: "Add timestamp tooltip",
        contexts:[ "selection" ]
    });
});

chrome.contextMenus.onClicked.addListener(addTimestamp)

// Handler for the clicking of the "add timestamp" action
chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
    if ( 'addTimestamp' === info.menuItemId ) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const tabId = tabs[0].id;
            chrome.scripting.executeScript( {
                target: {tabId},
                func: addTimestamp,
                args: [info, tab]
            });
        });
    }
} );





// Send notification
const notify = message => {
    return chrome.notifications.create(
        '',
        {
            type: 'basic',
            title: 'Notify!',
            message: message || 'Notify!',
            iconUrl: './assets/search.png',
        }
    );
};

// Add a listener to issue a notification
chrome.runtime.onMessage.addListener( data => {
    if ( data.type === 'notification' ) {
        notify( data.message );
    }
});