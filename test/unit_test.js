var box = document.querySelector("div");
var start = 0;
var end = 500;

var anim = new ejs.Animation()
    .setCurve(new EthosJS.CubicBezier(0.645, 0.045, 0.355, 1))
    .setCurve(EthosJS.Curve.EaseInOutBack)
    .setDuration(1000)
    // .setIterations(2)
    .setOnFinishListener(function() {
        console.log("Finished!");
    })
    .setRenderCallback(function(x) {
        box.style.left = ((end - start) * x) + "px";
    });

document.addEventListener("click", function() {
    if (anim.state === EthosJS.Animation.STATE_FINISHED) {
        anim.reset();
    }
    if (anim.state === EthosJS.Animation.STATE_IDLE || anim.state === EthosJS.Animation.STATE_PAUSED) {
        anim.play();
    } else {
        anim.pause();
    }
});
