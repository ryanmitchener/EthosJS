var box = document.querySelector("div");
var start = 0;
var end = 500;
function test(x) {
    box.style.left = ((end - start) * x) + "px";
}

var anim = new ejs.Animation()
    .setCurve(new EthosJS.CubicBezier(0.645, 0.045, 0.355, 1))
    .setDuration(2000)
    .setIterations(2)
    .setCallback(test);

document.addEventListener("click", function() {
    if (anim.finished) {
        anim.reset();
    }
    if (!anim.started || anim.paused) {
        anim.play();
    } else {
        anim.pause();
    }
});
