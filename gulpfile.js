"use strict"

var gulp = require('gulp');


var exec = require('child_process').exec;   // Jekyll
var gulpif = require('gulp-if');            // Conditional processing of Jekyll HTML output
var htmlmin = require('gulp-htmlmin');      // Minimize HTML
var uglify = require('gulp-uglify');        // JS Processing
var less = require('gulp-less');            // Less
var uncss = require('gulp-uncss');          // Remove unused CSS
var cleanCSS = require('gulp-clean-css');   // Minify CSS
var glob = require('glob');                 // Used to list all HTML files to pass to the CSS minifier
var rename = require('gulp-rename');        // Used to modify the path of blog images.
var imagemin = require('gulp-imagemin');    // Image minification
var pngcrush = require('imagemin-pngcrush');// Plugin for imagemin
var imageResize = require('gulp-image-resize'); // Image resizing
var rimraf = require('gulp-rimraf');        // Clean
var gutil = require('gulp-util');           // Utitlites [noop(), ...]
var debug = require('gulp-debug');          // debug
var es = require('event-stream');           // For parallel processing of streams
var lazypipe = require('lazypipe');			// For abstracting over streams
var gulpIgnore = require('gulp-ignore'); 	// For only copying over certain images.
var fs = require('fs');						// To check if images already exist before converting them.


//
//// Config
//


var paths = {
	source: 'source/',  // The design source
	content: '_content/',
	ignore: '!**/_*{,/**}',    // Ignore all things that have underscores in them
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
	imagemin: {parent: '_posts/', folder_prefix: "_", new_name: "img/", styles: [{name: "thumb", max_width: 600, max_height: 300}, {name: "full", max_width: 1600, max_height: 1600}]}
};



//
//// Clear
//

gulp.task('clean', function(cb) {
	// You can use multiple globbing patterns as you would with `gulp.src`
	return gulp.src([paths.dest + "*", paths.dest_jekyll + "*"], { read: false })
		.pipe(rimraf());
});



//
//// Build
//


//// Jekyll

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
	return gulp.src([paths.dest_jekyll], { read: false })
		.pipe(rimraf());
});


//// Static Files

// Copy all static files from source/ to publish/
gulp.task('build-copystatic', ['build-jekyll'], function() {
	return gulp.src([paths.source + "**", paths.ignore], { base: paths.source })
		.pipe(gulp.dest(paths.dest));
});


//// Transformations

// Perform all transforms.lessc
gulp.task('build-lessc', ['build-copystatic', 'build-jekyll'], function() {
	if (!transforms.lessc) throw new Error("transforms.lessc not defined");
	return gulp.src(transforms.lessc.from, { cwd: paths.source })
		.pipe(less())
		.pipe(uncss({
						html: glob.sync(paths.dest + "**/*.html"),
						ignore: [/\.scrollspy\-(.*)/, ".sidebar-nav.fixed"]
					}))
		.pipe(cleanCSS({rebase:false, keepSpecialComments:0}))
		.pipe(gulp.dest(paths.dest + transforms.lessc.to));
});

gulp.task('build-jsmin', ['build-copystatic'], function() {
	if (!transforms.js) throw new Error("transforms.js not defined");
	return gulp.src(transforms.js.from, { cwd: paths.source })
		.pipe(uglify())
		.pipe(gulp.dest(paths.dest + transforms.js.to));
});


// The transformations applied on images to convert them from the source to the export formats.
// 
var blogImageTransform = function (im, style) {
	return lazypipe()
		.pipe(rename, function (path) {
				path.extname = "." + style.name + path.extname.toLowerCase();
			})
		.pipe(gulpIgnore.exclude, function (file) {
				return fs.existsSync(file.path);
			})
		.pipe(imageResize, {
				width: style.max_width,
				height: style.max_height,
				imageMagick: true
			})
		/*
		// Workaround to prevent optipng bug in imagemin
		// https://github.com/google/web-starter-kit/issues/279
		.pipe(gulpif, /.*\.png/, gutil.noop(), imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
			}));
			*/
		.pipe(imagemin, {
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
			});
};


var im = transforms.imagemin;
var styleNames = im.styles.map(function (e) { return e.name });
var styleNamesRegexp = new RegExp(".*\.(" + styleNames.join("|") + ")\..+");


function blogImageStream (ifProcessed, ifNotProcessed) {
	return gulp.src([paths.content + "**/" + im.parent + im.folder_prefix + "*/*.*", "!**/*.xcf"], { base: paths.content })
				.pipe(gulpif(styleNamesRegexp,
						ifProcessed(),
						ifNotProcessed()
					));
}

function blogImageBuild(){
	// Parallel from this
	// http://www.jamescrowley.co.uk/2014/02/17/using-gulp-packaging-files-by-folder/
	var tasks = im.styles.map(function(style) {
			return blogImageStream(gutil.noop, blogImageTransform(im, style));
		});

	return es.concat.apply(null, tasks)
		.pipe(gulpIgnore.include(styleNamesRegexp)) // Only keep the processed files
		.pipe(gulp.dest(paths.content))  // Pipe the output to the content folder
		.pipe(rename(function (path) {
				path.dirname = path.dirname.replace(im.parent + im.folder_prefix, im.new_name);
			})) // Alter the paths for the processed images
		.pipe(gulp.dest(paths.dest)); // Merge into final site
}
	
// Copy all blog images, scaling and optimizing as necessary.
//styles: [{name: "thumb", max_width: 600, max_height: 400},
gulp.task('build-blogimages', ['build-copystatic'], function() {
	return blogImageBuild();
});


//// Main Task

gulp.task('build', ['clean', 'build-jekyll', 'build-copystatic', 'build-lessc', 'build-jsmin', 'build-blogimages'], function(){
});


//
//// Utility build targets
//

gulp.task('blogimages', [], function() {
	return blogImageBuild();
});

gulp.task('blogimages-clean', [], function() {
	return blogImageStream(function() {return rimraf({ force: true })}, gutil.noop);
});

gulp.task('blogimages-clean-originals', ['blogimages'], function() {
	return blogImageStream(gutil.noop, function() {return rimraf({ force: true })});
});

//
//// Watchers
//


// Rerun the task when a file changes
gulp.task('watch', function() {
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['build']);
