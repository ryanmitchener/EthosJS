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


/**
 * Animate scroll to a particular Y coordinate on the page or on an element
 */
EthosJS.scrollTo = function(element, y) {
    var isWindow = (element === null) ? true : false; 
    var start = (isWindow) ? pageYOffset : element.scrollTop;
    var difference = Math.abs(start - y);
    new EthosJS.Animation()
        .setCurve(EthosJS.Curve.EaseInOutQuart)
        .setDuration(800)
        .setRenderCallback(function(interpolatedTime) {
            if (isWindow) {
                scrollTo(pageXOffset, start + ((y > start) ? (difference * interpolatedTime) : -(difference * interpolatedTime)));
            } else {
                element.scrollTop = (start + ((y > start) ? (difference * interpolatedTime) : -(difference * interpolatedTime)));
            }
        })
        .play();
}

/* -------------------- */

// Animate method
// http://easings.net/#
EthosJS.Animation = function(curve, duration, renderCallback) {
    this.curve = curve || new EthosJS.CubicBezier(1, 1, 1, 1); // Default to linear
    this.duration = duration || 500; // Default to 500 ms
    this.renderCallback = renderCallback || null;
    this.onFinishListener = null;
    this.iterations = 1;

    // Vars that need reset
    this.start = null;
    this.end = null;
    this.state = EthosJS.Animation.STATE_IDLE; 
    this.startFrom = 0;
    this.iterationsRemaining = this.iterations;
};


// State constants
EthosJS.Animation.STATE_IDLE = 0;
EthosJS.Animation.STATE_PLAYING = 1;
EthosJS.Animation.STATE_PAUSED = 2;
EthosJS.Animation.STATE_FINISHED = 3;


/**
 * Set the CubicBezier curve
 * 
 * @param EthosJS.CubicBezier curve
 */
EthosJS.Animation.prototype.setCurve = function(curve) {
    this.curve = curve;
    return this;
};


/**
 * Set the amount of times the animation will play
 */
EthosJS.Animation.prototype.setIterations = function(iterations) {
    this.iterations = iterations;
    this.iterationsRemaining = this.iterations;
    return this;
};


/**
 * Set the duration of the animation
 * 
 * @param int duration The duration in milliseconds
 */
EthosJS.Animation.prototype.setDuration = function(duration) {
    this.duration = duration;
    return this;
};


/**
 * Set the render callback
 * This callback is called many times a second once the animation has started.
 * Keep it as lean as possible.
 * 
 * @param function(time) renderCallback The callback
 */
EthosJS.Animation.prototype.setRenderCallback = function(renderCallback) {
    this.renderCallback = renderCallback;
    return this;
};


/**
 * Set the onFinishListener
 * 
 * @param function listener The listener that will be called on animation completion
 */
EthosJS.Animation.prototype.setOnFinishListener = function(listener) {
    this.onFinishListener = listener;
    return this;
};


/**
 * Play the animation
 * This method will start the animation. If the animation is playing when this method
 * is called, the animation will start over
 */
EthosJS.Animation.prototype.play = function() {
    if (this.state === EthosJS.Animation.STATE_PAUSED) {
        this.start = new Date().getTime() - this.startFrom;
    } else {
        this.start = new Date().getTime();
    }
    this.state = EthosJS.Animation.STATE_PLAYING;
    this.end = this.start + this.duration;
    this._render();
    return this;
};


/**
 * Pause the animation
 */
EthosJS.Animation.prototype.pause = function() {
    this.startFrom = new Date().getTime() - this.start;
    this.state = EthosJS.Animation.STATE_PAUSED;
    return this;
};


/**
 * Reset the animation
 * 
 * @param boolean resetIterations If TRUE, the amount of iterations that have been
 *      completed will be reset to the original number of iterations set by the user.
 */
EthosJS.Animation.prototype.reset = function(resetIterations) {
    resetIterations = (resetIterations === undefined) ? true : resetIterations;
    this.start = null;
    this.end = null; 
    this.state = EthosJS.Animation.STATE_IDLE;
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
    if (this.state === EthosJS.Animation.STATE_PAUSED) {
        return;
    }

    // Fire callback first to make sure that even if the animation can only play one frame, 
    // the final frame of the animation will be played
    var elapsed = new Date().getTime() - this.start;
    var curvePos = Math.min(1, elapsed / this.duration);
    var x = this.curve.solve(curvePos, EthosJS.CubicBezier.solveEpsilon(this.duration));

    // Fire callback
    if (this.renderCallback !== null) {
        this.renderCallback.call(this, x);
    }

    // Check if current iteration is done
    if (elapsed >= this.duration) {
        this.iterationsRemaining -= (this.iterationsRemaining > 0) ? 1 : 0;
        if (this.iterationsRemaining === 0) {
            this.state = EthosJS.Animation.STATE_FINISHED;
            if (this.onFinishListener !== null) {
                this.onFinishListener();
            }
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

/** 
 * Set a bit
 * 
 * @param int byte The value to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.setBit = function(byte, bit) {
    return byte | (1 << bit);
}


/** 
 * Unset a bit
 * 
 * @param int byte The value to set a bit on
 * @param int bit The bit index to set (0 indexed)  
 */
EthosJS.unsetBit = function(byte, bit) {
    return byte & ~(1 << bit);
}


/** 
 * Append a value to the beginning of an existing byte/integer
 * 
 * @param int byte The value to append another value to
 * @param int value The value to append
 * @param int maxValue (optional) The maximum value the appended value can be 
 */
EthosJS.appendBitValue = function(byte, value, maxValue) {
    maxValue = (maxValue === undefined) ? value : maxValue;
    var shift = Math.ceil(Math.log2(maxValue));
    return (byte << shift) | value;
}


/** 
 * Read a value from a byte/integer
 * This function allows reading of whole values based on a maximum value
 * 
 * @param int byte The value to read from
 * @param int shift The shift amount/location in the data to start reading a byte from 
 * @param int maxValue The maximum value the read value can be  
 */
EthosJS.readBitValue = function(byte, shift, maxValue) {
    var mask = Math.pow(2, Math.ceil(Math.log2(maxValue))) - 1;
    return (byte >> shift) & mask;
}

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

    // // Set the browser constant
    // var ieTest1 = /Trident\/.*rv:([0-9]{2,2})\.0/.exec(navigator.userAgent);
    // var ieTest2 = /MSIE\s([0-9]{1,2})\.0/.exec(navigator.userAgent);  
    // if ((ieTest1.length > 0 || ieTest2.length > 0) && 
    //         navigator.userAgent.indexOf("opera") === -1) {
    //     EthosJS.browser = {name: "IE", version: 1};
    // } else if () {

    // }
})();

/* -------------------- */

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

/* -------------------- */



/* -------------------- */

/**
 * Cubic Bezier 
 * (ported from Blink https://chromium.googlesource.com/chromium/blink/+/master/Source/platform/animation/UnitBezier.h)
 * (help from https://gist.github.com/mckamey/3783009)
 *
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
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

// Different cubic bezier curves for animations (http://easings.net/)
EthosJS.Curve = {
    Linear: new EthosJS.CubicBezier(1,1,1,1),
    Ease: new EthosJS.CubicBezier(0,0,0.2,1),
    EaseInOut: new EthosJS.CubicBezier(0.42, 0, 0.58, 1),
    
    EaseInSine: new EthosJS.CubicBezier(0.47, 0, 0.745, 0.715),
    EaseInCubic: new EthosJS.CubicBezier(0.55, 0.055, 0.675, 0.19),
    EaseInQuint: new EthosJS.CubicBezier(0.755, 0.05, 0.855, 0.06),
    EaseInQuad: new EthosJS.CubicBezier(0.55, 0.085, 0.68, 0.53),
    EaseInQuart: new EthosJS.CubicBezier(0.895, 0.03, 0.685, 0.22),
    EaseInExpo: new EthosJS.CubicBezier(0.95, 0.05, 0.795, 0.035),
    EaseInBack: new EthosJS.CubicBezier(0.6, -0.28, 0.735, 0.045),

    EaseOutSine: new EthosJS.CubicBezier(0.445, 0.05, 0.55, 0.95),
    EaseOutCubic: new EthosJS.CubicBezier(0.215, 0.61, 0.355, 1),
    EaseOutQuint: new EthosJS.CubicBezier(0.23, 1, 0.32, 1),
    EaseOutQuad: new EthosJS.CubicBezier(0.25, 0.46, 0.45, 0.94),
    EaseOutQuart: new EthosJS.CubicBezier(0.165, 0.84, 0.44, 1),
    EaseOutExpo: new EthosJS.CubicBezier(0.19, 1, 0.22, 1),
    EaseOutBack: new EthosJS.CubicBezier(0.175, 0.885, 0.32, 1.275),

    EaseInOutSine: new EthosJS.CubicBezier(0.445, 0.05, 0.55, 0.95),
    EaseInOutCubic: new EthosJS.CubicBezier(0.645, 0.045, 0.355, 1),
    EaseInOutQuint: new EthosJS.CubicBezier(0.86, 0, 0.07, 1),
    EaseInOutQuad: new EthosJS.CubicBezier(0.455, 0.03, 0.515, 0.955),
    EaseInOutQuart: new EthosJS.CubicBezier(0.77, 0, 0.175, 1),
    EaseInOutExpo: new EthosJS.CubicBezier(1, 0, 0, 1),
    EaseInOutBack: new EthosJS.CubicBezier(0.68, -0.55, 0.265, 1.55)
};

/* -------------------- */

/**
 * Make an element Dragger
 * 
 * @param string|Element element The element or query selector to be Dragger
 */
EthosJS.Dragger = function(element) {
    this.element = (typeof element === "string") ? document.querySelector(element) : element;
    this.axis = EthosJS.Dragger.AXIS_X | EthosJS.Dragger.AXIS_Y;
    this.rebound = 0;
    this.animating = false;
    this.handling = false;
    this.enabled = true;

    // Physics
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.95;
    this.start = {time: null, x: null, y: null};
    this.end = {time: null, x: null, y: null};

    // Position
    this.cursorX = 0;
    this.cursorY = 0;

    // Attach events
    this.attachEvents();
};


/**
 * Set up contants
 */
EthosJS.Dragger.AXIS_X = 1;
EthosJS.Dragger.AXIS_Y = 2;


/**
 * Attach all the necessary events
 */
EthosJS.Dragger.prototype.attachEvents = function() {
    this.element.addEventListener(EthosJS.Event.pointerDown, this.handlePointerDown.bind(this));
    window.addEventListener(EthosJS.Event.pointerUp, this.handlePointerUp.bind(this));
    window.addEventListener(EthosJS.Event.pointerMove, this.handlePointerMove.bind(this));
}


/**
 * Set the boundaries for the element
 * 
 * @param mixed 
 *      Element: If an element is passed, set the boundaries to the boundingClientRect of the element
 *      Object{top, right, bottom, left}, sets the boundaries to the integers provided in relation to the parent element 
 *      
 */
EthosJS.Dragger.prototype.setBoundaries = function(boundary) {
    return this;
};


/**
 * Set the axis the element should be Dragger on
 * 
 * @param int axis The axis the element is Dragger on (example: EthosJS.Dragger.AXIS_X | EthosJS.Dragger.AXIS_Y).
 */
EthosJS.Dragger.prototype.setAxis = function(axis) {
    this.axis = axis;
    return this;
};


/**
 * Set the friction amount
 * 
 * @param int friction The amount of friction to apply after a fling (0.00 - 1.00) 0.00 being no friction 
 */
EthosJS.Dragger.prototype.setFriction = function(friction) {
    this.friction = 1.00 - friction;
    return this;
};


/**
 * Set the axis the element should be Dragger on
 * 
 * @param int rebount The amount of rebound to have when interacting with a boundary (0.00 - 1.00) 0 being none.
 */
EthosJS.Dragger.prototype.setRebound = function(rebound) {
    this.rebound = rebound;
    return this;
};


EthosJS.Dragger.prototype.handlePointerDown = function(ev) {
    if (!this.enabled) {
        return;
    }
    this.handling = true;
    this.animating = false;
    this.cursorX = ev.pageX;
    this.cursorY = ev.pageY;
    this.start.time = new Date().getTime();
    this.start.x = ev.pageX;
    this.start.y = ev.pageY;
};


EthosJS.Dragger.prototype.handlePointerUp = function(ev) {
    if (!this.enabled) {
        return;
    }
    this.handling = false;
    this.end.time = new Date().getTime();
    this.end.x = ev.pageX;
    this.end.y = ev.pageY;
    var time = (this.end.time - this.start.time);
    var velocityX = ((this.end.x - this.start.x) / time) * 16.666666;
    var velocityY = ((this.end.y - this.start.y) / time) * 16.666666;
    console.log(velocityX, velocityY);
};


EthosJS.Dragger.prototype.handlePointerMove = function(ev) {
    if (!this.enabled) {
        return;
    } if (this.handling === false) {
        return;
    }

    // Get the new X,Y deltas
    var deltaX = ev.pageX - this.cursorX;
    var deltaY = ev.pageY - this.cursorY;
    this.cursorX = ev.pageX;
    this.cursorY = ev.pageY;

    // TODO: Figure out a way to parse the transform and not affect any other transforms
    // I could use a matrix, or I could simply append an additional translate to the end
    // TODO: Handle bounds
    var style = getComputedStyle(this.element);
    console.log(style[EthosJS.transform]);

    // var x = parseInt(this.element.style[EthosJS.transform].replace(/[^\d\-\.]/g, "")) + deltaX;
    // var y = parseInt(this.element.style[EthosJS.transform].replace(/[^\d\-\.]/g, "")) + deltaY;
    
    // Set the new position of the scroll ul
    // this.element.style[EthosJS.transform] = "translate(" + x + "px," + y + "px)";
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


/**
 * Event helpers
 */
EthosJS.Event = {
    pointerDown: (EthosJS.isMobile) ? "touchstart" : "mousedown",
    pointerUp: (EthosJS.isMobile) ? "touchend" : "mouseup",
    pointerMove: (EthosJS.isMobile) ? "touchmove" : "mousemove"
};

/* -------------------- */

(function() {
    EthosJS.formToJSON = function(element) {
        if (typeof element === "string") {
            element = document.querySelector(element);
        }
        var fields = element.querySelectorAll("input,select,textarea");
        var data = {};
        for (var i=0, l=fields.length; i < l; i++) {
            var field = fields[i];
            if (field.tagName === "INPUT") {
                var type = field.getAttribute("type");
                if (type === "checkbox") {
                	setValue(data, field.name, field.checked);
                } else if (type === "radio") {
                	if (field.checked) {
						setValue(data, field.name, field.value);
                	}
                } else {
                    setValue(data, field.name, field.value);
                }
            } else if (field.tagName === "SELECT") {
                setValue(data, field.name, field.value);
            } else if (field.tagName === "TEXTAREA") {
                setValue(data, field.name, field.value);
            }
        }
        return data;
    }


    // Set the value of an object based on string key (supports nested objects)
    function setValue(obj, key, value) {
        var prefixes = key.split(".");
        var current = obj;

        for (var i=0, l=prefixes.length; i < l; i++) {
            if (i === prefixes.length - 1) {
            	current[prefixes[i]] = value;
            	return;
            } else if (current[prefixes[i]] === undefined) {
                current[prefixes[i]] = {};
            };
            current = current[prefixes[i]];
        }
    }
})();

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