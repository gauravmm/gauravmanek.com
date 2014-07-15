---
layout: post
status: publish
published: true
title: iPad- and Kinect-Controlled Car
author:
  display_name: gauravmm
  login: gauravmm
  email: maneks@gmail.com
  url: ''
author_login: gauravmm
author_email: maneks@gmail.com
wordpress_id: 33
wordpress_url: http://www.gauravmanek.com/blog/?p=33
date: !binary |-
  MjAxMS0wMy0yOCAyMToyMzo0NCArMDgwMA==
date_gmt: !binary |-
  MjAxMS0wMy0yOCAxMzoyMzo0NCArMDgwMA==
categories:
- Projects
---
<p>This project extends a simple remote-controlled car, allowing it to be controlled by an iPad or by hand gestures. This project builds on the <a href="http://arduino.cc/" target="_blank">Arduino</a> project, the Kinect and certain HTML5 features (<a href="http://en.wikipedia.org/wiki/WebSockets" target="_blank">WebSockets</a>, <a href="http://developer.apple.com/library/safari/#documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html#//apple_ref/javascript/cl/DeviceMotionEvent" target="_blank">DeviceMotionEvent</a>, <a href="http://en.wikipedia.org/wiki/Canvas_element">Canvas</a>). The final product is this:</p>
<p><object width="640" height="390"><param name="movie" value="http://www.youtube.com/v/D7Ses-VGU9U&amp;hl=en_US&amp;feature=player_embedded&amp;version=3" /><param name="allowFullScreen" value="true" /><param name="allowScriptAccess" value="always" /><embed type="application/x-shockwave-flash" width="640" height="390" src="http://www.youtube.com/v/D7Ses-VGU9U&amp;hl=en_US&amp;feature=player_embedded&amp;version=3" allowfullscreen="true" allowscriptaccess="always"></embed></object></p>
<p><strong>Overview</strong></p>
<p>There are two different versions of this project - one for the HTML5 web app, and the other for the Kinect. In the HTML5-based version, the web application uses <a href="http://developer.apple.com/library/safari/#documentation/SafariDOMAdditions/Reference/DeviceMotionEventClassRef/DeviceMotionEvent/DeviceMotionEvent.html#//apple_ref/javascript/cl/DeviceMotionEvent" target="_blank">DeviceMotionEvent</a> to get accelerometer readings and determine what the car has to do. This action is encoded in the format expected by the Arduino sketch, and is then sent over a <a href="http://en.wikipedia.org/wiki/WebSockets" target="_blank">WebSocket</a> to a simple server written in Python. The Python script simply forwards the received data to the Arduino via the serial port. The Arduino toggles its output to close and open switches on the remote controller (using optical isolators). The car moves correspondingly.</p>
<p>The Kinect-based version functions in a nearly identical manner - the only difference is that the Kinect data is received and processed in the same C# application that dispatches instructions over the serial port. You can <a title="Download Source Code!" href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/RC_Car.zip" target="_blank">download the full source code here</a>.</p>
<p>Now, to take a closer look at each section of this project, from the bottom-up:</p>
<p><strong>The Arduino</strong></p>
<p>The Arduino receives commands from its Serial interface and toggles its output to control the car's remote controller.Â  For a controller that supports only one speed, the circuit looks like this:</p>
<p>[caption id="attachment_35" align="aligncenter" width="271" caption="Fritzing image of circuit."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/RC-Control_bb.png"><img class="size-medium wp-image-35" title="Circuit" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/RC-Control_bb-271x300.png" alt="" width="271" height="300" /></a>[/caption]</p>
<p>Each output pin controls current passing through an <a href="http://en.wikipedia.org/wiki/Opto-isolator" target="_blank">opto-isolator</a>, which isolates the circuit of the Arduino from that of the car's controller. This allows the Arduino to control the car, despite both circuits having different electrical potentials. The switches at the top of the above diagrams are placeholders for the actual control mechanism of the car.Â  A current-limiting resistor is chosen so as to provide a current within the operating parameters of the opto-isolator. The breadboarded circuit looks like this:</p>
<p>[caption id="attachment_36" align="aligncenter" width="243" caption="Photo of Arduino Circuit"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/DSC_5087.jpg"><img class="size-medium wp-image-36" title="RC Car - Photo of Circuit" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/DSC_5087-243x300.jpg" alt="" width="243" height="300" /></a>[/caption]</p>
<p>The sketch that the Arduino runs is very simple:</p>
<p>[c]int pinRight = 11;<br />
int pinLeft = 10;<br />
int pinForward = 9;<br />
int pinReverse = 8;</p>
<p>void setup() {<br />
  Serial.begin(9600);<br />
  pinMode(pinRight, OUTPUT);<br />
  pinMode(pinLeft, OUTPUT);<br />
  pinMode(pinForward, OUTPUT);<br />
  pinMode(pinReverse, OUTPUT);<br />
}</p>
<p>void loop() {<br />
  if(Serial.available() &gt; 0){<br />
    int tmpByte = Serial.read();<br />
    switch(tmpByte){<br />
      case 'w': // Move car FORWARDS<br />
        digitalWrite(pinReverse, LOW);<br />
        digitalWrite(pinForward, HIGH);<br />
        break;<br />
      case 's': // Move car in REVERSE<br />
        digitalWrite(pinForward, LOW);<br />
        digitalWrite(pinReverse, HIGH);<br />
        break;<br />
      case 'a': // Turn steering wheels LEFT<br />
        digitalWrite(pinRight, LOW);<br />
        digitalWrite(pinLeft, HIGH);<br />
        break;<br />
      case 'd': // Turn steering wheels RIGHT<br />
        digitalWrite(pinLeft, LOW);<br />
        digitalWrite(pinRight, HIGH);<br />
        break;<br />
      case '_': // STOP ALL motion<br />
        digitalWrite(pinReverse, LOW);<br />
        digitalWrite(pinForward, LOW);<br />
        // The missing break; here is entirely intentional.<br />
      case 'x': // Move steering wheels STRAIGHT<br />
        digitalWrite(pinRight, LOW);<br />
        digitalWrite(pinLeft, LOW);<br />
        break;<br />
      default:<br />
        break;<br />
    }<br />
  }<br />
}<br />
[/c]</p>
<p>Notice that the <code>digitalWrite(pin, LOW);</code> always precedes the <code>digitalWrite(pin, HIGH);</code> command? This is to prevent conflicting commands from being sent to the car(e.g. Forwards and Backwards simultaneously).</p>
<p>And now, on to the Web App-based controller:</p>
<p><strong>Web Application Controller</strong></p>
<p>This controller comes in two parts. One is the actual client, which is served as a single html file (with optional additions - discussed later), and one is the server, which is a Python script that simply copies all data sent over a WebSocket to the Arduino over a serial port. This is how the client interface looks like:</p>
<p>[caption id="attachment_37" align="aligncenter" width="300" caption="The web app on an iPad."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/Untitled-1.png"><img class="size-medium wp-image-37" title="iPad Interface" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/Untitled-1-300x199.png" alt="The web app on an iPad." width="300" height="199" /></a>[/caption]</p>
<p>The server is based on <a href="http://pastebin.com/zBjN02jQ" target="_blank">this</a> Python script (if you want to use a test server, grab <a href="http://pastebin.com/d8SDbbED" target="_blank">this</a> code - the response headers adhere to the Same-Origin Policy). <a href="http://sourceforge.net/projects/pyserial/files/pyserial/2.5/" target="_blank">pyserial</a> 2.5 is used to send output to the Arduino.</p>
<p>The web-based client, on the other hand, is much more complex and interesting. A single file (index.html) draws the GUI (using Canvas), reads the tilt angle of the device (using DeviceMotionEvent), calculates the action that the car has to perform and sends the action to the Python script over a WebSocket connection. HTML5 is certainly useful, isn't it?</p>
<p>The JavaScript has been extensively commented, and is included (along with the optional files) in the download above.</p>
<p>The purpose of the optional files (<code>cache_manifest.php</code> and <code>date.php</code>) is explained <a title="iPad Web App â€“ Cache Manifests" href="http://www.gauravmanek.com/blog/?p=31" target="_blank">here</a>. They are not essential to the functioning of the code.</p>
<p><strong>Kinect Controller</strong></p>
<p>The Kinect controller is written using <a href="http://codelaboratories.com/nui/" target="_blank">Code Laboratories' CL NUI SDK</a> instead of the more commonly used (and official) OpenNI or OpenKinect/libfreenect. The primary motivation in choosing CL NUI over the other SDKs is that CL NUI makes writing code in C# very easy and serial communication is a trivially easy in C#. The tradeoff of writing in managed C# is that (1) Threading is inevitable, which adds to the complexity of the code and (2) The image processing code runs painfully slowly. The software looks like this:</p>
<p>[caption id="attachment_38" align="aligncenter" width="300" caption="Kinect view."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/screenshot_kinect.png"><img class="size-medium wp-image-38" title="screenshot_kinect" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/03/screenshot_kinect-300x180.png" alt="" width="300" height="180" /></a>[/caption]</p>
<p>The bar on the left is not relevant to this project - it is just a quick way to move the Kinect up and down (using the built-in motor) and to read and graph the angle over time. The algorithm used to detect the position of the hand has been deliberately kept simple - working with System.Drawing.Bitmap objects is very slow. Here is the algorithm:</p>
<p>[c language="c++"]<br />
// System.Drawing.Bitmap bmpVideoData contains the current frame.<br />
// double xbar, ybar contain the running average of the points that lie<br />
// 	in the desired depth range. Tweak the incremented values until satisfied<br />
// 	with the accuracy and speed trade-off. The choice of 10 is arbitrary.<br />
for(int i=0; i&lt;bmpVideoData.Width; i+=10)<br />
    for(int j=0; j&lt;bmpVideoData.Height; j+=10){<br />
        c = bmpVideoData.GetPixel(i, j);<br />
        // Check to see if color of pixel in depth map corresponds to the desired<br />
        // depth range. This was manually calculated beforehand, but can be<br />
        // automated if the range needs to be varied.<br />
        if (c.R == 0 &amp;&amp; c.B == 255 &amp;&amp; c.G &lt; 192) {<br />
            // Live, numerically stable, mean calculation:<br />
            ++count;<br />
            xbar += (i - xbar) / count; // Update the mean x value<br />
            ybar += (j - ybar) / count; // Update the mean y value<br />
        }<br />
    }<br />
// xbar and ybar will be used to calculate the position of the hand onscreen,<br />
// and the action to be performed by the robot.<br />
[/c]</p>
<p>&nbsp;</p>
<p>As algorithms go, this is among the simplest. It gives surprisingly robust tracking, though. Do note that you need to install <a href="http://codelaboratories.com/nui/" target="_blank">Code Laboratories' CL NUI SDK</a> before you can run the code included in the download above. Once you have done that, copy <code>CLNUIDevice.cs</code>,  <code>CLNUIDevice.dll</code> and  <code>NUIImage.cs</code> into the project folder, replacing the existing files. (As per their SDK license requirements, I cannot distribute these files directly).</p>
<p><strong>Future Expansion</strong></p>
<ol>
<li>Use the Ethernet shield and write a sketch that allows the Arduino to act as a WebSocket server. This will remove the need for having a computer as an intermediary (to forward WebSocket data to the Arduino over the serial port).</li>
<li>Modify the web app code to automatically use the internal gyroscope when available (by using <a href="http://dev.w3.org/geo/api/spec-source-orientation" target="_blank">DeviceOrientationEvent</a> instead of DeviceMotionEvent). When I eventually get a device with a gyroscope, I'll look into it.</li>
<li>Implement the same thing in a toy helicopter. Same concept, new dimension! Use the Kinect to gather positional data, and the iPad to steer it around.</li>
<li>Modify the vision algorithm to detect each hand separately (using a conditional floodfill), and allow each hand to control a different car. Alternatively, use it to steer a helicopter in three dimensions.</li>
</ol>
