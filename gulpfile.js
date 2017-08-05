var gulp = require("gulp");
var del = require("del");
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var gutil = require('gulp-util');
var minifyCss = require('gulp-minify-css');
var runSequence = require('run-sequence');
var minifyHtml = require('gulp-minify-html')
var lazypipe = require('lazypipe');
var replace = require('gulp-replace-task');
var closure = require('gulp-jsclosure')
var uglify = require('gulp-uglify');
var minimist = require('minimist');
var rename = require('gulp-rename');
var merge = require('merge-stream');
var inject = require('gulp-inject');
var browserSync = require('browser-sync').create();
var historyApiFallback = require('connect-history-api-fallback');
var series = require('stream-series');
var ngAnnotate = require('gulp-ng-annotate');
var cssnano = require('gulp-cssnano');
var gulpif = require('gulp-if');

// Define default configuration
var gulpTaskConfig = {
    files: {
        cssMin: "client.style.min.css",
        vendorJs: "client.vendor.js",
        scriptsJs: "client.scripts.js",
        suffix: ".min"
    }
};
var scriptsSuffix = ".min";

var knownOptions = {
    string: 'env',
    default: { env: process.env.NODE_ENV || 'dev' }
};

var options = minimist(process.argv.slice(2), knownOptions);
gulpTaskConfig.isProd = options.env == "prod" ? true : false;

var config = require('./gulp.config');

/* SASS Compile & css */
gulp.task('css', function() {
    var sassStream = gulp.src(config.styleSheets.src)
        .pipe(sass({
            outputStyle: "compressed" //compressed ,expanded
        }).on('error', sass.logError));
    var cssStream = gulp.src(config.vendorCss.src)
        .pipe(minifyCss({
            compatibility: 'ie8',
            keepSpecialComments: 0
        }));

    return merge(cssStream, sassStream)
        .pipe(cssnano())
        .pipe(concat(gulpTaskConfig.files.cssMin))
        .pipe(gulp.dest("./assets/css/"));
});

/* vendor scripts */
gulp.task('vendorJs', function() {
    return gulp.src(config.vendorJs.src)
        .pipe(gulpif(gulpTaskConfig.isProd, uglify()))
        .pipe(concat(gulpTaskConfig.files.vendorJs))
        .pipe(gulpif(gulpTaskConfig.isProd, rename({ suffix: scriptsSuffix })))
        .pipe(gulp.dest("./assets/js/"));
});

/* custom scripts */
gulp.task('scripts', function() {
    return gulp.src(config.scripts.src)
        .pipe(concat(gulpTaskConfig.files.scriptsJs))
        .pipe(closure({ window: true, document: true }))
        .pipe(gulpif(gulpTaskConfig.isProd, uglify()))
        .pipe(gulpif(gulpTaskConfig.isProd, rename({ suffix: scriptsSuffix })))
        .pipe(gulp.dest("./assets/js/"));

});

/* Clean css/js and templates */
gulp.task('clean', function() {
    return del([
        "./assets/css",
        "./assets/js"
    ]);
});

gulp.task('watch', function() {
    gulp.watch([config.scripts.src, 'components/**/*.html'], ['scripts']);
    gulp.watch([config.styleSheets.src, 'components/**/*.scss'], ['css']);
});

gulp.task('serve', [], function() {
    browserSync.init(['./*.*', './**/*.*', './**/**/*.*'], {
        port: 3000,
        server: {
            baseDir: './',
            middleware: [historyApiFallback()]

        }
    });
});


gulp.task('injectAssets', function() {
    var target = gulp.src('index.html');
    var vendorStream = gulp.src([config.rootPath + 'assets/**/*.*vendor.*'], { read: false });
    var appStream = gulp.src([config.rootPath + 'assets/**/*.*scripts.*'], { read: false });
    var cssStream = gulp.src([config.rootPath + 'assets/**/*.css'], { read: false });
    return target.pipe(inject(series(cssStream, vendorStream, appStream), { ignorePath: '/' }))
        .pipe(gulp.dest("./"));
});


gulp.task('allTasks', function(callback) {
    runSequence(['clean'], ['css', 'vendorJs', 'scripts'], ['injectAssets', 'serve'], callback);
});

gulp.task('build:dev', function(callback) {
    runSequence(['allTasks', 'watch'], callback);
});
gulp.task('build:serve', function(callback) {
    runSequence(['allTasks'], callback);
});

gulp.task("default", ['build:dev'], function() {});
