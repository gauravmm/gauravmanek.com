# GauravManek.com

This is the source code of [my website](http://www.gauravmanek.com/). It's built on Jekyll, but has been expanded to also do things like:
- Make including images in blog posts convenient.
- Minify and optimize everything possible.
- Feed your dog and take him for walks.

## Building

`gulp` to build.

Jekyll is only one component of the build process. As such, this should not be used as a "github" website. Other build targets include:

Target  | Effect
------------- | -------------
`blogimages` | Process all blog images.
`blogimages-clean` | Remove all images created by `blogimages`.
`blogimages-clean-originals` | Process all images and __remove the originals__.

## Attribution

- The grid framework, structure of LESS files, typography and many other parts are from the [Bootstrap project](http://getbootstrap.com/).
- Some SVG assets are from [FontAwesome](http://fontawesome.io/)
- All code snippets are attributed by comments preceding their use.

This is released under the [The MIT License](https://github.com/gauravmm/gauravmanek.com/blob/master/LICENSE), in the hope that someone finds it useful.

## Installation

### Dependencies

Gone are the days where this section would be "A cheap web host that supports PHP and hasn't turned on mod_security." This requires:

Package | What it is
------- | ----------
`nodejs` | [Node.js](http://nodejs.org/). May be called `node`.
`npm` | [Node Packaged Modules](https://www.npmjs.org/)
`rubygems` | [RubyGems](https://rubygems.org/)
`imagemagick` | [ImageMagick](http://www.imagemagick.org/)

### Procedure

1. Install the dependencies.
2. `git clone https://github.com/gauravmm/gauravmanek.com.git`
3. Run `npm install` to automatically install other dependencies. This will take a while.
4. Install [gulp](http://gulpjs.com/) globally with `sudo npm install -g gulp`
5. Install Jekyll via RubyGems with `gem install jekyll`

## Usage

### Blog images

### Known Issues

- [ ] PNGCrush [has been disabled](https://github.com/gauravmm/gauravmanek.com/blob/6fe79c97c6c60d5b6c19ba198eda0d42d804eec5/gulpfile.js#L139-L144). This is due to a [known bug](https://github.com/google/web-starter-kit/issues/279) in optipng on Ubuntu 14.04.
- [ ] When building blog images, images that already exist are written again. Since these images are not regenerated, the performance penalty is small. The fix would be to copy the stream and filter the files before writing them, in [this place](https://github.com/gauravmm/gauravmanek.com/blob/6fe79c97c6c60d5b6c19ba198eda0d42d804eec5/gulpfile.js#L170).2
- [ ] Nonexistent error handling.
