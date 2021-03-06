---
title: iPad Web App - Cache Manifests
---

Recently, the Minesweeper3D project was adapted into a web application for iPad - complete with multi-touch gestures and offline caching. It's available [here](http://www.gauravmanek.com/projects/3dminesweeper/iPad/index_iPad.html), with the source code [here](http://www.gauravmanek.com/projects/3dminesweeper/iPad/).

iPad web application can be written to function remarkably like native applications. With the ability to keep a copy of the web app for offline use, web apps are made a lot more useful. Cache manifests are used to make this happen on iOS (see the official document [here](http://www.w3.org/TR/html5/offline.html)).

A cache manifest is simply a list of all the files required by the app to run offline. It must be served with the Content-Type header set to text/cache-manifest and the first line must be

```
CACHE MANIFEST
```

Each relative file path must occur on a separate line, and all text after a # is ignored. Files are updated when the hash of the manifest file changes. A sample manifest file is here:

```
CACHE MANIFEST
# Sample Manifest
index.html
arbitrary.js
```

For the Minesweeper3D project, the cache manifest is generated by a simple script. Feel free to modify it for your own use:

{% highlight php %}
<?php
$files = array("index_iPad.html", "display_canvas_iPad.js", "date.php", ... );
header("Content-Type: text/cache-manifest");
?>
CACHE MANIFEST
# Manifest for Minesweeper3D
# Uses filemtime() to automatically change contents
<?php
foreach ($files as $fn)
	echo $fn."\n# Mod:".filemtime($fn)."\n\n";
?>
{% endhighlight %}

Since the hash of the manifest file is used to determine if the files need to be redownloaded, even changing the contents of the comments will cause the browser to download the files again. The above script takes advantage of that by including the time that each file was last modified as a comment - any change in the contents of a file will cause the timestamp to change, which will change the hash of the manifest. As the manifest is downloaded each time the application is open, this simple method may prove to be too resource intensive. This can easily addressed by caching the cache file - an amusingly self-referential but effective method.

# Version tracking

Debugging the cache system is usually difficult, but here is a simple way to keep track of the current version present in the cache. This solution comes in two parts, and is compatible with the above manifest making script. It comes as an external php script that is just two lines long:</p>

{% highlight php %}
<?php
header("Content-type: application/x-javascript");
echo "var php_date=\"".date("r")."\";";
?>
{% endhighlight %}

It acts as an external JavaScript file that defines the value of the variable php_date to be the date and time that the file was accessed. Since the client only updates the files when the manifest changes, the cache version of this file <em>will not change until the manifest changes</em>. Hence, the date stored in this file is the date at which the file was last downloaded.

{% highlight js %}
function display_initialize(){
	// ...
	document.getElementById("update_date").innerHTML = php_date;
}
{% endhighlight %}

Adding a single line to display this date allows us to keep track of the version that is currently being used to display the document. Simple and effective.
A few things to note:
Using the manifest file overrides any other cache directive - HTTP headers, browser configuration, etc. Even pages served over HTTPS are not exempt from this behavior.
The web app can only directly include files mentioned in the manifest. For example, using a `<script>` tag to include `arbitrary.js` will only succeed if the manifest file also mentions `arbitrary.js`. If the file is not mentioned, then it will not be available in the app. Changing this default behavior can be done by appending this to the end of the cache manifest:

```
NETWORK:
*
```

# Canvas Rendering

Interestingly enough, the canvas rendering is not hardware accelerated. To prevent visible latency in the animations, the variable ani_ActiveMovement in display_canvas_iPad.js disables the rendering of text in the main grid as animation. Uncommenting line 13 from the snippet below enables that "feature". (Ultimately, the problem of lag was solved by changing the frame rate and increasing the "snap" distance.)

{% highlight js %}
function ani_moveToTargetZ(tgtZ){
	if(isNaN(tgtZ)) return;
	if(Math.abs(current_z-tgtZ) < 0.1){
		current_z = tgtZ;
		ani_ActiveMovement = false;
		display_Z_slice(current_z);
		return;
	}
	current_z = (current_z + tgtZ)/2;
	display_Z_slice(current_z);
	// Check timer
	clearTimeout(ani_timer1);
	//ani_ActiveMovement=true;
	ani_timer1 = setTimeout("ani_moveToTargetZ(" + tgtZ + ")", 40);
}
{% endhighlight %}

Hopefully, hardware rendering will be enabled in a future update.
