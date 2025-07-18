// Content script for automatic timestamp detection and conversion
(function() {
    'use strict';

    // Add the tooltip styles to the page
    function addTooltipStyles() {
        if (document.getElementById('timestamp-tooltip-styles')) return; // Already added

        const style = document.createElement('style');
        style.id = 'timestamp-tooltip-styles';
        style.textContent = `
            .tooltipLabel {
                display: inline;
                position: relative;
                white-space: nowrap;
                cursor: help;
                border-bottom: 1px dotted #666;
            }
            .tooltipLabel .tooltipContent {
                visibility: hidden;
                text-align: left;
                font-weight: normal;
                font-size: 14px;
                bottom: 26px;
                left: 50%;
                position: absolute;
                z-index: 9998;
                transform: translateX(-50%);
                background-color: #6e6d6d;
                border-radius: 5px;
                color: white;
                padding: 10px 12px;
                min-width: 280px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                font-family: Arial, sans-serif;
                line-height: 1.4;
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
                z-index: 9999;
                top: 0px;
                left: 50%;
                transform: translate(-9px, -12px);
                border-left: 12px solid transparent;
                border-right: 12px solid transparent;
                border-top: 10px solid #6e6d6d;
            }
        `;
        document.head.appendChild(style);
    }

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

    // Function to convert timestamp to readable format
    function convertTimestamp(timestampStr) {
        let jsDate;

        // Check if it's a Unix timestamp (numeric)
        const numericInput = parseFloat(timestampStr);
        if (!isNaN(numericInput) && /^\d+(\.\d+)?$/.test(timestampStr.trim())) {
            // Handle Unix timestamps
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
                // Number is outside reasonable timestamp range, don't treat as timestamp
                return null;
            }
        } else {
            // Check if timestamp has no timezone info and assume UTC
            let processedTimestamp = timestampStr.replace(/(\n|\t)/gm, '');

            // Patterns that likely don't have timezone info - assume UTC
            const noTimezonePatterns = [
                /^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\s+\d{1,2}:\d{2}:\d{2}$/,  // 2025/07/11 18:23:44
                /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/,  // 2025-07-11 18:23:44
                /^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\s+\d{1,2}:\d{2}:\d{2}$/   // 07/11/2025 18:23:44
            ];

            const hasNoTimezone = noTimezonePatterns.some(pattern => pattern.test(processedTimestamp));

            if (hasNoTimezone) {
                // Assume UTC by appending 'UTC' to the string
                processedTimestamp += ' UTC';
            }

            // Try to parse as regular date string
            jsDate = new Date(processedTimestamp);
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

            return {
                formatted: formattedDate,
                timeAgo: timeAgo
            };
        }

        return null;
    }

    // Function to create tooltip HTML
    function createTooltipHTML(originalText, convertedResult) {
        return `<span class="tooltipLabel">
            <span>${originalText}</span>
            <span class="tooltipContentTriangle"></span>
            <span class="tooltipContent">
                <div style="margin-bottom: 8px;"><strong>Date:</strong> ${convertedResult.formatted}</div>
                <div style="color: #87ceeb;"><strong>Time ago:</strong> ${convertedResult.timeAgo}</div>
            </span>
        </span>`;
    }

    // Patterns to match various timestamp formats
    const timestampPatterns = [
        // Unix timestamps (10+ digits)
        /\b\d{10,13}\b/g,

        // ISO 8601 formats
        /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?\b/g,
        /\b\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\b/g,

        // Common date formats
        /\b\w{3}\s+\d{1,2}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\b/g, // Jun 09 2018 15:28:14
        /\b\w{3}\s+\d{1,2},\s+\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[AP]M\b/g, // Dec 2, 2017 2:39:58 AM

        // Date with separators
        /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}[\s\*]\d{2}:\d{2}:\d{2}\b/g,
        /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}\s+\d{1,2}:\d{2}:\d{2}\s*[AP]M?\b/gi,
    ];

    // Function to find and replace timestamps in text nodes
    function processTextNode(textNode) {
        if (!textNode.nodeValue || textNode.nodeValue.trim().length === 0) return;

        let text = textNode.nodeValue;
        let hasMatch = false;
        let newHTML = text;

        // Check each pattern
        for (const pattern of timestampPatterns) {
            const matches = text.match(pattern);
            if (matches) {
                for (const match of matches) {
                    const converted = convertTimestamp(match);
                    if (converted) {
                        const tooltipHTML = createTooltipHTML(match, converted);
                        newHTML = newHTML.replace(match, tooltipHTML);
                        hasMatch = true;
                    }
                }
            }
        }

        // If we found matches, replace the text node with HTML
        if (hasMatch) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = newHTML;
            textNode.parentNode.replaceChild(wrapper, textNode);
        }
    }

    // Function to walk through all text nodes
    function processAllTextNodes(node = document.body) {
        if (!node) return;

        // Skip script, style, and already processed elements
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            if (tagName === 'script' || tagName === 'style' ||
                tagName === 'noscript' || node.classList.contains('tooltipLabel')) {
                return;
            }
        }

        if (node.nodeType === Node.TEXT_NODE) {
            processTextNode(node);
        } else {
            // Process child nodes (make a copy of the list since we might modify it)
            const children = Array.from(node.childNodes);
            children.forEach(child => processAllTextNodes(child));
        }
    }

    // Main function to run timestamp detection
    function detectAndConvertTimestamps() {
        addTooltipStyles();
        processAllTextNodes();
        console.log('Timestamp Tooltip: Automatic detection completed');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', detectAndConvertTimestamps);
    } else {
        detectAndConvertTimestamps();
    }

    // Also run on dynamic content changes (with debouncing)
    let timeoutId;
    const observer = new MutationObserver(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(detectAndConvertTimestamps, 1000);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
