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

    // Physics
    this.velocityX = 0;
    this.velocityY = 0;
    this.friction = 0.95;
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
    this.element.addEventListener(EthosJS.Event.pointerDown, this.handlePointerDown);
    this.element.addEventListener(EthosJS.Event.pointerUp, this.handlePointerUp);
    this.element.addEventListener(EthosJS.Event.pointerMove, this.handlePointerMove);
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
    this.handling = true;
    this.animating = false;
};

EthosJS.Dragger.prototype.handlePointerUp = function(ev) {
    this.handling = false;
};

EthosJS.Dragger.prototype.handlePointerMove = function(ev) {

};