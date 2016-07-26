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
        return node[matches](selector);
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