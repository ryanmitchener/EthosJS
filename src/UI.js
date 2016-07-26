(function() {
    EthosJS.UI = {};

    /**
     * Public methods
     * ------------------------------------------------------------------------
     */

    // Transform 
    EthosJS.UI.transform = getTransform();



    /**
     * Private methods
     * ------------------------------------------------------------------------
     */

    // Get the transform according to the browser
    function getTransform() {
        if (document.body.style.transform !== undefined) {
            return "transform";    
        } else if (document.body.style.webkitTransform !== undefined) {
            return "webkitTransform";
        } else if (document.body.style.msTransform !== undefined) {
            return "msTransform";
        } else {
            return "transform";
        }
    }
})();