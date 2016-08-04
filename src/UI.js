// Get the transform string
EthosJS.transform = (function() {
    if (document.body.style.transform !== undefined) {
        return "transform";    
    } else if (document.body.style.webkitTransform !== undefined) {
        return "webkitTransform";
    } else if (document.body.style.msTransform !== undefined) {
        return "msTransform";
    }
    return "transform";        
})();


// Dispatch events on the document for different window sizes
(function() {
    var lastWidth = innerWidth;
    var direction = 0;
    var range = [0, Number.MAX_SAFE_INTEGER];
    getCurrentIndex();


    // Check the window size
    function checkWindowSize() {
        direction = (lastWidth < innerWidth) ? 1 : 0;
        lastWidth = innerWidth;
        if (innerWidth >= range[1]) {
            EthosJS.dispatchEvent(window, "windowsizechange", {size: range[1], direction: direction});
            getCurrentIndex();
        } else if (innerWidth <= range[0]) {
            EthosJS.dispatchEvent(window, "windowsizechange", {size: range[0], direction: direction});
            getCurrentIndex();
        }
    }


    // Get the current index
    function getCurrentIndex() {
        var index = -1;
        for (var i=0, l=EthosJS.Config.windowSizeEvents.length; i<l; i++) {
            if (innerWidth > EthosJS.Config.windowSizeEvents[i]) {
                index = i;
            } else {
                break;
            }
        }
        if (index === EthosJS.Config.windowSizeEvents.length - 1) {
            range[0] = EthosJS.Config.windowSizeEvents[index];
            range[1] = Number.MAX_SAFE_INTEGER;
        } else if (index === -1) {
            range[0] = 0;
            range[1] = EthosJS.Config.windowSizeEvents[0];
        } else {
            range[0] = EthosJS.Config.windowSizeEvents[index];
            range[1] = EthosJS.Config.windowSizeEvents[index + 1];
        }
    }


    // Add resize event listener
    window.addEventListener("resize", checkWindowSize);

    // Register update listener for config
    EthosJS.Config.registerUpdateListener(getCurrentIndex);
})();