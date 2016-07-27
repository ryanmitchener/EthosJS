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