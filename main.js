addTimestamp = function(info, tab) {
     // console.log("item " + info.menuItemId + " was clicked");
     // console.log("info: " + JSON.stringify(info));
     // console.log("tab: " + JSON.stringify(tab));

  // let selection = document.getSelection();
  //
  // if (selection != null && selection.anchorNode != null ) {
  //
  //     let newItem = document.createElement('span');
  //     newItem.style.color = 'blue';
  //     newItem.textContent = selection.toString()
  //
  //     currentWords = selection.anchorNode.toString();
  //
  //     currentWords.replace(selection.toString(), newItem)
  //
  //     selection.anchorNode.replaceWith(currentWords)
  //   }

    //Working replacement:
    // var highlight = document.getSelection();
    // var newItem = '<span style="color:blue;">' + highlight + '</span>';
    // document.body.innerHTML = document.body.innerHTML.replace(new RegExp(highlight , 'g'), newItem);
    console.log(self,"self")
    let window = self;

    var sel, range, node;

    let newTime;
    let jsDate;
    if (window.getSelection !== 'undefined') {

        sel = window.getSelection();
        console.log(sel.toString())
        console.log(sel)
        if (sel.getRangeAt && sel.rangeCount) {
            range = window.getSelection().getRangeAt(0);

            jsDate = new Date(sel.toString().replace(/\n/gm, ''));

            newTime = jsDate.toLocaleString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true
            });
            jsDate = jsDate.toString();
            jsDate = jsDate.replace(/[0-9]{1,2}[:][0-9]{1,2}[:][0-9]{1,2}/gm, newTime);
            jsDate = jsDate.replace(/\((.*?)\)/gm, '');

            if (jsDate != 'Invalid Date') {
                console.log("Using JS Date")
                var html = `
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
        background: #333;
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
` + jsDate + `
    </span>
</span>`;
                // Remove contents of current range. Don't use range.deleteContents() since this will mess up the insertion
                // of the replacement, putting it in a possibly incorrect location. e.g. outside of the surrounding <li>
                //range.deleteContents();
                range.extractContents();

                var el = document.createElement("span");
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
            } else {
                console.log("Using Wolfram Date")
                var request = new XMLHttpRequest();
                request.open('GET', 'https://www.wolframcloud.com/obj/kjoerres/timestampConvert?i=' + encodeURIComponent(range));
                request.send();
                request.onload = () => {
                    var betterTimestamp = JSON.parse(request.response);

                    var html = `
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
        background: #333;
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
` + betterTimestamp + `
    </span>
</span>`;

                    // Remove contents of current range. Don't use range.deleteContents() since this will mess up the insertion
                    // of the replacement, putting it in a possibly incorrect location. e.g. outside of the surrounding <li>
                    //range.deleteContents();
                    range.extractContents();

                    var el = document.createElement("span");
                    el.innerHTML = html;
                    var frag = document.createDocumentFragment(), node, lastNode;
                    while ((node = el.firstChild)) {
                        lastNode = frag.appendChild(node);
                    }
                    range.insertNode(frag);
                }
            }

//             var html = `
//         <style>
//     .tooltipLabel {
//         display: inline;
//         position: relative;
//     }
//     .tooltipLabel .tooltipContent {
//         visibility: hidden;
//         text-align: center;
//         font-weight: normal;
//         font-size: 14px;
//         background: #333;
//         bottom: 26px;
//         left: 50%;
//         position: absolute;
//         z-index: 998;
//         transform: translateX(-50%);
//         background-color: #6e6d6d;
//         border-radius: 5px;
//         color: white;
//         padding: 5px 10px;
//         min-width:  230px;
//     }
//     .tooltipLabel:hover .tooltipContent {
//         visibility: visible;
//     }
//     .tooltipLabel:hover .tooltipContentTriangle {
//         visibility: visible;
//     }
//     .tooltipContentTriangle {
//         visibility: hidden;
//         position: absolute;
//         z-index: 999;
//         top: 0px;
//         left: 50%;
//         transform: translate(-9px, -12px);
//         border-left: 12px solid transparent;
//         border-right: 12px solid transparent;
//         border-top: 10px solid #6e6d6d;
//     }
// </style>
// <span class="tooltipLabel">
//     <span>` + range + `
//
// </span>
// <span class="tooltipContentTriangle"></span>
//     <span class="tooltipContent">
//         February 03, 2022 09:14:11 GMT-05:00
//     </span>
// </span>`;
//             //var html = "<span style='color:blue'>"+range+"</span>";
//
//             // Remove contents of current range. Don't use range.deleteContents() since this will mess up the insertion
//             // of the replacement, putting it in a possibly incorrect location. e.g. outside of the surrounding <li>
//             //range.deleteContents();
//             range.extractContents();
//
//             var el = document.createElement("span");
//             el.innerHTML = html;
//             var frag = document.createDocumentFragment(), node, lastNode;
//             while ( (node = el.firstChild) ) {
//                 lastNode = frag.appendChild(node);
//             }
//             range.insertNode(frag);
        }
    } else if (document.selection && document.selection.createRange) {
        console.log('here2')
        range = document.selection.createRange();
        range.collapse(false);
        range.pasteHTML(html);
    }
  };

chrome.contextMenus.onClicked.addListener(addTimestamp)

//Add a listener to create the ContextMenu
chrome.runtime.onInstalled.addListener( () => {
    chrome.contextMenus.create({
        id: 'addTimestamp',
        title: "Add timestamp tooltip",
        contexts:[ "selection" ]
    });
});

// Handler for the clicking of the "add timestamp" action
chrome.contextMenus.onClicked.addListener( ( info, tab ) => {
    if ( 'addTimestamp' === info.menuItemId ) {
        // chrome.tabs.executeScript( {
        //     code: "window.getSelection().toString();"
        // }, function(selection) {
        //     alert(selection)
        // });
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


"<input class=\"globalNav-search-0418 globalNav-search-0424\" readonly=\"\" type=\"search\" autocomplete=\"off\" spellcheck=\"false\" tabindex=\"-1\" data-testid=\"awsc-concierge-input-hint\" value=\"\"><span style=\"color:blue;\"></span><input class=\"globalNav-search-0419 globalNav-search-0425\" type=\"search\" autocomplete=\"off\" spellcheck=\"false\" placeholder=\"Search for services, features, blogs, docs, and more\" data-testid=\"awsc-concierge-input\" maxlength=\"256\" value=\"\">"