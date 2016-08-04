/**
 * EthosJS Configuration
 */
EthosJS.Config = {
    /**
     * Window sizes to get events for on resize
     * This should be an array of integers increasing in sizes
     * e.g. [480, 640, 800, 1024, 1200]
     */
    windowSizeEvents: [],
}


/**
 * All of the update listener
 */
EthosJS.Config.updateListeners = {};


/**
 * This should be called whenever the configuration is updated
 */
EthosJS.Config.update = function(type) {
    type = (type === undefined) ? "default" : type;
    if (EthosJS.Config.updateListeners[type] === undefined) {
        console.warn("The " + type + " update type isn't registered.");
        return;
    }
    for (var i=0, l=EthosJS.Config.updateListeners[type].length; i<l; i++) {
        EthosJS.Config.updateListeners[type][i]();
    }
};


/**
 * Register a listener for when the configuration is updated
 */
EthosJS.Config.registerUpdateListener = function(listener, type) {
    type = (type === undefined) ? "default" : type;
    if (EthosJS.Config.updateListeners[type] === undefined) {
        EthosJS.Config.updateListeners[type] = [];
    }
    EthosJS.Config.updateListeners[type].push(listener);
};