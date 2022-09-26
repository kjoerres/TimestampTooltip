const text = document.getElementById( 'notify-text' );
const notify = document.getElementById( 'notify-button' );
const res = document.getElementById( 'notify-res' );

function getJSDate(input) {
    let jsDate = new Date(input.replace(/\n/gm, ''));
    let newTime;
    if (jsDate != 'Invalid Date') {
        newTime = jsDate.toLocaleString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
        jsDate = jsDate.toString();
        jsDate = jsDate.replace(/[0-9]{1,2}[:][0-9]{1,2}[:][0-9]{1,2}/gm, newTime);
        jsDate = jsDate.replace(/\((.*?)\)/gm, '');
        jsDate = jsDate.replace(/0{2}$/gm, ':00')
    }
    return jsDate
}

notify.addEventListener( 'click', () => {
    let jsDate = getJSDate(text.value);

    if (jsDate != 'Invalid Date') {
        console.log("Using JS Date")
        res.innerHTML = jsDate
    } else {
        console.log("Using Wolfram Date")
        var request = new XMLHttpRequest();
        request.open('GET', 'https://www.wolframcloud.com/obj/kjoerres/timestampConvert?i=' + encodeURIComponent(text.value));
        request.send();
        request.onload = () => {
            if (request.response != '$Failed') {
                var betterTimestamp = JSON.parse(request.response);
                res.innerHTML = betterTimestamp
            } else {
                res.innerHTML = 'Unable to interpret'
            }
        }
    }
} );