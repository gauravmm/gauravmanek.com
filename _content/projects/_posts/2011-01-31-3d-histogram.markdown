---
layout: post
status: publish
published: true
title: 3D Histogram
author:
  display_name: gauravmm
  login: gauravmm
  email: maneks@gmail.com
  url: ''
author_login: gauravmm
author_email: maneks@gmail.com
wordpress_id: 21
wordpress_url: http://www.gauravmanek.com/blog/?p=21
date: !binary |-
  MjAxMS0wMS0zMSAxNTo1Nzo1NiArMDgwMA==
date_gmt: !binary |-
  MjAxMS0wMS0zMSAwNzo1Nzo1NiArMDgwMA==
categories:
- Projects
---
<p>Recently, as part of my research, I implemented a modified version of the algorithm detailed in <a href="http://lagis-vi.univ-lille1.fr/bibtex/upload/2004/busin_icip_2004.pdf" target="_blank">this</a> paper. While it was unsuitable for the intended purpose, the process did yield interesting results in the form of three-dimensional color-frequency histograms.</p>
<p>First, a quick introduction to the concept of a color space: Colors are usually described, additively (starting from black and <em>adding</em> light) or subtractively (starting from white and <em>subtracting</em> light). The former is usually used with screens and computer displays (which work by adding light), and the latter with print materials (which work by adding pigments, which subtract light). By no means does this depict every possible color, but it does an excellent job in specifying colors for use by digital devices. The RGB color space is the most commonly used color space in digital images, simply because its use makes it very easy for displays to directly use, and for printers (or other devices) to convert to the appropriate format.</p>
<p>RGB is usually specified by a set of three numbers (each representing the intensity of red, green or blue present in the final mix, as an integer from 0-255 or a fraction from 0-1). Since these three colors are assumed orthogonal in human perception, they can be drawn in a cube, with each color varying along one dimension of the cube. This means that each point in the cube can be described using a unique set of three numbers, and that each set of three intensities describes a particular, unique, color. <a href="http://commons.wikimedia.org/wiki/File:RGB_Cube_Show_lowgamma_cutout_a.png" target="_blank">The image below</a> expresses this concept visually:</p>
<p>[caption id="attachment_24" align="aligncenter" width="300" caption="Three-dimensional visualization of the RGB colorspace. Image courtesy of SharkD on Wikimedia Commons."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/RGB_Cube_Show_lowgamma_cutout_a.png"><img class="size-medium wp-image-24" title="RGB Cube" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/RGB_Cube_Show_lowgamma_cutout_a-300x250.png" alt="" width="300" height="250" /></a>[/caption]</p>
<p>The purpose of a histogram is to calculate which colors are most popular in a very simple way. The entire RGB cube is divided into "bins" of equal size, where each bin corresponds to colors that belong to the same ranges of intensities of each primary color. The divisions in the image above divide the larger cube into 5<sup>3</sup> = 125 bins. It is important for the "size", the range of colors that each bin encompasses, to be perceptually uniform. This is not the case in the RGB model, but we can live with the assumption for now. In the final histogram, each bin contains the total number of pixels in an image that fall within its range.</p>
<p>With all this knowledge, we can now see that a three-dimensional histogram is simply a record of the color distribution within an image, and so can be used to find out the particular color or color groups that are most common in an image. One particular image of interest is Jellyfish.jpg, from the sample pictures included in modern versions of Windows.</p>
<p>[caption id="attachment_19" align="aligncenter" width="300" caption="Low resolution version of Jellyfish.jpg."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish.jpg"><img class="size-medium wp-image-19 " title="Jellyfish" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish-300x225.jpg" alt="" width="300" height="225" /></a>[/caption]</p>
<p>This image was processed to yield a 3D histogram as described above (but with 16<sup>3</sup> = 4096 bins) and converted into a "stacked" contour plot. Each layer in this stacked plot corresponds to moving towards the maximum intensity of red by one bin (or 1/16 of the maximum color). Within each layer, the colored lines enclose areas within the histogram that all contain more than a certain number of pixels. As in a geographical contour map, the minimum limit for each contour line increases linearly.</p>
<p>[caption id="attachment_16" align="aligncenter" width="300" caption="Smoothed RGB Histogram of Jellyfish.jpg"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_RGB_smoothed_1.png"><img class="size-medium wp-image-16" title="Jellyfish Histogram - Smoothed RGB" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_RGB_smoothed_1-300x231.png" alt="" width="300" height="231" /></a>[/caption]</p>
<p>It is easiest to imagine that all the slices are vertically stacked and that lines of similar colors are connected between layers. Doing so will give you a series of polygons enclosing colors that all occur at least a certain minimum number of times. For quick reference, the color of each bin can be seen here:</p>
<p>[caption id="attachment_20" align="aligncenter" width="300" caption="Color Lookup"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/RGB_Color.png"><img class="size-medium wp-image-20" title="RGB Color Lookup" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/RGB_Color-300x231.png" alt="" width="300" height="231" /></a>[/caption]</p>
<p>It is easy to manually verify that the most common maximum colors are the dark blue of the background and the orange of the jellyfish.</p>
<p>Of course, this particular histogram has been smoothed. The original histogram, as shown below, has considerably thin peaks, suggesting that colors within a group tend towards a central value rather strongly. A three dimensional Gaussian convolution matrix was applied (with Ïƒ = 1.33 bins) was applied to get the rather nice looking histogram above.</p>
<p>[caption id="attachment_15" align="aligncenter" width="300" caption="Raw RGB Histogram of Jellyfish.jpg"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_RGB_raw.png"><img class="size-medium wp-image-15" title="Jellyfish Histogram - Raw RGB" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_RGB_raw-300x231.png" alt="" width="300" height="231" /></a>[/caption]</p>
<p>The whole process relies heavily on a few key assumptions. Perhaps the most important assumption is that the intensity of a particular color varies linearly with the value used to express it. As far as the RGB color space is concerned, this is not true. This leads to the process being non-representative in a number of important ways:</p>
<ul>
<li>Smoothing is not representative of colors perceived.</li>
<li>Color grouping is likely to be too aggressive in colors where human eyes can differentiate shades the best and not sufficiently aggressive at other colors.</li>
</ul>
<p>If you have managed to read this far, then congratulations! Here is the same data in other color spaces.</p>
<p><strong>YCbCr</strong></p>
<p><a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_YCbCr_smoothed.png"></a></p>
<p>[caption id="attachment_18" align="aligncenter" width="300" caption="Jellyfish Histogram - Smoothed YCbCr"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_YCbCr_smoothed.png"><img class="size-medium wp-image-18" title="Jellyfish Histogram - Smoothed YCbCr" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_YCbCr_smoothed-300x211.png" alt="" width="300" height="211" /></a>[/caption]<br />
[caption id="attachment_17" align="aligncenter" width="300" caption="Jellyfish Histogram - Raw YCbCr"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_YCbCr_raw.png"><img class="size-medium wp-image-17" title="Jellyfish Histogram - Raw YCbCr" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_YCbCr_raw-300x211.png" alt="" width="300" height="211" /></a>[/caption]</p>
<p><strong>HSV</strong></p>
<p>[caption id="attachment_14" align="aligncenter" width="300" caption="Jellyfish Histogram - Smoothed HSV"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_HSV_smoothed.gif"><img class="size-medium wp-image-14" title="Jellyfish Histogram - Smoothed HSV" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_HSV_smoothed-300x211.gif" alt="" width="300" height="211" /></a>[/caption]<br />
[caption id="attachment_13" align="aligncenter" width="300" caption="Jellyfish Histogram - Raw HSV"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_HSV_raw.gif"><img class="size-medium wp-image-13" title="Jellyfish Histogram - Raw HSV" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/01/Jellyfish_HSV_raw-300x211.gif" alt="" width="300" height="211" /></a>[/caption]</p>
<p>Do note that the Gaussian smoothing used does not "wrap around" the hue dimension in the smoothed HSV histogram.</p>
