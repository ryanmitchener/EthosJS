var box = document.querySelector("div");
var start = 0;
var end = 500;

var anim = new ejs.Animation()
    .setCurve(EthosJS.Curve.EaseInOutBack)
    .setDuration(1000)
    // .setIterations(2)
    .setOnFinishListener(function() {
        console.log("Finished!");
    })
    .setRenderCallback(function(x) {
        box.style.transform = "translateX(" + ((end - start) * x) + "px)";
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


ejs.Config.windowSizeEvents = [400, 600, 800, 1000];
ejs.Config.update();
window.addEventListener("windowsizechange", function(ev) {
    console.log(ev.detail);
});