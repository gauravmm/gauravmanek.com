var gulp = require('gulp');


var exec = require('child_process').exec;   // Jekyll
var gulpif = require('gulp-if');            // Conditional processing of Jekyll HTML output
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');        // JS Processing
var less = require('gulp-less');            // Less
var imagemin = require('gulp-imagemin');    // Image processing
var rimraf = require('gulp-rimraf');        // Clean
var gutil = require('gulp-util');           // Utitlites [noop(), ...]
var debug = require('gulp-debug');          // debug



var paths = {
  source: 'source/',  // The design source
  ignore: '!*/_*',    // Ignore all things that have underscores in them
  source_jekyll: '.', // The location of the _config.yml file
  dest_jekyll: '_site/', // The location of the _config.yml file
  glob_jekyll_minify_regex: /.*\.html/, // All the jekyll files to minify
  dest:   'publish/'    // The destination of the compiled site
};

// Transforms have relative paths.
var transforms = {
  lessc: {from: ["_less/main.less"], to: "css/"},
  js: {from: ["_js/*"], to: "js/"},
  cssmin: [{files: ["css/main.css"]}],
  imagemin: [{parent: "_posts/", folder: "_*", relative: "../"}]
};


//
// Clear
//
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return gulp.src([paths.dest + "*", paths.dest_jekyll + "*"], { read: false })
    .pipe(rimraf());
});

//
// Build
//

// Jekyll
gulp.task('build-jekyll-run', ['clean'], function(cb) {
  exec('jekyll build', function(err) { 
    if (err) return cb(err); //return error
    cb(); // finished task
  });
});
gulp.task('build-jekyll-html', ['build-jekyll-run'], function() {
  return gulp.src(paths.dest_jekyll + "**", { base: paths.dest_jekyll })
    // Only process .html files:
    .pipe(gulpif(paths.glob_jekyll_minify_regex, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(paths.dest));
});
gulp.task('build-jekyll', ['build-jekyll-html'], function() {
  // Clean up after the jekyll build
  return gulp.src([paths.dest_jekyll + "*"], { read: false })
    .pipe(rimraf());
});

// Copy all static files from source/ to publish/
gulp.task('build-copystatic', ['build-jekyll'], function() {
  return gulp.src([paths.source + "**", paths.ignore], { base: paths.source })
    .pipe(gulp.dest(paths.dest));
});

// Perform all transforms.lessc
gulp.task('build-lessc', ['build-copystatic'], function() {
  if (!transforms.lessc) throw new Error("transforms.lessc not defined");
  return gulp.src(transforms.lessc.from, { cwd: paths.source })
    .pipe(less())
    .pipe(gulp.dest(paths.dest + transforms.lessc.to));
});
gulp.task('build-jsmin', ['build-copystatic'], function() {
  if (!transforms.js) throw new Error("transforms.js not defined");
  return gulp.src(transforms.js.from, { cwd: paths.source })
    .pipe(uglify())
    .pipe(gulp.dest(paths.dest + transforms.js.to));
});
gulp.task('build', ['clean', 'build-jekyll', 'build-copystatic', 'build-lessc', 'build-jsmin']);

/*
// Copy all static images
gulp.task('images', ['clean'], function() {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest('build/img'));
});
*/

// Rerun the task when a file changes
gulp.task('watch', function() {
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);
