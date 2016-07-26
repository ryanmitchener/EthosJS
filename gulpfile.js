var gulp = require("gulp");
var concat = require("gulp-concat");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var package = require("./package.json");

// Setup scripts to watch, minify, and concat
var scripts = ["src/EthosJS.js", "src/**/*.js"];
var destination = "./dist/";


// Watch file changes
var watcher = gulp.watch(scripts.concat(scripts), ["scripts"]);
watcher.on("change", function(event) {
    console.log("File " + event.path + " was " + event.type + ", running tasks...");
});


// Concatenate and minify scripts
gulp.task("scripts", function() {
    return gulp.src(scripts)
        .pipe(concat(package.name + "-" + package.version + ".concat.js", {newLine: "\n\n/* -------------------- */\n\n"}))
        .pipe(gulp.dest(destination))
        .pipe(rename(package.name + "-" + package.version + ".min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(destination));
});

// Default Gulp task
gulp.task("default", ["scripts"]);