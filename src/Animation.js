// Animate method
// http://easings.net/#
EthosJS.Animation = function(curve, duration, callback) {
    this.curve = curve || new EthosJS.CubicBezier(1, 1, 1, 1); // Default to linear
    this.duration = duration || 500; // Default to 500 ms
    this.callback = callback || null;
    this.iterations = 1;
    this.frames = null;

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
    this.start = new Date().getTime() - this.startFrom;
    if (this.paused) {
        this.paused = false;
    }
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


EthosJS.Animation.prototype.reset = function() {
    this.start = null;
    this.end = null; 
    this.paused = false;
    this.started = false;
    this.finished = false;
    this.startFrom = 0;
    this.iterationsRemaining = this.iterations;
    return this;
};


// Render loop
// TODO: This has a priority on finishing on time rather than the animation being accurate,
// The priority could instead be on the animation being accurate. This would require using
// desired frame count instead of duration
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
        this.callback(x);
    }

    // Check if current iteration is done
    if (elapsed >= this.duration) {
        this.iterationsRemaining--;
        if (this.iterationsRemaining === 0) {
            this.finished = true;
            return;
        }
        // this.reset();
        // this.play();
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