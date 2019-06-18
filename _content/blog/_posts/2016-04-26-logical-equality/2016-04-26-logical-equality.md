---
title: Logical Equality in Navelgazer
subtitle: Turns out, "equal" is a difficult question.
---

As [posted previously](/projects/2016/navelgazer/) I wrote Navelgazer, a linter for first-order logic. First order logic covers logical statements in boolean algebra:

  - with sentence letters and logical operators (`x`, `x ∧ ¬y`, etc.),
  - allowing for predicates over sentence letters (`Px`, `Qxy`, etc.), and--
  - with existential and universal quantifiers (`(∃x)Txy`, `(∀x)(∃z)Qxz`, etc.)

A common task that needs to be performed is to compare two statements and decide if they are equal. To lint effectively, we need to be able to figure out if two statements are logically equivalent, share the same structure, and have the same free variables. 

To discuss this effectively, we need to define the notion of *free* and *bound* variables. When considering a sentence in isolation, bound variables are those which appear within existential and universal quantifiers. For example, `x` and `y` are both bound in the sentence `(∀x)(∃z)(Qxa ∧ z)`. There is no restriction on the value of `a`, and so `a` is free.

# Equality

The most basic definition of equality that we are all used to is string equality: where `(∀x)(y ∧ (∃z)Qz ∧ x)` is equal to `(∀x)(y ∧ (∃z)Qz ∧ x)` and to nothing else. There are a few cases that this notion of equality fails to consider equal. For example:

  - When the conjuncts or disjuncts are written down in a different order. (e.g. `(∀x)((∃z)Qz ∧ y ∧ x)` is equivalent to the example.)
  - Changing the letter of a bound variable does not change the meaning of a sentence, provided the new letter is not used for another variable. (e.g. `(∀q)(y ∧ (∃p)Qp ∧ q)` is equivalent to the example.)
  - Adding double-negatives. (e.g. `(∀x)(y ∧ (∃z)Qz ∧ x)` is equivalent to the example.)

Our definition of equality needs to handle all these cases. 

## Algorithm

In the current version of Navelgazer, the function [`ExprEqualExact`](https://github.com/gauravmm/Navelgazer/blob/e1f348bd4cd0716546cbba7c5eb4674ba0bbf500/metalogic.js#L385) implements this behaviour. The general strategy we use involves treating expressions as trees. We recursively descend down the pair of trees representing the two expressions, comparing the current node at each step. If the two current nodes represent the same operation, predicate, or letter, we recur on all its children.

### Double Negatives

Handling double negatives is the easiest problem. Whenever we encounter two nested negatives in either the left or the right tree, we continue comparison from inside the double-negative. This pseudocode shows how this is handled.

```python
def stripDoubleNegative(expr):
	if expr is NEGATION:
		if expr.child is NEGATION:
			return stripDoubleNegative(expr.child.child);
	return expr;

def ExprEqualExact(left, right, ...):
	left = stripDoubleNegative(left);
	right = stripDoubleNegative(right);
	...

```

### Bound Variables

The bound variable comparison requires us to keep track of the variables in each quantifier we have seen while descending the tree. We need to maintain a list of bindings, add to it whenever we encounter a quantifier, and use it when comparing sentence letters. 

```python
def ExprEqualExact(left, right, mapping):
	... # We check that left and right are the same type.

	# Whenever we encounter a quantifier, we add the letters in each to a mapping.	
	if left.type is QUANTIFIER:
		if (left.letter is in mapping.from) or (right.letter is in mapping.to):
			# Throw an error, a letter is being bound twice.
		else:
			add {from: left.letter, to: right.letter} to mapping.
			return ExprEqualExact(left.child, right.child, mapping);

	# When we encounter a sentence letter, we pass them through the mapping before
	# checking for equality.
	else if left.type is SENTENCE_LETTER:
		return mapping[left.letter] == right.letter;
```

### Conjunctions and Disjunctions

Finally, the comparison of disjunctions and conjunctions. Our solution is a greedy approach: For each child on in the left tree, we find any equal child on the right (that is not already selected). Once we find such a child, we flag it as selected, add it to our mapping, and continue with the next child on the left-hand side. If we ever find a child in the left hand side with no available and equal child on the right, we know that the two trees are not equal. (There's a proof in the next section.)

There are some optimizations we apply to speed up the common case:

  - We compare nodes in equal positions first, so that the algorithm completes in linear time if the nodes are in the same order.
  - We assign each immutable tree element an id at time of creation. If two nodes are ever found to be the same, their ids are both replaced with the id of the lower node. This allows us to short-circuit comparisons for large, repeated subtrees.

Here's the pseudocode for the comparison:

```python
def ExprEqualExact(left, right, ...):
	... # We check that left and right are the same type.

	if left.type is JUNCTION:
		... # We check that left and right are both conjunctions or disjunctions,
		    # and they have the same number of children.

		selected = [];
		for a in left:
			for b in right:
				if b not in selected and equal(a, b):
					selected.add(b);
					break;
			else:
				return false; # No successful mapping has been found for `a`.

		return true; # We've found one `b` for every `a`, and so we are successful.
```

#### Proof

We want to prove that our greedy algorithm will always find a mapping between two sets of nodes if one exists. We begin by noting that our definition of equality is transitive. Proving that fact is an exercise to the reader.

Assume, for contradiction, that we have two sets of children (`left = {...}`, `right = {...}`), and our algorithm tells us that no permutation of `right` matches `left` when one really exists. We consider the last pair our algorithm selected so that no mapping was possible between the remaining nodes; from our assumptions, such a decision must exist. In making this decision, the algorithm only marked one node in `left` (call it `a`) and one in `right` (call it `b`) as selected.

For no mapping to be possible between the remaining nodes in `left` and `right`, there must have been some node in left (call it `a'`) that should have been mapped to `b`, and that is no longer possible because of the last decision our algorithm made. Similarly, there must be some node in right (call it `b'`) that should have been mapped to `a`.

For the mappings between `(a', b)` and `(b', a)` to exist, it must be true that `equal(a', b) ∧ equal(b', a)`. Because our algorithm chose to map `(a, b)` instead, it must also be true that `equal(a, b)`. Since equality is transitive `a`, `b`, `a'`, and `b'` are all equal and so our algorithm can go on to pair `(a', b')`. This contradicts our hypothesis, and so our greedy algorithm will always find a mapping if one exists.

Also, in the worst case, our algorithm will compare each element in `left` with each element in right at most once, and so our algorithm has a runtime a factor of `O(n^2)` of the time taken to compare a tree.

## Nested Conjunctions and Disjunctions

There is another case that we have to address, and that is of nested conjunctions. Specifically, we have to treat `(a ∨ b) ∨ c`, `a ∨ (b ∨ c)`, and `a ∨ (b ∨ c)` as equal. The algorithm that we have detailed so far assumes that the input does not contain conjunctions as children of conjunctions.

Instead of modifying the algorithm to do this, we address this at the time the conjunction object is created. The constructor automatically flattens such nested conjunctions (or disjunctions), which immediately solves this problem.

# Finding Letter Mappings

There is an additional problem we need to solve. Instead of just checking to see if two sentences are equal, we need find all possible substitutions of free variables in a sentence `left` that yield `right`, even allowing for multiple free variables to become the same fixed variable.

An example would be apt here. `(x ∨ y) → (x ∧ z)` can be turned into:

  - `(x ∨ y) → (x ∧ z)` given mapping (`x => x`, `y => y`, `z => z`),
  - `(x ∨ y) → (x ∧ y)` given mapping (`x => x`, `y => y`, `z => y`),
  - `(x ∨ z) → (x ∧ y)` given mapping (`x => x`, `y => z`, `z => y`), or--
  - `(w ∨ w) → (w ∧ w)` given mapping (`x => w`, `y => w`, `z => w`).

We need to determine if any substitution can give us one sentence from another, and if so, all the possible mappings that give rise to this.

This uses a similar algorithm to that investigated previously, with a twist. Instead of returning a boolean value, it returns a list of possible mappings. At the base case (when considering two sentence letters), it produces a mapping from `left.letter` to `right.letter`, leaving the rest of the mappings unspecified. 

When combining two lists of possible mappings (e.g. when combining the mappings for the antecedent and consequent in a conditional), we take the 'cross product' of all mappings: for each pair of mappings, if they do not contain conflicting mappings, we take their union. Otherwise, we discard the pair. The resultant list of mappings is deduplicated and returned.

Finally, when processing conjunctions and disjunctions, we assemble all mappings from every possible permutation into a single list. This is a terribly slow process, and so we have some implementation strategies to speed it up: We begin by comparing every possible pair nodes from `left` and `right`, precomputing a table which contains at cell `(i, j)` a list of all mappings that translate `left.child[i]` into `right.child[j]`. Then, we try every possible permutation, pruning the exploration tree if no further combinations are possible.

This is an exponential-time algorithm in the worst case, but typical inputs do not exceed four terms in the conjunction or disjunction, and so this it is quick in practice.

# Conclusion

There is much work to be done on this particular project, mainly in terms of writing tests and optimizing code.

Perhaps I'll soon write more about the truth-functional solver, the part of the code that verifies if a target statement is implied by a set of antecedent statements.
