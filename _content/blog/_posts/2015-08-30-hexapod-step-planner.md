---
title: Step Planning for Hexapods
subtitle: Taking first steps in motion planning.
link: https://github.com/gauravmm/Hexapod-IK
---

{% include webm src="wlk.webm" %}

I have been developing a hexapod in my free time in order to teach myself the basics of inverse kinematics and motion planning.

At this point in the development, I have access to the geometry of the hexapod, and can get and set the angle of each joint. I calculate forward and inverse kinematics of all six legs, and find the position of any joint in the hexapod relative to the hexapod, or relative to the world.

__Update__: Here's the final product, so you have some idea of what I was working towards:

{% include youtube id="cYUKvpEEngA" %}

# Body Pose

The first problem we need to solve is to be able to translate and rotate the hexapod body without moving the feet in the real world. Here's what we're trying to do:

{% include webm src="lr.webm" caption="Left-right translation of the body without moving the legs." %}

Lets begin with the hexapod in the initial pose. We want to get it into the target pose, with some known translation and/or rotation of the body. The ends of the legs must remain in the same position. 

The obvious solution is as follows:
  1. Calculate the position of the start of each leg (where it meets the body) in the in target pose, in the `world` coordinate system.
  2. Record down the position of the end of each leg in the initial pose in `world` coordinates.
  3. Find the relative position of the end of each leg in terms of its start.
  4. Use the IK solver to figure out the joint angles.

This is simple enough when we're dealing with a stationary hexapod. Once the ends of the legs begin to move, though, we will need additional logic to compensate for the expected motion of the end effector in each frame, etc.

## Stacked Frames of Reference

Instead, we approach this problem by noticing that we can explicitly define *frames of reference* --- coordinate systems within coordinate systems, each at a translation and rotation relative to the previous. We can represent these as a translation (a vector with 3 elements) followed by a rotation (a [unit quaternion](https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation), a great way of encoding angles, with nice computational properties). We could represent these as a 4x4 matrix, but by storing the rotation and translation separately we avoid an entire class of bugs involving accidental skewing or scaling of output.

We begin by arbitrarily declaring that our `world` frame is the outermost frame. Within that, we define a `hexapod` reference frame. Instead of defining this as some point on the hexapod, we define it as the position of the center of the hexapod body in its waiting pose. Within this coordinate system, we define the `body`, and within the body each `leg`, and so on. We arrive at this tree of transformations:

  - `world`
    - `hexapod`
      - `body`
        - `leg (front left)` 
          - `leg middle`
            - `leg end`
        - ...
        - `leg (rear right)`
          - ... 

We know the transformation associated with each refence frame in the tree, and so 'moving up' the tree is as easy as applying the transformation, i.e. if we have the position of the `leg end` in the `body`'s frame, we can apply the translation and rotation associated with `body` to arrive at the position in the `hexapod` frame.

Since the transformation at each frame must obey the laws of physics _[citation needed]_, it must be one-one, and so we can always calculate its inverse to allow us to descend the tree of transformations. We use this in our stepping model, specifically in satisfying the no-slip boundary condition.

The ability to use different frames of reference when planning motion is absolutely cruicial. The abstraction chosen for the project required the motion planner to supply a frame of reference whenever it specified any target coordinate. Next, we'll take a look at the 

# The Two Parts in Each Step

Each step can be split into the 'leg-down' and 'leg-up' parts, with different rules governing each.

To calculate the actions necessary for the hexapod to move or rotate in a particular manner, we change the transformation of the `hexapod` frame (with respect to the `world` frame) and allow the rest of our model to move the legs accordingly. Essentially, we give each leg some basic instructions, move the body around, and allow each leg to figure out how to make that happen.

## The No-Slip Boundary Condition

In the 'leg-down' part of each step, we can assume that the leg should remain on the table exactly where it is until it is time to lift it up again. We call this the no-slip boundary condition because we're assuming that a leg, once touching the table, is stuck exactly where it landed. (The actual no-slip boundary condition involves [fluids](https://en.wikipedia.org/wiki/No-slip_condition).)

As discussed earlier, our model keeps track of the tree of frames of reference. This makes this task trivial: the motion planner simply records down the position (in `world`) when the leg lands, and at each subsequent update, simply requests that the leg move to the same position in `world`. The rest of the inverse kinematics system transforms `world` to the appropriate reference frame and computes the joint angles necessary to make that happen.

When the time comes to lift the leg off, it is moved vertically upwards to some arbitrary height, and then control is passed to the 'leg-up' mode.

## Heuristic-Based Step Starting

While in the 'leg-up' mode, the leg should move into a good position to begin its next step. If we wanted to, we could pick an arbitrary position for the leg to return to regardless of the current trajectory of the hexapod.

We generally prefer having long strides to short ones. Short strides require us to take many short steps instead of fewer long steps, which makes our hexapod slower and is more power-hungry.

There is a problem with our simple solution: if we start at the center each time, the length of our stride must be less than the distance from the center to the nearest unreachable point. Otherwise, a particular step would not be possible to complete. We could easily extend the length of the stride by beginning it further away from the point at which the leg lifts off. As long as we leave enough space so that an unexpected change in direction will cause one of our legs to go out of bounds, we can get away without having an exact leg-down position. Our work in the 'leg-down' part will gracefully handle it for us.

That's exactly what we do in this implementation. We have a heuristic which is calculated by taking a combination of the forwards, sideways, and rotational speeds. We move the leg towards this target position during the 'leg-up' phase, recalculating it every frame. At the end of the 'leg-up' mode, we move the leg down to the surface and pass control to the 'leg-down' mode.

# Gait and Phases

We want to keep careful track of when each of our legs are up or down so that the hexapod is always balanced. The typical way of doing this is to have a predetermined sequence of legs moving up and down. The advantage of this simple system is that we don't need to prepare a physics model or keep track of the balance of the hexapod. That's a pretty compelling advantage, and so we went with phase-based models. Here are the three different gaits, for your edification:

{% include webm src="top-down.webm" caption="Three different gaits. The red circle indicates a leg that is not touching the ground."%}

All these gaits work on the same principle: legs that are grouped raise and lower together, and are said to be 'in phase'. Each phase is allotted some time in 'leg-up' mode in turn, and only one phase may be in 'leg-up' mode at any one point in time.

There are two main considerations when selecting a gait:

  1. Gaits with fewer phases require more torque to maintain. In the simplest two-phase gait, three legs are supporting the hexapod at any one point in time, while in the six-phase gait, the load is shared across five legs. A correspondingly stronger motor is required to maintain the two-phase gait.
  2. Gaits with more phases move more slowly. In the six-phase gait, each leg remains down for five-sixths of a cycle. A two-phase gait, a leg only remains down for half a cycle. Given a particular number of cycles per second, the the length of the stride is the chief limitation in selecting the walking speed. For a stride of length `x`mm, the two-phase gait may travel up to `2x`mm, but the six-phase gait is limited to `6x/5`mm.

# Putting It All Together

By now we have an idea of how each part of the motion planning works.

Here's the general view of how a single leg takes a step. While this is happening, the `hexapod` frame is moving in the `world` frame:
 
  1. Move leg to closest point in `world`.
  2. Record this point.
  3. Given new position of body in `world`, perform IK to keep leg in same point.
  4. Repeat previous step until the gait timer says its time to raise the leg.
  5. Raise leg off the ground.
  6. Use heuristics to calculate where to place leg down. Move some distance towards that position.
  7. Repeat previous step until the gait timer says its time to lower the leg.
  8. Go to the first step.

A good mental image to have is that of the body being propelled through space while the legs move up and down in phases, sticking to the surface wherever they touch.

# Conclusion

Additional work is needed to detect when a leg is about to reach the end of its range, and handle it appropriately. We could, for instance, allow that phase to go first, or simply force the hexapod to stop and recenter its legs. 

This is a particularly powerful system, especially because it handles cases that others are unable to. It gracefully handles changing the direction of motion mid-step, and even walking and rotating simultaneously. The underlying concepts are simple, but they come together to make something amazing.

This has been quite a ride, taking a few weeks out of my summer to complete, and I've learnt so much by doing this.
