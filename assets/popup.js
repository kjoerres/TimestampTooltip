document.addEventListener('DOMContentLoaded', function() {
    const convertButton = document.getElementById('notify-button');
    const textArea = document.getElementById('notify-text');
    const resultDiv = document.getElementById('notify-res');

    // Function to calculate human-readable time difference
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();

        // If timestamp is in the future
        if (diffMs < 0) {
            const futureDiffMs = Math.abs(diffMs);
            const seconds = Math.floor(futureDiffMs / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (days > 0) {
                const remainingHours = hours % 24;
                return remainingHours > 0 ? `in ${days}d ${remainingHours}h` : `in ${days}d`;
            } else if (hours > 0) {
                const remainingMinutes = minutes % 60;
                return remainingMinutes > 0 ? `in ${hours}h ${remainingMinutes}m` : `in ${hours}h`;
            } else if (minutes > 0) {
                const remainingSeconds = seconds % 60;
                return remainingSeconds > 0 ? `in ${minutes}m ${remainingSeconds}s` : `in ${minutes}m`;
            } else {
                return `in ${seconds}s`;
            }
        }

        // Calculate time ago
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            return remainingHours > 0 ? `${days}d ${remainingHours}h ago` : `${days}d ago`;
        } else if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m ago` : `${hours}h ago`;
        } else if (minutes > 0) {
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s ago` : `${minutes}m ago`;
        } else {
            return `${seconds}s ago`;
        }
    }

    convertButton.addEventListener('click', function() {
        const inputText = textArea.value.trim();

        if (!inputText) {
            resultDiv.innerHTML = '<span style="color: #d93025;">Please enter a timestamp to convert.</span>';
            return;
        }

        // Clear previous result
        resultDiv.innerHTML = 'Converting...';

        let jsDate;
        let isUnixTimestamp = false;

        // Check if input is a Unix timestamp (numeric)
        const numericInput = parseFloat(inputText);
        if (!isNaN(numericInput) && /^\d+(\.\d+)?$/.test(inputText.trim())) {
            isUnixTimestamp = true;

            // Handle Unix timestamps - check if it's in seconds or milliseconds
            let timestamp = numericInput;

            // If timestamp appears to be in seconds, convert to milliseconds
            if (timestamp < 10000000000) {
                timestamp = timestamp * 1000;
            }

            // Add reasonable bounds for Unix timestamps
            // Jan 1, 2000 00:00:00 UTC = 946684800000 (in milliseconds)
            // Current time + 2 years (dynamic maximum)
            const minTimestamp = 946684800000; // Year 2000
            const maxTimestamp = Date.now() + (2 * 365 * 24 * 60 * 60 * 1000); // Current time + 2 years

            if (timestamp >= minTimestamp && timestamp <= maxTimestamp) {
                jsDate = new Date(timestamp);
            } else {
                // Number is outside reasonable timestamp range, treat as invalid
                jsDate = new Date('Invalid');
            }
        } else {
            // Check if timestamp has no timezone info and assume UTC
            let timestampStr = inputText.replace(/(\n|\t)/gm, '');

            // Patterns that likely don't have timezone info - assume UTC
            const noTimezonePatterns = [
                /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\s+\d{1,2}:\d{2}:\d{2}$/,  // 2025/07/11 18:23:44
                /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,  // 2025-07-11 18:23:44
                /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\s+\d{1,2}:\d{2}:\d{2}$/   // 07/11/2025 18:23:44
            ];

            const hasNoTimezone = noTimezonePatterns.some(pattern => pattern.test(timestampStr));

            if (hasNoTimezone) {
                // Assume UTC by appending 'UTC' to the string
                timestampStr += ' UTC';
            }

            // Try to parse as regular date string
            jsDate = new Date(timestampStr);
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

            // Calculate time ago
            const timeAgo = getTimeAgo(jsDate);

            resultDiv.innerHTML = `
                <div style="color: #137333; margin-bottom: 10px;">
                    <strong>Date:</strong> ${formattedDate}
                </div>
                <div style="color: #1a73e8; font-style: italic;">
                    <strong>Time ago:</strong> ${timeAgo}
                </div>
            `;
        } else {
            // Unable to parse with JavaScript Date
            resultDiv.innerHTML = `<span style="color: #d93025;">Unable to convert '${inputText}' to a timestamp</span>`;
        }
    });

    // Allow Enter key to trigger conversion
    textArea.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            convertButton.click();
        }
    });
});
