/**
 * EthosJS - A micro-library for providing development speed and convenience 
 * 
 * Author: Ryan Mitchener
 * Date: July 2016
 */

// Setup global object
window.EthosJS = window.ejs = {};

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
};

/* -------------------- */

// Animate method
// http://easings.net/#
EthosJS.Animation = function(curve, duration, callback) {
    this.curve = curve || new EthosJS.CubicBezier(1, 1, 1, 1); // Default to linear
    this.duration = duration || 500; // Default to 500 ms
    this.callback = callback || null;
    this.iterations = 1;

    // Vars that need reset
    this.start = null;
    this.end = null; 
    this.paused = false;
    this.started = false;
    this.finished = false;
    this.startFrom = 0;
    this.iterationsRemaining = this.iterations;
};


EthosJS.Animation.prototype.setCurve = function(curve) {
    this.curve = curve;
    return this;
};


EthosJS.Animation.prototype.setFrames = function(frames) {
    this.frames = frames;
    return this;
};


EthosJS.Animation.prototype.setIterations = function(iterations) {
    this.iterations = iterations;
    this.iterationsRemaining = this.iterations;
    return this;
};


EthosJS.Animation.prototype.setDuration = function(duration) {
    this.duration = duration;
    return this;
};


EthosJS.Animation.prototype.setCallback = function(callback) {
    this.callback = callback;
    return this;
};


EthosJS.Animation.prototype.play = function() {
    if (this.paused) {
        this.paused = false;
    }
    this.start = new Date().getTime() - this.startFrom;
    this.end = this.start + this.duration;
    this.started = true;
    this._render();
    return this;
};


EthosJS.Animation.prototype.pause = function() {
    this.startFrom = new Date().getTime() - this.start;
    this.paused = true;
    return this;
};


EthosJS.Animation.prototype.reset = function(resetIterations) {
    resetIterations = (resetIterations === undefined) ? true : resetIterations;
    this.start = null;
    this.end = null; 
    this.paused = false;
    this.started = false;
    this.finished = false;
    this.startFrom = 0;
    if (resetIterations) {
        this.iterationsRemaining = this.iterations;
    }
    return this;
};


// Render loop
// TODO: This has a priority on finishing on time rather than the animation being accurate,
// The priority could instead be on the animation being accurate. This would require using
// desired frame count instead of timed duration
EthosJS.Animation.prototype._render = function() {
    // Return if paused
    if (this.paused) {
        return;
    }

    // Fire callback first to make sure that even if the animation can only play one frame, 
    // the final frame of the animation will be played
    var elapsed = new Date().getTime() - this.start;
    var curvePos = Math.min(1, elapsed / this.duration);
    var x = this.curve.solve(curvePos, EthosJS.CubicBezier.solveEpsilon(this.duration));

    // Fire callback
    if (this.callback !== null) {
        this.callback.call(this, x);
    }

    // Check if current iteration is done
    if (elapsed >= this.duration) {
        this.iterationsRemaining -= (this.iterationsRemaining > 0) ? 1 : 0;
        if (this.iterationsRemaining === 0) {
            this.finished = true;
            return;
        }
        // If there are iterations remaining, reset, play, and return
        this.reset(false);
        this.play();
        return;
    }
    requestAnimationFrame(this._render.bind(this));
};



/**
 * RequestAnimationFrame polyfill (https://gist.github.com/paulirish/1579671)
 * ------------------------------------------------------------------------ 
 */
(function() {
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

// Set bits
// Unset bits

/* -------------------- */

// Setup isMobile property
EthosJS.isMobile = (/Android|iPad|iPhone|iPod/i).test(navigator.userAgent);

// Misc execution
(function() {
    // Set if the browser is mobile or desktop browser
    if (EthosJS.isMobile) {
        document.body.classList.add("ethos-js--mobile");
    } else {
        document.body.classList.add("ethos-js--desktop");
    }
})();

/* -------------------- */

/**
 * Cubic Bezier 
 * (ported from Blink https://chromium.googlesource.com/chromium/blink/+/master/Source/platform/animation/UnitBezier.h)
 * (help from https://gist.github.com/mckamey/3783009)
 */
EthosJS.CubicBezier = function(p1x, p1y, p2x, p2y) {
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;
    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;
    this.m_startGradient;
    this.m_endGradient;

    if (p1x > 0) {
        this.m_startGradient = p1y / p1x;
    } else if (!p1y && p2x > 0) {
        this.m_startGradient = p2y / p2x;
    } else {
        this.m_startGradient = 0;
    }

    if (p2x < 1) {
        this.m_endGradient = (p2y - 1) / (p2x - 1);
    } else if (p2x == 1 && p1x < 1) {
        this.m_endGradient = (p1y - 1) / (p1x - 1);
    } else {
        this.m_endGradient = 0;
    }
};


EthosJS.CubicBezier.solveEpsilon = function(duration) {
    return 1.0 / (200.0 * duration);
};


EthosJS.CubicBezier.prototype.sampleCurveX = function(t) {
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((this.ax * t + this.bx) * t + this.cx) * t;
};


EthosJS.CubicBezier.prototype.sampleCurveY = function(t) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
};


EthosJS.CubicBezier.prototype.sampleCurveDerivativeX = function(t) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
};


// Given an x value, find a parametric value it came from.
EthosJS.CubicBezier.prototype.solveCurveX = function(x, epsilon) {
    var t0, t1, t2, x2, d2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {
        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) {
            return t2;
        }
        d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) {
            break;
        }
        t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    while (t0 < t1) {
        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) {
            return t2;
        } else if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }
        t2 = (t1 - t0) * .5 + t0;
    }

    // Failure.
    return t2;
};


// Evaluates y at the given x. The epsilon parameter provides a hint as to the required
// accuracy and is not guaranteed.
EthosJS.CubicBezier.prototype.solve = function(x, epsilon) {
    if (x < 0.0) {
        return 0.0 + this.m_startGradient * x;
    } else if (x > 1.0) {
        return 1.0 + this.m_endGradient * (x - 1.0);
    }
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
};

/* -------------------- */

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

/* -------------------- */

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