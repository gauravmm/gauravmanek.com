---
title: Navelgazer
subtitle: Linter for first-order logic.
link: "http://gauravmm.github.io/Navelgazer/"
---

A common step in learning mathematical philosophy is learning to use an abstract form of first-order logic. I took an introductory class in Brown in Fall 2015 with [Prof. Richard Heck](http://rgheck.frege.org/). The class used the [quite popular introductory text by Warren Goldfarb](http://www.hackettpublishing.com/deductive-logic), appropriately named *Deductive Logic*. Through my experience and that of my peers, it quickly became apparent that the treatment of quantifiers was the biggest stumbling block in understanding the material, with most students taking more than one round of feedback from the instructors to fully grasp the material. This took a lot of effort and frustration for the students, and a lot of marking for the instructors.

This project meets this need by immediately verifying students derivations and providing them concrete and germane feedback on their work. Students enter their derivation into [the linter](http://gauravmm.github.io/Navelgazer/) using notation adapted from Warren Goldfarb's book. The notation used is essentially identical to that used in class, and so doesn't make using the tool any more difficult. The linter verifies that each line is syntactically correct and that it follows from the previous line.

{% include blogimage src="sample.png" caption="A correct derivation." %}

Correct derivations are rewarded with a check next to each line, and incorrect steps in the derivation are flagged with red circles. Every check has an associated human-readable error description, and these are displayed when the error flag is hovered over.

{% include blogimage src="sampleerr.png" caption="Oops, there's a mistake here." %}

This tool is slated for field testing in Fall 2016 in Brown University, and will be updated with feedback from students. Feel free to [contact me](mailto:gaurav@gauravmanek.com) if you want to use it for your class.
