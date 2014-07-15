---
layout: post
status: publish
published: true
title: Arduino + Laser Tripwire + Camera
author:
  display_name: gauravmm
  login: gauravmm
  email: maneks@gmail.com
  url: ''
author_login: gauravmm
author_email: maneks@gmail.com
wordpress_id: 58
wordpress_url: http://www.gauravmanek.com/blog/?p=58
date: !binary |-
  MjAxMi0wNS0yMCAwMDo1Njo0MSArMDgwMA==
date_gmt: !binary |-
  MjAxMi0wNS0xOSAxNjo1Njo0MSArMDgwMA==
categories:
- Projects
---
<p>This project makes use of an Arduino and some fairly simple electronics to trigger a DSLR when a person breaks a laser beam. This laser beam is password-protected and can be enabled and disabled using an iPhone/iPod Touch web app. It's conceptually simple, and makes for really fun party games as well.</p>
<p><strong>The Laser</strong></p>
<p><strong></strong>In my set up, I used several small mirrors to turn the single beam into a grid that covered a room.</p>
<p>[caption id="attachment_59" align="aligncenter" width="640" caption="Laser beam reflected around a room."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0885.jpg"><img class="size-large wp-image-59" title="Laser beam reflected around a room." src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0885-1024x685.jpg" alt="" width="640" height="428" /></a>[/caption]</p>
<p>The 5mw green laser is barely visible under normal conditions; the image above has a long exposure timing. The laser is turned on and off by the Arduino, and so this beam is not visible in photos. The laser is from a normal laser pointer, and looks like this:</p>
<p>[caption id="attachment_60" align="aligncenter" width="300" caption="The laser pointer. It&#39;s held in a microphone clip mounted on a tiny tripod."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0902.jpg"><img class="size-medium wp-image-60" title="Laser pointer" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0902-300x249.jpg" alt="" width="300" height="249" /></a>[/caption]</p>
<p>The laser pointer's button is held down by the clip, and the power supply to the laser is controlled using a relay. <strong>The detector</strong> <strong></strong>The laser beam is detected by an LDR in a simple voltage divider circuit connected to the Arduino. The Arduino is configured to use an interrupt to process the voltage change - this will be described in detail a little further down. As the laser beam is scattered by the imperfections in the mirrors, it is first collected and focused onto the LDR using a fresnel lens. Here is a photo of the beam:</p>
<p>[caption id="attachment_61" align="aligncenter" width="300" caption="Scattered laser beam"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0889.jpg"><img class="size-medium wp-image-61" title="Laser scattering" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0889-300x300.jpg" alt="" width="300" height="300" /></a>[/caption]</p>
<p>And here is the beam collection set-up:</p>
<p>[caption id="attachment_63" align="aligncenter" width="300" caption="Beam collection &amp; detection"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0888.jpg"><img class="size-medium wp-image-63" title="Beam collection set-up" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0888-300x200.jpg" alt="" width="300" height="200" /></a>[/caption]</p>
<p>Note the lens on the right. It is positioned to focus the incoming light onto the sensor. This saturates the LDR, allowing it's resistance to fall to around 300Î© (In complete darkness, it is around 30,000Î©). The circuit diagram is shown below (drawn in <a href="http://fritzing.org/" target="_blank">fritzing</a>). Note that the LDR is in series withÂ 5kÎ© of resistance, and that the voltage is being measured by <em>digital</em> input 2, not an analog input.</p>
<p>[caption id="attachment_64" align="aligncenter" width="300" caption="LDR voltage divider circuit to detect the laser beam."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/vDivider_bb.png"><img class="size-medium wp-image-64" title="LDR voltage divider circuit to detect the laser beam. " src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/vDivider_bb-300x285.png" alt="" width="300" height="285" /></a>[/caption]</p>
<p>The simple way of detecting if the light beam was interrupted would be to use the Arduino's built-in analog to digital converter and the handyÂ <em><a href="http://arduino.cc/en/Reference/analogRead">analogRead()</a></em> function to determine the potential across the LDR and use that to calculate the intensity of the incident light. The problem with this is that it's slow (100Î¼s per read) and it requires constant polling, which prevents it from doing anything else (strictly speaking, this is not true, but at best the polling frequency would suffer.)</p>
<p>By connecting it to digital pin 2, we can use the Arduino's external interrupt pin to call a function when the voltage rises from LOW to HIGH. Instead of setting a voltage threshold (as we would do in the simple method), we set the sensitivity of the trigger in hardware - by changing the resistance from +5v to the LDR, we can adjust the threshold intensity of light.</p>
<p><strong>The Camera Trigger</strong></p>
<p>The camera trigger is a modified Yongnuo ML-L3 clone (<a href="http://www.ebay.com/sch/i.html?_nkw=YONGNUO%20ML-L3&amp;_sop=15">available on eBay</a>) that has additional female header pins soldered onto the button contacts. The remote's board has holes drilled in a convenient position. Modifying it is simple - just use a screwdriver to pry off the top sticker, solder on the female headers, cut the sticker and paste it back. The original button remains fully functional.</p>
<p>[caption id="attachment_65" align="aligncenter" width="247" caption="Camera Trigger"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0897-copy.jpg"><img class="size-medium wp-image-65" title="Camera Trigger" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0897-copy-247x300.jpg" alt="" width="247" height="300" /></a>[/caption]</p>
<p>AnÂ <a href="http://en.wikipedia.org/wiki/Opto-isolator">optoisolator</a>Â is used (with the two headers connected across the phototransistor end) to trigger the shutter.</p>
<p><strong>The Laser &amp; The Buzzer</strong></p>
<p>Connecting these two is very easy - the buzzer is controlled using a transistor (I used the MPS-2222A, a small NPN transistor), and the laser is controlled using a relay, which is in turn controlled by a transistor.</p>
<p>The only caveat is that the laser diode expects a 3V power supply, and so the relay is connected to the Arduino's 3V output. Ideally, the laser would have its own power circuit and surge protection and it would be connected to an independent power supply. The photo of the breadboarded circuit may be helpful:</p>
<p>[caption id="attachment_66" align="aligncenter" width="640" caption="The circuit on a breadboard."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0897.jpg"><img class="size-large wp-image-66" title="Breadboarded circuit" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/DSC_0897-1024x685.jpg" alt="" width="640" height="428" /></a>[/caption]</p>
<p>Note the shroud for the LDR on the bottom left of the image. It's cut from a sheet of black paper, and it allows you to greatly increase the sensitivity of the circuit.</p>
<p><strong>The Code</strong></p>
<p>The code is split up into three sections: An iPhone web app, a Python server running on a computer and finally the Arduino code. In the current version of the software, users can enable and disable the laser beam remotely using a very simple interface:</p>
<p>[caption id="attachment_67" align="aligncenter" width="320" caption="iPhone/iPod Touch app."]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/photo.png"><img class="size-full wp-image-67" title="photo" src="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/photo.png" alt="" width="320" height="480" /></a>[/caption]</p>
<p>The code is simple and commented, and can be downloadedÂ <a href="http://www.gauravmanek.com/blog/wp-content/uploads/2012/05/Laser_grid_code-gauravmanek.com_.zip">here</a>.</p>
<p>If you do make your own version, link to it in the comments and I'll feature it here.</p>
