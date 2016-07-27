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