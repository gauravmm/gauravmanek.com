---
title: Persistence of Vision prototype
subtitle: An attempt to bring colour to persistence-of-vision devices.
---

Recently, I saw an impressive business card how-to that uses Persistence of Vision to display floating text. [Take a look at it](http://www.instructables.com/id/Circuit-Board-Lab-POV-Business-Card/).

I was considering the plausibility of a version of this card that can display the text and graphics in color. The basic mechanism (Persistence of Vision) is still the same, but the new card uses either 3-color RGB SMD LEDs (which are prohibitively expensive), or three rows of LEDs (red, green and blue each get their own row).

{% include blogimage src="single_LED_row.png" caption="Normal PoV Card" %}

# Row Alignment

In a normal PoV card, the text is displayed along a single arc (the yellow path). Once multiple rows of LEDs are introduced, it becomes necessary to align them such that all their paths coincide in order to display a single color image. Without any alignment, there is an obvious separation in the paths. In the diagram below, observe how the paths appear to coincide closest to the vertical position, but are far apart at the ends:

{% include blogimage src="3_LED_row_unaligned.png" %}


For the rows to be successfully aligned, they must converge at the point of the elbow (assuming, of course, that the person holding the card holds his elbow in a fixed position while viewing these cards). The alignment must be like this:

{% include blogimage src="3_LED_row_fixed_alignment.png" %}

Where _r_ is the distance from the pivot point (your elbow) to the lowest LED, and _I_ is the angular displacement between two adjacent rows. Notice that the arcs do overlap, but have an angular displacement. This is unavoidable, and can be (reasonably) easily corrected in software. The exact method used to correct this is discussed in the next section. In the final model, it is desirable to make _I_ as small as possible. Also, you must know the value of _r_ before you can build the card.

{% include blogimage src="3_LED_row_fixed_alignment_card.png" %}

Calculate the exact placement of each of the LEDs in such an arrangement only requires basic trigonometry, and is left as [an exercise to the reader](http://uncyclopedia.wikia.com/wiki/Proof#Proof_by_Omission). The main constraining variables are _r_, _d_, and the minimum distance between LEDs. Assuming 0.5m, 5 cm and 8 mm (respectively), I = 0.9 and the topmost LEDs will be 9 mm apart - a close-to-parallel construction. In fact, using the above values for _d_ and minimum distance, we can quickly plot the difference in spacing (in mm) against the arm length (in meters):

{% include blogimage src="graph.png" caption="Displacement against r" %}

It's possible to make a card with moving sections that allow a person to pick their height, but that would simply be overkill. Here's a design:

{% include blogimage src="3_LED_row_movable.png" %}

I have an initial prototype of a single-color device, made using cardboard, copper tape and an Arduino Uno (not mounted on the card itself - for obvious reasons). This is the card with two LEDs lit:

{% include blogimage src="DSC_5184.jpg" caption="Prototype" %}

And this is the circuit diagram sketched out on the cardboard, with components placed appropriately:

{% include blogimage src="DSC_5180.jpg" caption="Sketch" %}