---
layout: post
status: publish
published: true
title: The story of Blinky, Inky, Pinky and Clyde.
author:
  display_name: gauravmm
  login: gauravmm
  email: maneks@gmail.com
  url: ''
author_login: gauravmm
author_email: maneks@gmail.com
wordpress_id: 26
wordpress_url: http://www.gauravmanek.com/blog/?p=26
date: !binary |-
  MjAxMS0wMi0wNSAwMjozMTo0NCArMDgwMA==
date_gmt: !binary |-
  MjAxMS0wMi0wNCAxODozMTo0NCArMDgwMA==
categories:
- Projects
---
<p>All modern browsers limit the number of concurrent connections that they establish with HTTP servers so that connections and devices are not overburdened. There are usually two limits: a cap on the number of connections to a host, and another cap on the total number of outbound connections. At the time the HTTP/1.1 standard was written in 1997, the limit was two connections per host (see <a href="http://tools.ietf.org/html/rfc2068#section-8.1.4" target="_blank">RFC 2068, section 8.1.4</a>). For a website that makes extensive use of included content, this limit is rather restrictive. Unsurprisingly, most modern browsers deliberately set their limits high - typically 4-6 connections per host (more <a href="http://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser">here</a>).</p>
<p>This problem came up when I was working on my <a href="http://www.gauravmanek.com/?tshirts" target="_blank">T-Shirt Design browser</a> - the thumbnail images were loading unbearably slowly. The limited number of connections available were forcing the thumbnails to be downloaded sequentially, rather than concurrently. This post details a rather simple way to get around this problem by using multiple hosts to serve files.</p>
<p>Maintaining mirror hosts is, with some amount of planning, rather easy - just add additional DNS A records and configure your server to serve the exact same set of files for calls to multiple domains (on Apache, just specify the same DocumentRoot for multiple <a href="http://httpd.apache.org/docs/2.0/vhosts/examples.html" target="_blank">VirtualHosts</a>). This is where the rather cryptic title of this post comes in - blinky, inky, pinky and clyde are all sub-domains of gauravmanek.com. Here is an excerpt from the DNS records of gauravmanek.com:</p>
<p>[code]<br />
DNS Zone: gauravmanek.com</p>
<p>Record Â Â  Type Â  Â Value<br />
------Â Â  Â ----Â Â  Â -----<br />
           A Â Â  Â 173.236.181.179<br />
blinky Â Â  Â A Â Â  Â 173.236.181.179<br />
clyde Â Â  Â  A Â Â  Â 173.236.181.179<br />
inky Â Â  Â   A Â Â  Â 173.236.181.179<br />
pinky Â Â  Â  A Â Â   173.236.181.179<br />
[/code]</p>
<p>As you can see, blinky.gauravmanek.com, inky.gauravmanek.com, pinky.gauravmanek.com, clyde.gauravmanek.com and gauravmanek.com are all on the same IP. Do note that I did not use a wildcard record for this, even though its technically possible. I don't directly edit my httpd.conf settings, but the entries needed to generate the desired behavior should (might? possibly? I'm not particularly experienced with Apache, so don't take my word as the gospel truth) look something like this:</p>
<p>[code]<br />
NameVirtualHost *:80</p>
<p>&lt;VirtualHost *:80&gt;<br />
   DocumentRoot /www/main_site<br />
   ServerName gauravmanek.com<br />
&lt;/VirtualHost&gt;<br />
&lt;VirtualHost *:80&gt;<br />
   DocumentRoot /www/main_site<br />
   ServerName blinky.gauravmanek.com<br />
&lt;/VirtualHost&gt;</p>
<p># Repeat for inky, pinky and clyde.<br />
[/code]</p>
<p>Now the exact same website is being served on each of the subdomains - this means that the path to each file is the same, making our job much easier. This can be verified manually by accessing the same file via each hostname. For example:</p>
<p>[code]http://www.gauravmanek.com/images/OAS.gif<br />
http://www.blinky.gauravmanek.com/images/OAS.gif<br />
http://www.inky.gauravmanek.com/images/OAS.gif<br />
http://www.pinky.gauravmanek.com/images/OAS.gif<br />
http://www.clyde.gauravmanek.com/images/OAS.gif[/code]</p>
<p>Now that the mirroring works, we can modify the client-side code/markup to spread the load across each host to meet the aim of maximizing parallel downloads. There is an important constraint to keep in mind - the browser must access a particular resource from the same host each time, or the benefits of having multiple hosts are lost (Each resource is cached by hostname, and so accessing it from another hostname will result in multiple instances of the same resource in cache. This is not good.) For static content, simply replacing each reference to a particular  file will suffice. It's not particularly exciting, but it does work. Alternatively, a small piece of JavaScript could change the src and href attributes at runtime, but this is <a href="http://developer.yahoo.com/performance/rules.html#javascript" target="_blank">likely to worsen performance</a> (the linked article provides many of the rules that this article both builds on and breaks).</p>
<p>For dynamic content meant to be asynchronously loaded, though, this is easily implemented. Most, if not all, scripts that dynamically download resources after the page has loaded do so from an array or similar source. To load the content, simply use the iterator variable modulo number of hosts available to quickly distribute the requests into appropriate groups. As used in the (as of February 2011) current version of the T-Shirt Design Browser:</p>
<p>[javascript]<br />
var ts_mirrorServers = new Array(&quot;http://www.inky.gauravmanek.com&quot;, &quot;http://www.pinky.gauravmanek.com&quot;, ... , &quot;.&quot;);<br />
// Some code<br />
initialize() {<br />
	for( /* each preview icon */)<br />
		tsIcoNodes[i].src = ts_mirrorServers[i%ts_mirrorServers.length] + ts_icoPrefix + ts_icoNameArr[i];<br />
}<br />
[/javascript]</p>
<p>And that's it. It should work properly now.</p>
<p>There are better methods to deal with this problem (see <a href="http://spriteme.org/faq.php#def" target="_blank">SpriteMe</a>, more on this later), none are as easy to implement for dynamic content as the solution discussed on this page. (Note: I'm working on mixing sprite generation and this together. Let's see if it works.)</p>
<p>This has one additional benefit, especially important for cookie-heavy sites. As the hosts are different, cookies that would be sent as part of the browser's GET request are no longer sent, reducing both transfer and computational overhead. This is the reason that sites often use a single subdomain to serve static content (e.g.: static.bbc.co.uk).</p>
<p><strong>Potential Problems</strong><br />
This method is, however, rather problematic at times. There are two main overheads that are incurred that makes this unsuitable for serving many tiny files.</p>
<p>Firstly, the DNS overhead. DNS round-trips can take more than a second to complete, and absolutely no content can be transferred until this request is completed. If the mirror system is only used for a few pages (as it is in this case), then small snippets of JavaScript can be used to asynchronously download dummy images from these hosts while on other pages of the site - thereby forcing the browser to resolve the domain names beforehand. (This is scheduled for implementation, I will post an update when its done.) </p>
<p>Establishing a TCP connection is time-consuming, and this is the second overhead that makes the current method impractical. While its possible for the connection to be "reused" (using <a href="http://www.io.com/~maus/HttpKeepAlive.html" target="_blank">Connection: Keep-Alive</a>), it's not something that can be relied upon. This is why sprites are a popular solution to this problem.</p>
<p><strong>A little more</strong></p>
<p>You might find it desirable to block access to your website on each of your mirror domains - to not do so would allow people to maintain multiple sessions on your website (if you use cookies to track sessions) and could potentially confuse people. A simple mod_rewrite directive can solve this problem. Alternatively, if you use a PHP-based CMS, put this in the head of your page:</p>
<p>[php]<br />
&lt;?php<br />
if($_SERVER['HTTP_HOST'] != &quot;www.example.com&quot; &amp;&amp; $_SERVER['HTTP_HOST'] != &quot;example.com&quot;)<br />
	if(preg_match('/^(www\.)?(blinky.|inky.|pinky.|clyde.)example\.com$/', $_SERVER['HTTP_HOST'])){<br />
		header(&quot;Location: http://www.example.com/&quot;,TRUE,301);<br />
		die();<br />
	}<br />
?&gt;<br />
[/php]</p>
<p>I now leave you with one final image, based on artwork from the original Pac-Man:</p>
<p><a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/02/inkyblinkypinkyclyde.png"><img class="aligncenter size-full wp-image-30" title="inkyblinkypinkyclyde" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/02/inkyblinkypinkyclyde.png" alt="" width="650" height="190" /></a></p>
<p>Perhaps I'll put it on a t-shirt?</p>
