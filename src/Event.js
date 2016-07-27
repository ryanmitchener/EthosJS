// CustomEvent polyfill
(function() {
    if (typeof window.CustomEvent === "function") {
        return false;
    }
    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();


// Function for throttling certain events such as resize
// Taken from: https://developer.mozilla.org/en-US/docs/Web/Events/resize
EthosJS.throttleEvent = function(throttledEvent, customEventName, obj) {
    obj = obj || window;
    var running = false;
    var func = function() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(function() {
            obj.dispatchEvent(new CustomEvent(customEventName));
            running = false;
        });
    };
    obj.addEventListener(throttledEvent, func);
};


/**
 * Dispatch a custom event
 * 
 * @param Element target The element to dispatch the event on
 * @param String type The custom event's name to dispatch
 * @param mixed data Any extra data to pass in. This will be found in the "detail" key of the object
 */
EthosJS.dispatchEvent = function(target, type, data) {
    var data = (data === undefined) ? null : {detail: data};
    target.dispatchEvent(new CustomEvent(type, data));
};