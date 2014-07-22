---
title: Making Websites Faster.
subtitle: Requests, CSS, images and more
---

# Combine queries
There are some resources that are used in every page, like the M logo and the resource icons on the bottom of each page. The canonical solution to this would be to use and SVG image map. With that, all the images are loaded in a single request and separated later, using CSS. The total size for the five icons is around 3.0 Kb, or 1.2Kb when gzipped.

The solution used here is different: the images are included in a css file using a data-url like `url(data:image/svg+xml;base64, ...)`. This adds a 33% overhead, making the file size up to 4.3 Kb, or 1.9 Kb when gzipped. This approach was chosen, despite the increase in file size, because it collapses two requests into one, making for faster loading overall.

Another benefit of using SVG images (instead of the PNGs, JPEGs or GIFs) is that they are vector images, and so the same file can be used at different sizes. The small logo in the title and the large logo in the footer both share the same source of data. The `background-image` of both is set by `.icon-logo` is the M logo, and the sizes are set in `.page-footer-logo` and `.navbar-logo` respectively.

# Load as little as possible.

The background pattern on all pages is in [`/img/bkg.svg`](/img/bkg.svg). The pattern is generated using white tiles of varying opacity, and the color of the background is specified as part of the `background:` declaration. This file is only necessary in the desktop and tablet version of the website, not in the mobile version. The CSS used specifies a solid color as a background and overrides it with a full background declaration if the page is sufficiently wide:

{% highlight css %}
body {
	background: @theme-primary-dark;
	@media (min-width: 768px) {
		background: @theme-primary-dark url(../img/bkg.svg) repeat;
	}
}
{% endhighlight %}

In modern versions of Chrome and Chrome for Android, the alternate background is not loaded until it is needed, saving an extra request on mobile devices. This works even if the default declaration contains the image and the overriding declaration sets the solid-colour background:

{% highlight css %}
/* This works too! */
body {
	background: @theme-primary-dark url(../img/bkg.svg) repeat;
	@media (max-width: 767px) {
		background: @theme-primary-dark;
	}
}
{% endhighlight %}

## Automatic CSS minimizing

CSS frameworks (like Bootstrap) have and CSS compilers (like [less](http://lesscss.org/)) produce CSS files with a large number of different declaration groups, a large portion of which are not used in any of the source files. Part of the build process involves [automatically stripping the generated CSS file of all unused declaration blocks and specifiers]({% post_url 2014-07-20-building-with-gulp %}).

This (almost unnoticably) breaks the traditional mental dependency model that web designers keep by changing the generated css file without the designer's direct intervention. It should not affect the styling of the document (after all, if the selector were in use elsewhere, it would already be available), but it will affect the total size of the download, especially if the CSS in question is only used on a single page.

Another hypothetical problem: If a selector is used both statically and dynamically (with jQuery, for example), it appears in the distribution CSS file automatically. If the static use of the selector is later deprecated, it may be removed from the stylesheet without regard for its dynamic use. The way around the latter is to:
1. __Keep CSS classes used by JavaScript in variables in a central location.__
   This fits in with the JavaScript best practice of keeping the code and the DOM separate. This also helps you maintain a selector-blacklist, or automatically include it in the build process.
2. __Use different selectors for static and dynamic use.__
   With a CSS preprocessor, it is possible to define a style and use it under two separate names. This is not recommended because your built CSS file will contain two copies of the same style.

# Standard techniques

## gzip encoding

Your server may not yet compress `.svg` and `.svgz` files by default. In lighttpd, this can be fixed by changing adding `compress.filetype += ( "image/svg+xml" )` to `lighttpd.conf`. Browsers that support it will automatically receive `.svg` files compressed. There's no need to compress them beforehand.

## Headers

Sending the `Cache-Control: max-age=???` header is a must, as is `ETag` support. This website uses the following `max-age` values:

| Time | Description |
| ---- | ----------- |
| 30m  | Post index page, RSS feed file. |
| 24h  | Blog posts and pages. |
| 1wk  | Images, CSS, JS, and similar static resources. |