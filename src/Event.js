(function() {
    EthosJS.Event = {};

    // Function for throttling certain events such as resize
    // Taken from: https://developer.mozilla.org/en-US/docs/Web/Events/resize
    EthosJS.Event.throttle = function(throttledEvent, customEventName, obj) {
        obj = obj || window;
        var running = false;
        var func = function() {
            if (running) { return; }
            running = true;
            requestAnimationFrame(function() {
                // TODO: IE cannot use new CustomEvent()
                obj.dispatchEvent(new CustomEvent(customEventName));
                running = false;
            });
        };
        obj.addEventListener(throttledEvent, func);
    };
})();