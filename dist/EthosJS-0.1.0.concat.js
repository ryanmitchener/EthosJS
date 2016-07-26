/**
 * EthosJS - A micro-library for providing development speed and convenience 
 * 
 * Author: Ryan Mitchener
 * Date: July 2016
 */

(function() {
    // Setup global object
    window.EthosJS = window.ejs = {};

    // Misc vars
    var matches = null;



    // Setup matches
    EthosJS.matches = function(node, selector) {
        if (matches === null) {
            if (document.body.matches !== undefined) {
                matches = "matches";
            } else if (document.body.webkitMatches !== undefined) {
                matches = "webkitMatches";
            } else if (document.body.msMatchesSelector !== undefined) {
                matches = "msMatchesSelector";
            }
        }
        return node.matches(selector);
    }


    // Find the closest ancestor to an element that matches a selector
    // Optional limit parameter limits the amount of parents to traverse
    EthosJS.parent = function(element, selector, limit) {
        limit = (limit - 1) || -1;
        element = element.parentElement;
        while (element !== null && !EthosJS.matches(element, selector)) {
            if (limit === 0) {
                return null;
            }
            element = element.parentElement;
            limit--;
        }
        return element;
    }


    // Find the smallest number in an array
    EthosJS.arrayMin = function(array) {
        if (array.length <= 2000) {
            return Math.min.apply(Math, array);
        }
        var smallest = array[0];
        for (var i=0, l=array.length; i < l; i++) {
            smallest = Math.min(smallest);
        }
        return smallest;
    }


    // Find the smallest number in an array
    EthosJS.arrayMax = function(array) {
        if (array.length <= 2000) {
            return Math.max.apply(Math, array);
        }
        var largest = array[0];
        for (var i=0, l=array.length; i < l; i++) {
            largest = Math.max(largest);
        }
        return largest;
    }


    /**
     * Copy an Object and its values recursively into a new instance.
     *
     * @note This will only copy by value
     *
     * @params object src The object to copy
     * @params boolean preservePrototype (default: true) Preserve the prototype of every object
     *
     * @return objeect A copy of the src object
     */
    EthosJS.copy = function(src, preservePrototype) {
        // Setup default preservePrototype
        preservePrototype = (preservePrototype !== undefined) ? preservePrototype : true; 
        
        // Recursively copy objects by value
        function recurse(dst, src) {
            var keys = (preservePrototype) ? Object.getOwnPropertyNames(src) : Object.keys(src);
            for (var i=0, l=keys.length; i < l; i++) {
                var descriptor = Object.getOwnPropertyDescriptor(src, keys[i]);
                if (!descriptor.value || typeof descriptor.value !== "object") {
                    Object.defineProperty(dst, keys[i], descriptor);
                } else {
                    var cont = (Array.isArray(src[keys[i]])) ? [] : 
                            Object.create((preservePrototype) ? Object.getPrototypeOf(src[keys[i]]) : {});
                    dst[keys[i]] = recurse(cont, src[keys[i]]);
                }
            }
            return dst;
        }
        dst = Object.create(Object.getPrototypeOf(src));
        return recurse(dst, src);
    }
})();

/* -------------------- */

(function() {
    EthosJS.Anim = {};


    /**
     * RequestAnimationFrame polyfill (https://gist.github.com/paulirish/1579671)
     * ------------------------------------------------------------------------ 
     */ 
    var lastTime = 0;
    var id = null;
    var vendors = ["ms", "moz", "webkit", "o"];

    for (var x = 0, l = vendors.length; x < l && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) { clearTimeout(id); };
    }
})();

/* -------------------- */

(function() {
    EthosJS.Bit = {};

    // Set bits

    // Unset bits
})();

/* -------------------- */

(function() {
    EthosJS.Browser = {};

    // Setup isMobile property
    EthosJS.Browser.isMobile = (/Android|iPad|iPhone|iPod/i).test(navigator.userAgent);



    /**
     * Misc Execution
     * ------------------------------------------------------------------------
     */

    // Set if the browser is mobile or desktop browser
    if (EthosJS.Browser.isMobile) {
        document.body.classList.add("ethos-js--mobile");
    } else {
        document.body.classList.add("ethos-js--desktop");
    }
})();

/* -------------------- */

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

/* -------------------- */

(function() {
    EthosJS.UI = {};

    // Get the transform string
    EthosJS.UI.transform = (function() {
        if (document.body.style.transform !== undefined) {
            return "transform";    
        } else if (document.body.style.webkitTransform !== undefined) {
            return "webkitTransform";
        } else if (document.body.style.msTransform !== undefined) {
            return "msTransform";
        }
        return "transform";        
    })();
})();