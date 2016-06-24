---
title: Abacus Machine Simulator
subtitle: A simple abacus machine language, for teaching.
link: https://gauravmm.github.io/AbacusMachineSim/
---

Abacus machines, sometimes called register machines, are abstract machines that form a mathematical model of computation. They are equivalent to Turing machines, so any possible Turing machine algorithm can be implemented on an abacus machine and vice-versa. An interesting alternative to Turing machines, to be sure, but only really used in academia.

{% include blogimage src="multiply_compiled.png" caption="Here's an abacus machine that multiplies the values in [1] and [2], storing the result in [3]." %}

While in Brown, I was introduced to these machines in a class taught by [Prof. Richard Heck](http://rgheck.frege.org/). For class credit, I designed a language to describe abacus machines and wrote a compiler, runtime, and debugging tools for it. It includes features like:

  - Built-in testing, with `where` blocks at the end of each function definition. Tests are automatically run on each compilation, and tests are marked as passed or failed.
  - Static analysis is performed, detecting some types of infinite loops, unexitable functions, and unreachable lines.
  - Runtime analysis detects recursion (which is not permitted by the abacus machine model), and loops without exit conditions.
  - A debugger with the ability to:
    - step into, through, over, and out of functions,
    - halt execution at user-set breakpoints, and --
    - inspect (and change!) the current stack frame.
  - A compiler that can take a set of functions, each its own abacus machine, and compiles it down to a single abacus machine with no dependencies. The ability to reduce any program without recursion into a single program with a finite number of states is an important theoretical property, and this compiler provides constructive proof of that property.
  - [Graphviz](http://www.webgraphviz.com/) output.

The compiler can be run in a browser and comes with an implementation of division from first principles. [Take a look!](https://gauravmm.github.io/AbacusMachineSim/)
