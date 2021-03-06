/**
 * EthosJS - A micro-library for providing development speed and convenience 
 * 
 * Author: Ryan Mitchener
 * Date: July 2016
 */

// Setup global object
window.EthosJS = window.ejs = {};


// Simple alias for querySelector
EthosJS.query = document.querySelector.bind(document);

// Simple alias for querySelectorAll
EthosJS.queryAll = document.querySelectorAll.bind(document);


// Method for verifying if an element matches a CSS selector
EthosJS.matches = (function() {
    var matches = null;
    if (document.body.matches !== undefined) {
        matches = "matches";
    } else if (document.body.webkitMatches !== undefined) {
        matches = "webkitMatches";
    } else if (document.body.msMatchesSelector !== undefined) {
        matches = "msMatchesSelector";
    }
    return function(node, selector) { return node[matches](selector); }
})();


// Find the closest ancestor to an element that matches a selector
// Optional limit parameter limits the amount of parents to traverse
EthosJS.parent = function(element, selector, limit) {
    if (typeof element === "string") {
        element = document.querySelector(element);
    }
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
};


// Find if a sibling of an element exists
EthosJS.sibling = function(element, selector) {
    if (typeof element === "string") {
        element = document.querySelector(element);
    }
    if (element.parentElement === null) {
        return null;
    }
    var children = element.parentElement.children;
    for (var i=0, l=children.length; i<l; i++) {
        if (EthosJS.matches(children[i], selector)) {
            return children[i];
        }
    }
    return null;
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
};


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
};


// Find the true offset top for an element
EthosJS.offsetTop = function(element) {
    var top = element.offsetTop;
    var parent = element.offsetParent;
    while (parent !== null) {
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return top;
};


// Find the true offset left for an element
EthosJS.offsetLeft = function(element) {
    var left = element.offsetLeft;
    var parent = element.offsetParent;
    while (parent !== null) {
        left += parent.offsetLeft;
        parent = parent.offsetParent;
    }
    return left;
};


/**
 * Copy an Object and its values recursively into a new instance.
 *
 * @note This will only copy by value
 *
 * @params object src The object to copy
 * @params boolean preservePrototype (default: true) Preserve the prototype of every object
 *
 * @return object A copy of the src object
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
};


/**
 * Animate scroll on a particular element to a particular Y coordinate
 */
EthosJS.scrollTo = function(element, y) {
    var isWindow = (element === null) ? true : false; 
    var start = (isWindow) ? pageYOffset : element.scrollTop;
    var difference = Math.abs(start - y);
    if (difference === 0) {
        return;
    }
    new EthosJS.Animation()
        .setCurve(EthosJS.Curve.EaseInOutQuart)
        .setDuration(1000)
        .setRenderCallback(function(interpolatedTime) {
            if (isWindow) {
                window.scrollTo(pageXOffset, start + ((y > start) ? (difference * interpolatedTime) : -(difference * interpolatedTime)));
            } else {
                element.scrollTop = (start + ((y > start) ? (difference * interpolatedTime) : -(difference * interpolatedTime)));
            }
        })
        .play();
};


/**
 * Animate scroll to a particular element with or without a specified padding
 */
EthosJS.scrollToElement = function(element, padding) {
    padding = (padding === undefined) ? 0 : padding;
    var y = pageYOffset + (element.getBoundingClientRect().top - padding);
    EthosJS.scrollTo(null, y);
};