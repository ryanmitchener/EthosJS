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