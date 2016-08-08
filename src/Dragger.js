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