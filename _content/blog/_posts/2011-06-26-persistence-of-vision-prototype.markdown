---
layout: post
status: publish
published: true
title: Persistence of Vision prototype
author:
  display_name: gauravmm
  login: gauravmm
  email: maneks@gmail.com
  url: ''
author_login: gauravmm
author_email: maneks@gmail.com
wordpress_id: 42
wordpress_url: http://www.gauravmanek.com/blog/?p=42
date: !binary |-
  MjAxMS0wNi0yNiAxNToyMzoxMCArMDgwMA==
date_gmt: !binary |-
  MjAxMS0wNi0yNiAwNzoyMzoxMCArMDgwMA==
categories:
- Projects
---
<p>Recently, I saw an impressive business card how-to that uses Persistence of Vision to display floating text. <a href="http://www.instructables.com/id/Circuit-Board-Lab-POV-Business-Card/">Take a look at it</a>.</p>
<p>I was considering the plausibility of a version of this card that can display the text and graphics in color. The basic mechanism (Persistence of Vision) is still the same, but the new card uses either 3-color RGB SMD LEDs (which are prohibitively expensive), or three rows of LEDs (red, green and blue each get their own row).</p>
<p style="text-align: center;"><img class="aligncenter size-full wp-image-44" title="Normal PoV Card" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/single_LED_row.png" alt="" width="540" height="400" /></p>
<p><strong>Row Alignment</strong></p>
<p>In a normal PoV card, the text is displayed along a single arc (the yellow path). Once multiple rows of LEDs are introduced, it becomes necessary to align them such that all their paths coincide in order to display a single color image. Without any alignment, there is an obvious separation in the paths. In the diagram below, observe how the paths appear to coincide closest to the vertical position, but are far apart at the ends:</p>
<p style="text-align: center;"><img class="size-full wp-image-46 aligncenter" title="3_LED_row_unaligned" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/3_LED_row_unaligned.png" alt="" width="540" height="400" /></p>
<p>For the rows to be successfully aligned, they must converge at the point of the elbow (assuming, of course, that the person holding the card holds his elbow in a fixed position while viewing these cards). The alignment must be like this:</p>
<p style="text-align: center;"><img class="aligncenter size-full wp-image-47" title="3_LED_row_fixed_alignment" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/3_LED_row_fixed_alignment.png" alt="" width="540" height="400" /></p>
<p>Where <em>r</em> is the distance from the pivot point (your elbow) to the lowest LED, and <em>Î¸</em> is the angular displacement between two adjacent rows. Notice that the arcs do overlap, but have an angular displacement. This is unavoidable, and can be (reasonably) easily corrected in software. The exact method used to correct this is discussed in the next section. In the final model, it is desirable to make <em>Î¸ </em>as small as possible<em>. </em>Also, you must know the value of <em>r</em> before you can build the card.</p>
<p style="text-align: center;"><img class="aligncenter size-full wp-image-48" title="3_LED_row_fixed_alignment_card" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/3_LED_row_fixed_alignment_card.png" alt="" width="540" height="400" /></p>
<p>Calculate the exact placement of each of the LEDs in such an arrangement only requires basic trigonometry (or even geometry), and is left as <a href="http://uncyclopedia.wikia.com/wiki/Proof#Proof_by_Omission" target="_blank">an exercise to the reader</a>. The main constraining variables are <em>r</em>, <em>d</em>, and the minimum distance between LEDs. Assuming 0.5m (a child's arm), 5 cm and 8 mm (respectively), <em>Î¸</em> = 0.9Â° and the topmost LEDs will be 9 mm apart - a close-to-parallel construction. In fact, using the above values for <em>d</em> and minimum distance, we can quickly plot the difference in spacing (in mm) against the arm length (in meters):</p>
<p>[caption id="attachment_49" align="aligncenter" width="300" caption="Displacement against r"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/graph.png"><img class="size-medium wp-image-49 " title="graph" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/graph-300x188.png" alt="" width="300" height="188" /></a>[/caption]</p>
<p>It's possible to make a card with moving sections that allow a person to pick their height, but that would simply be overkill. Here's a design:</p>
<p style="text-align: center;"><img class="aligncenter size-full wp-image-50" title="3_LED_row_movable" src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/3_LED_row_movable.png" alt="" width="540" height="400" /></p>
<p>If you implement, do tell me! The combination of precise cutting and moving electronics puts this out of the reach of all but the most determined hobbyists.</p>
<p>I have an initial prototype of a single-color device, made using cardboard, copper tape and an Arduino Uno (not mounted on the card itself - for obvious reasons). This is the card with two LEDs lit:</p>
<p>[caption id="attachment_51" align="aligncenter" width="200" caption="Prototype"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/DSC_5184.jpg"><img src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/DSC_5184-200x300.jpg" alt="" title="DSC_5184" width="200" height="300" class="size-medium wp-image-51" /></a>[/caption]</p>
<p>And this is the circuit diagram sketched out on the cardboard, with components placed appropriately:</p>
<p>[caption id="attachment_52" align="aligncenter" width="300" caption="Sketch"]<a href="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/DSC_5180.jpg"><img src="http://www.gauravmanek.com/blog/wp-content/uploads/2011/06/DSC_5180-300x200.jpg" alt="" title="DSC_5180" width="300" height="200" class="size-medium wp-image-52" /></a>[/caption]</p>
