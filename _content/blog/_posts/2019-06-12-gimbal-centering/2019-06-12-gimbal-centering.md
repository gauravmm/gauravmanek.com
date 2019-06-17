---
title: Controller Gimbal Centering
subtitle: Surprisingly thoughtful design for a simple problem.
mathjax: true
link: https://colab.research.google.com/drive/1JMRrvIveDCNLbjjFnXhKRdBbqAS1PLMy
---

{% include blogimage src="gimbal_top.jpg" %}
This article is also available as a Jupyter notebook on [Google Colab](https://colab.research.google.com/drive/1JMRrvIveDCNLbjjFnXhKRdBbqAS1PLMy).

I was upgrading a gimbal in an R/C controller when I noticed that the design of gimbal zeroing mechanism was a relatively non-obvious invention. I've seen this zeroing design on gimbals from more than one manufacturer, so I thought I would take a closer look. First, here's the mechanism in action:

{% include webm src="mechanism.webm" %}

Each axis is has a separate centering mechanism with its own tension spring to provide the inwards force. As the gimbal is pushed away from the center position, the pin carriage it is attached to rotates. One of two pins on the carriage deflects a spring arm, which stretches a spring and provides the restorative force. Here's a diagram:

{% include blogimage src="diagram.png" %}

## Why go to all this trouble?

Cost is often the overriding concern in making cheap consumer electronics and this design requires a single spring instead of alternate designs that use a pair. (Springs are pricey compared to an injection-molded part.) However, I have seen this design on relatively pricey (~$40) gimbals so the advantage is not just in cost.

For R/C pilots, getting a crisp feedback around the zero position of the gimbal is desirable. This design guarantees crisp zeroing and allows for the restoring force deadzone to be controlled.

## The Problem

What we want from such a gimbal design is the restoring force for both positive and negative deflections to be similar. This gimbal is noticably stiffer when deflected rightwards than leftwards side than the other. This is very annoying during regular use, so lets see if we can fix this.

# Simple Model

We assume a simple geometry with a frictionless side and a pin of infinitesimal radius. The radius of the gimbal base is \\(r = 15 \text{mm}\\), and right-side pin is \\(l_r = 12 \text{mm}\\) from the center. Using some high-school geometry, we can calculate the angle of deflection of the spring arm \\(\theta\\) as a function of the gimbal angle \\(\alpha\\):

\\[
\theta = \max\left(
    \tan^{-1}\left(\frac{\sin(\alpha)}{\frac{r}{l_l} - \cos(\alpha)}\right),
    \tan^{-1}\left(-\frac{\sin(\alpha)}{\frac{r}{l_r} + \cos(\alpha)}\right)
    \right)
\\]

Assuming the left-side pin is about \\(l_l = 4mm\\) from the center, this looks like:

```python
def theta(alpha : float, radius=None, arm_l=None, arm_r=None):
  theta_l = atan(sin(alpha) / (radius/arm_l - cos(alpha))) 
  theta_r = atan(sin(alpha) / (radius/arm_r + cos(alpha)))
  return theta_l, theta_r

def plot_theta(X, theta, radius=None, left_l=None, right_l=None):
    ...

gp = {"radius": 15., "right_l": 12., "left_l": 4.} # Gimbal properties
X = np.arange(0, np.pi/4, np.pi/4/64) # Range
plot_theta(X, theta, **gp)
```

{% include blogimage src="4mm_simple.png" %}

Now that we have this function, we can find a new left-pin distance \\(l_l\\) to minimize the difference in the two forces. We do this by constructing a loss function that penalizes the difference between the left- and right-side force at evenly spaced points:

```python
def loss(radius=None, left_l=None, right_l=None):
  X = np.arange(0, np.pi/4, np.pi/4/64)
  return sum(abs(l-r) for l, r in (theta(x, radius, left_l, right_l) for x in X))
# Construct a partial loss function
loss_partial = lambda x: loss(radius=gp["radius"], left_l = x, right_l = gp["right_l"])
```

We use the [Golden Section search](https://en.wikipedia.org/wiki/Golden-section_search) from `SciPy`'s [`minimize_scalar`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.minimize_scalar.html#scipy.optimize.minimize_scalar) optimizer to find a minimizing value.

```python
left_l_opt = minimize_scalar(loss_partial, bracket=[1e-5, gp["right_l"]], method="golden")
```

For \(l_l = 5.02 \text{mm}\) get this:

{% include blogimage src="opt_simple.png" %}


## Force-Response

The output angle is useful to find a value of \(l_l\) that minimizes the difference in response, but ultimately we care about the force-response curve. Consider a preloaded spring (already stretched some distance `d`) with spring coefficient `k=0.01 N/mm`. We model the force response curve:

```python
def theta_to_force(theta, d=None, k=0.01, radius=None):
  return max((radius*4*abs(sin(theta/2)) + d), 0) * k

def plot_force(X, radius=None, left_l=None, right_l=None, d=None, k=0.01):
  ...

plot_force(..., d=0), plot_force(..., d=2), plot_force(..., d=-2)
plt.legend(["no preload", "2mm preload", "2mm slack"])
```

{% include blogimage src="simple_forceresponse.png" %}

# Pin-Diameter Model

So far, so simple. The problem with our model is the diameter of the pins is significant compared to the displacement. Now we model this using the symbolic solver `sympy`.

```
import sympy as sym
import mpmath as mpm

pin_r = .5 #mm
vert_disp = 0 #mm

class GimbalSym(object):
  def __init__(self):
    # Structure of pins:
    r, ll, lr = sym.symbols("r ll lr")
    # Angle:
    a, t = sym.symbols("a t")
    # Spring setup:
    pr, v = sym.symbols("pr v")
    # Point where the lever arm touches the pin:
    c = sym.symbols("c")
    
    # Center of rotation:
    self.center = sym.Point(0, 0)
    self.pin_arm = sym.Line2D(self.center, sym.Point(r, 0)).rotate(a)
    self.right_pin = self.pin_arm.arbitrary_point(lr)
    self.left_pin = self.pin_arm.rotate(sym.pi).arbitrary_point(ll)
    self.radius = r

    # Point at which the lever is fixed:
    self.lever_fix = sym.Point(-r, v)
    self.lever_arm = sym.Line2D(self.lever_fix, sym.Point(r, v)).rotate(t, self.lever_fix)
    self.lever_arm_intersection_point = self.lever_arm.arbitrary_point(c)
    
    self.pin_radius = pr
    pin = sym.Point(self.pin_radius, 0).rotate(t - sym.pi/2)
    self.lever_arm_contact_point = self.lever_arm_intersection_point + pin    
    
    self.symbols = {"r": r, "ll": ll, "lr": lr, "a": a, "t": t, "pr": pr, "v": v, "c": c, "t": t}

  def subst(self, e, alpha, radius=15, l_left=5, l_right=12, arm_displacement=1., pin_radius=1., theta=None, c=None):
    args = [("a", alpha), ("ll", l_left/self.symbols["r"]), ("lr", l_right/self.symbols["r"]), ("r", radius), ("v", arm_displacement), ("pr", pin_radius)]
    if theta is not None:
      args.append(("t", theta))
    if c is not None:
      args.append(("c", c))
    for sy, val in args:
      e = e.subs(self.symbols[sy], val)
    return e

  def solve(self, *args, **kwargs):
    t = self.symbols["t"]
    c = self.symbols["c"]

    def select_solution(possible):
      for tv, cv in possible:
        tv = tv.evalf()
        cv = cv.evalf()
        
        if cv < 0 or cv > 1:
          continue;
        return tv, cv
      return None
    
    closest_l = self.subst(self.lever_arm_contact_point - self.left_pin, *args, **kwargs)
    p_closest_l = sym.solve((closest_l.x, closest_l.y), (t, c))
    try:
      t_l, c_l = select_solution(p_closest_l)
    except TypeError:
      t_l, c_l = 0.0, 0.0

    closest_r = self.subst(self.lever_arm_contact_point - self.right_pin, *args, **kwargs)
    p_closest_r = sym.solve((closest_r.x, closest_r.y), (t, c))
    try:
      t_r, c_r = select_solution(p_closest_r)
    except TypeError:
      t_r, c_r = 0.0, 0.0

    return t_l, c_l, t_r, c_r

  def get_theta(self, *args, **kwargs):
    t_l, c_l, t_r, c_r = self.solve(*args, **kwargs)
    # Figure out which control is binding:
    binding = "left" if (t_r > sym.pi) or t_l > t_r else "right" 
    
    return (t_l if binding == "left" else t_r), binding
  
  def draw(self, ax, *args, **kwargs):
    ...

g = GimbalSym()

fig, axes = plt.subplots(2, 2, sharex="all", sharey="all", figsize=(12., 8.))
g.draw(axes[0, 0], -0.4), g.draw(axes[0, 1], -0.1), g.draw(axes[1, 0],  0.0), g.draw(axes[1, 1],  0.6)
```

{% include blogimage src="model_gimbal_response.png" %}

## Optimizing This

Now that we have a model, we can optimize this. This takes about an hour to run:

```python
X_left  = np.arange(-np.pi/6,  1e-4,  np.pi/6/8)
X_right = np.arange( np.pi/6, -1e-4, -np.pi/6/8)
# Precompute right-side deflection:
T_right = [g.get_theta(xr, radius=gp["radius"], l_left=gp["left_l"], l_right=gp["right_l"])[0] for xr in X_right]

def loss(radius=None, left_l=None, right_l=None):
  T_left = [g.get_theta(xl, radius=radius, l_left=left_l, l_right=right_l)[0] for xl in X_left]
  return sum(abs(tl-tr) for tl, tr in zip(T_left, T_right))
loss_partial = lambda x: loss(radius=gp["radius"], left_l = x, right_l = gp["right_l"])
left_l_opt = minimize_scalar(loss_partial, bracket=[1e-5, gp["right_l"]], method="golden")

plot_gimbalsym_theta(...)
```


