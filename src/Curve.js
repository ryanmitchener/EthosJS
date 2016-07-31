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