---
title: Building with Gulp
subtitle: Abstraction and the streaming build system.
---

[Gulp](http://gulpjs.com/) is a build system for websites that uses simple stream-of-files concept to process files. The build system has a similar notion of __tasks__ correspond to __targets__ in ant or make, and dependencies are defined similarly.

The build process for the website is fairly elaborate, and Jekyll is only one of the steps in the build target. Here are the build targets, in approximate order of execution in a typical build cycle:

__Target__         | __Description__
------------------ | ---------------
`clean`            | Delete everything in `publish/`
`build-jekyll-run` | Run the Jekyll build process
`build-jekyll-html`| Copy the generated files, minifying HTML
`build-jekyll`     | Clean up after the Jekyll build process.
`build-copystatic` | Copy static design assets from the source folder
`build-lessc`      | Compile all `.less` files in `transforms.lessc`, remove all specifiers not used in any HTML page.
`build-jsmin`      | Minify all `.js` files in `transforms.js`
`build-blogimages` | Build all the blog images
`build`            | Main target, lists all above tasks as dependencies.
`default`          | Default gulp target, invokes `default`


And here is a dependency graph:

{% include blogimage src="dep_graph.png" caption="Dependency Graph" %}

## Jekyll as an intermediate step

This is an unusual use of Jekyll. Typically, all CSS, JavaScript and images are minimized and placed in the Jekyll `_content/` directory. This website, however, further minimizes the generated HTML (in `build-jekyll-run`) and removes all generated CSS that is not used in the output (in `build-lessc`). [These lines](https://github.com/gauravmm/gauravmanek.com/blob/5303c881ea3365f1e11fb6b9a29181bfb49870c3/gulpfile.js#L71-L89) in the buildfile are relevant.

# Abstraction

Gulp buildfiles are written in JavaScript and are processed as JavaScript code. This lets us generate the functions and parameters of each build on the fly.

## With Settings

In the image building step, more than one image is generated. If you want to perform the same action once with each parameter, you `map` the function over the array of parameters. For example:

{% highlight js %}
var es = require('event-stream');
parameters = [1, 2, 3, 4, 5]; // Arbitrary array

gulp.task('build-something', [], function() {
	var tasks = parameters.map(function(num) {
		return gulp.src("*.html")
			.pipe(/* Your action */)
			.pipe(gulp.dest("destination/"));
	});

	return es.concat.apply(null, tasks);
}
{% endhighlight %}

The resulting array-of-pipes is merged into a single list using [`function.apply`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply). This also prevents the function/task from returning until all sub-tasks are completed.

James Crowley discusses this technique, applied to a related problem, [on his website](http://www.jamescrowley.co.uk/2014/02/17/using-gulp-packaging-files-by-folder/).

## With Streams

Abstracting over streams is possible with [`lazypipe`](https://www.npmjs.org/package/lazypipe).

Let's say we need a function to copy files and save them with different suffixes. With `lazypipe`, we can write this easily:

{% highlight js %}
// fileRenamer("abcdef") returns a pipe that changes "hello.ext" to "hello.abcdef.ext"
var fileRenamer = function (suffix) {
	return lazypipe()
		.pipe(rename, function (path) {
				path.extname = "." + suffix + path.extname;
			});
};

// Using the technique above:
suffixes = ["1", "2", "3"];
gulp.task('build-something', [], function() {
	var tasks = suffixes.map(function(suffix) {
		return gulp.src("**/*.ext")
			.pipe(fileRenamer(suffix))
			.pipe(gulp.dest("destination/"));
	});
	return es.concat.apply(null, tasks);
}
{% endhighlight %}

In fileRenamer, instead of passing `lazypipe().pipe` the result of `rename` called with the function, we pass it a `rename` as a function reference and each parameter as a list after that. The [documentation](https://www.npmjs.org/package/lazypipe) explains why.

We are not just restricted to iterating over parameters, we can do things like work with conditionals based on this:

{% highlight js %}
function processSomeFiles (ifProcessed, ifNotProcessed) {
	return gulp.src("**/*.*")
		.pipe(gulpif(/* some criteria */,
				ifProcessed(),
				ifNotProcessed()
			));
{% endhighlight %}

We simply pass a `lazypipe` reference to `processSomeFiles` and it will pass them as appropriate. For example:

{% highlight js %}
gulp.task('build-something-else', [], function() {
	return processSomeFiles(fileRenamer("spam"), fileRenamer("ham"));
}
{% endhighlight %}

`gutil.noop` is useful for this - it passes everything unchanged. This example only renames some files as spam, leaving the rest unchanged:

{% highlight js %}
gulp.task('build-something-else', [], function() {
	return processSomeFiles(fileRenamer("spam"), gutil.noop);
}
{% endhighlight %}

Note that `gutil.noop` is passed as a function reference. This is because `lazypipe()` expects function references that it can call when it needs to.

A related problem is passing preexisting functions with custom parameters. For example, to force delete a file, the gulp syntax is `.pipe(rimraf({ force: true }))`. We can just wrap the function call and parameters in an anonymous function to defer execution:

{% highlight js %}
gulp.task('build-something-else', [], function() {
	return processSomeFiles(function() {return rimraf({ force: true })}, gutil.noop);
}
{% endhighlight %}

# Files

## File listing

When producing `main.css`, one of the build stages is running [`uncss`](https://github.com/giakki/uncss), a tool that removes all unused css selectors. This step requires a list of all generated HTML files.

The easiest way to deal with this is to sidestep gulp entirely and use `glob`. This code returns a list of all HTML files:

{% highlight js %}
glob.sync(paths.dest + "**/*.html")
{% endhighlight %}

## File existence

When processing images, we want to exclude images that already have minimized copies. To do this, we use [`gulp-ignore`](https://www.npmjs.org/package/gulp-ignore) and the synchronous version of the `filesystem.exists` function:

{% highlight js %}
.pipe(gulpIgnore.exclude, function (file) {
		return filesystem.existsSync(file.path);
	})
{% endhighlight %}


# Application: Image handling

Handling images for this website combines the techniques discussed above. The use case is described in [Templating with Jekyll]({% post_url 2014-07-16-templating-with-jeykll %}). This is the final arrangement of images:

Images are placed in folders in the same directory as posts, like this:

{% highlight bash %}
gauravmanek.com/_content/blog$ find . -type f
./_posts/2014-07-20-building-with-gulp.md
./_posts/_2014-07-20-building-with-gulp/dep_graph.png
{% endhighlight %}

The folder names have an underscore at the front (so that Jekyll does not process the contents) and have no extension. Running `gulp` automatically generates copies of the file. The types of files generated can be set in [`transforms.imagemin`](https://github.com/gauravmm/gauravmanek.com/blob/5303c881ea3365f1e11fb6b9a29181bfb49870c3/gulpfile.js#L47). For this website, a small thumbnail and a larger full copy are produced, as shown here:

{% highlight bash %}
gauravmanek.com$ gulp
gauravmanek.com/_content/blog$ find . -type f
./_posts/2014-07-20-building-with-gulp.md
./_posts/_2014-07-20-building-with-gulp/dep_graph.png
./_posts/_2014-07-20-building-with-gulp/dep_graph.full.png
./_posts/_2014-07-20-building-with-gulp/dep_graph.thumb.png
{% endhighlight %}

Files are only created if they do not already exist - this way, generated images can be selectively overridden.

## User and Generated Files

We split all image files into two groups: those that have a matching `.thumb` or `.full` suffix and those that do not. This is done in [`blogImageStream`](https://github.com/gauravmm/gauravmanek.com/blob/5303c881ea3365f1e11fb6b9a29181bfb49870c3/gulpfile.js#L153-L159). This function is used in multiple places, either to [delete one group while preserving the other](https://github.com/gauravmm/gauravmanek.com/blob/5303c881ea3365f1e11fb6b9a29181bfb49870c3/gulpfile.js#L198-L204) or to [apply each transformation in `transforms.imagemin`](https://github.com/gauravmm/gauravmanek.com/blob/5303c881ea3365f1e11fb6b9a29181bfb49870c3/gulpfile.js#L164-L166).

The source code is well commented. Take a look.