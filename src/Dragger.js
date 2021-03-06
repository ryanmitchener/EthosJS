/**
 * Make an element draggable
 * 
 * @param string|Element element The element or query selector to be Dragger
 */
EthosJS.Dragger = function(element) {
    this.element = (typeof element === "string") ? document.querySelector(element) : element;
    this.axis = EthosJS.Dragger.AXIS_X | EthosJS.Dragger.AXIS_Y;
    this.animating = false;
    this.handling = false;
    this.enabled = true;
    this.requestedFrame = null;

    // Physics
    this.rebound = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.stopVelocity = 0.1;
    this.lastCursorX = 0;
    this.lastCursorY = 0;
    this.friction = 0.95;
    this.start = {time: null, x: null, y: null};
    this.end = {time: null, x: null, y: null};
    this.boundMin = null;
    this.boundMax = null;

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
 *      Object{top, right, bottom, left}, sets the boundaries to the integers provided in relation to the page 
 *      
 */
EthosJS.Dragger.prototype.setBoundingRect = function(boundRect) {
    if (boundRect instanceof Element) {
        boundRect = boundRect.getBoundingClientRect();
    }
    var elRect = this.element.getBoundingClientRect();
    this.boundMin = {
        x: boundRect.left - elRect.left,
        y: boundRect.top - elRect.top
    };
    this.boundMax = {
        x: boundRect.right - elRect.left - elRect.width,
        y: boundRect.bottom - elRect.top - elRect.height 
    }
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
 * @param int rebound The amount of rebound to have when interacting with a boundary (0.00 - 1.00) 0 being none.
 */
EthosJS.Dragger.prototype.setRebound = function(rebound) {
    this.rebound = rebound;
    return this;
};


/**
 * Set the velocity at which the animation should stop
 *
 * @param float velocity The threshold velocity (pixels per frame) at which the dragger will stop animating
 */
EthosJS.Dragger.prototype.setStopVelocity = function(velocity) {
    this.stopVelocity = velocity;
}



/**
 * Handle the pointer being pressed
 */
EthosJS.Dragger.prototype.handlePointerDown = function(ev) {
    if (!this.enabled) {
        return;
    } else if (ev instanceof TouchEvent) {
        ev = ev.touches[0];
    }
    this.handling = true;
    this.animating = false;
    this.start.time = new Date().getTime();
    this.start.x = ev.pageX;
    this.start.y = ev.pageY;
    this.lastCursorX = ev.pageX;
    this.lastCursorY = ev.pageY;
    this.updateComputedStyle();
    this.setWillChange();
    this.startMatrix = this.getTransformMatrix();
    this.matrix = this.getTransformMatrix();
};


/**
 * Handle the pointer being released
 */
EthosJS.Dragger.prototype.handlePointerUp = function(ev) {
    if (!this.enabled) {
        return;
    } else if (ev instanceof TouchEvent) {
        ev = ev.changedTouches[0];
    }
    this.handling = false;
    this.end.time = new Date().getTime();
    this.end.x = ev.pageX;
    this.end.y = ev.pageY;

    // Start fling if the velocity is great enough
    if ((Math.abs(this.velocityX) >= 6 || Math.abs(this.velocityY) >= 6)) {
        this.animating = true;
        requestAnimationFrame(this.renderFlingFrame.bind(this));
    } else {
        this.handleEndHandling();
    }
};


/**
 * Handle the pointer moving
 */
EthosJS.Dragger.prototype.handlePointerMove = function(ev) {
    if (!this.enabled) {
        return;
    } if (this.handling === false) {
        return;
    } if (this.requestedFrame !== null) { // Throttle the move event because it's fired a lot
        return;
    } else if (ev instanceof TouchEvent) {
        ev = ev.touches[0];
    }

    // Calculate the new X,Y deltas
    var deltaX = ev.pageX - this.lastCursorX;
    var deltaY = ev.pageY - this.lastCursorY;
    this.lastCursorX = ev.pageX;
    this.lastCursorY = ev.pageY;
    
    // Set new matrix/velocity values
    if (this.axis & EthosJS.Dragger.AXIS_X) {
        this.matrix[this.matrix.length - 2] = this.startMatrix[this.matrix.length - 2] + (ev.pageX - this.start.x);
        this.velocityX = deltaX;
    }
    if (this.axis & EthosJS.Dragger.AXIS_Y) {
        this.matrix[this.matrix.length - 1] = this.startMatrix[this.matrix.length - 1] + (ev.pageY - this.start.y);
        this.velocityY = deltaY;
    }

    // Check bounds
    this.checkBounds();

    // Request animation frame
    this.requestedFrame = requestAnimationFrame(this.renderMatrix.bind(this));
};


/**
 * Get the computed style
 */
EthosJS.Dragger.prototype.updateComputedStyle = function() {
    this.computedStyle = getComputedStyle(this.element);
}


/**
 * Get the current transform
 */
EthosJS.Dragger.prototype.getTransformMatrix = function() {
    var matrix = this.computedStyle[EthosJS.transform];
    matrix = (matrix === "none") ? [1,0,0,1,0,0] : matrix.replace(/[^\d\.\,\-]/g, "").split(",").map(Number);
    return matrix;
}


/**
 * Set the transform of the element
 */
EthosJS.Dragger.prototype.renderMatrix = function(matrix) { 
    this.element.style[EthosJS.transform] = "matrix(" + this.matrix.join(",") + ")";
    this.requestedFrame = null;
};


/**
 * Handle Fling
 */
EthosJS.Dragger.prototype.renderFlingFrame = function() {
    if (this.handling || (Math.abs(this.velocityX) < this.stopVelocity && 
            Math.abs(this.velocityY) < this.stopVelocity)) {
        this.handleEndHandling();
        return;
    }
    this.velocityX *= this.friction;
    this.velocityY *= this.friction;
    if (this.axis & EthosJS.Dragger.AXIS_X) {
        this.matrix[this.matrix.length - 2] += this.velocityX;
    }
    if (this.axis & EthosJS.Dragger.AXIS_Y) {
        this.matrix[this.matrix.length - 1] += this.velocityY;
    }

    // Check bounds
    this.checkBounds();

    // Render the frame
    this.renderMatrix();
    requestAnimationFrame(this.renderFlingFrame.bind(this));
};


/**
 * Check if the Dragger is within its bounds
 */
EthosJS.Dragger.prototype.checkBounds = function() {
    if (this.boundMin === null) {
        return;
    }
    var oldX = this.matrix[this.matrix.length - 2];
    var oldY = this.matrix[this.matrix.length - 1];
    this.matrix[this.matrix.length - 2] = Math.max(this.boundMin.x, Math.min(this.boundMax.x, oldX));
    this.matrix[this.matrix.length - 1] = Math.max(this.boundMin.y, Math.min(this.boundMax.y, oldY));

    // Apply rebound velocity
    if (this.matrix[this.matrix.length - 2] !== oldX) {
        this.velocityX *= -this.rebound;
    }
    if (this.matrix[this.matrix.length - 1] !== oldY) {
        this.velocityY *= -this.rebound;
    }
};


/**
 * Handle when all handling and animations have stopped
 */
EthosJS.Dragger.prototype.handleEndHandling = function() {
    this.animating = false;
    this.removeWillChange();
};


/**
 * Set will-change
 */
EthosJS.Dragger.prototype.setWillChange = function() {
    this.removeWillChange();
    this.element.style.willChange = (this.computedStyle.willChange === "auto") ? "transform" : this.computedStyle.willChange + ",transform";
};


/**
 * Remove will-change
 */
EthosJS.Dragger.prototype.removeWillChange = function() {
    this.element.style.willChange = this.computedStyle.willChange.replace(/(,\s)?transform/g, "");
};