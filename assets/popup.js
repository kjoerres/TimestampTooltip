const text = document.getElementById( 'notify-text' );
const notify = document.getElementById( 'notify-button' );

notify.addEventListener( 'click', () => {
    chrome.runtime.sendMessage( '', {
        type: 'notification',
        message: text.value
    });
} );