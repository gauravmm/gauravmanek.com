---
title: Hexapod Inverse Kinematics
subtitle: A full inverse kinematics implementation for a hexapod.
link: https://github.com/gauravmm/Hexapod-IK
---

{% include webm src="wlk.webm" %}

This summer, I set about building a hexapod and writing --- from scratch --- the software necessary to make it walk. The hexapod could not walk because the motors could not deliver enough power to support its own weight, but the software is complete, and fully functional. It is available [on GitHub](https://github.com/gauravmm/Hexapod-IK).

Inverse kinematics is the process of calculating the joint angles necessary to achieve a particular pose or motion. This software can calculate the joint angles necessary to hold the hexapod body at any position and orientation relative to the ground.

# Step Planning

{% include webm src="wlk2.webm" %}

Once we have the ability to calculate inverse kinematics, we also give it a step model. The step model encodes information like phase and motion of the body, and includes heuristics on placing and lifting feet. With some minor configuration, it is then able to support any combination of:

  - three different gaits,
    - 2-phase ("ant-like")
    - 3-phase ("fly-like")
    - 6-phase ("millipede-like")
  - three different directions
    - forwards/backwards
    - left/right
    - clockwise/counter-clockwise
  - six axes of rotation and translation (of the body)
  
These are all showcased in the project video.

{% include youtube id="cYUKvpEEngA" %}