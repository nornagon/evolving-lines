if we want to evolve programs that draw things (where 'things' = monochrome
vectors, so axidrawable), we need to use a software substrate that is
evolvable. i.e. one that has the property that, given an input program, it is
possible to produce several derivative programs that are similar to, but not
exactly the same as, the input program.

the choice of program representation will render some programs far more likely
to appear than others. for example, if there's no built-in definition of a
circle, then the likelihood of evolving a program that draws a circle is low.

so how can we come up with an easily mutable representation of programs which
draw things?

- should such programs be turing-complete?
  - probably not, because of the halting problem. we want our programs to halt.

one way to think about drawing programs is as programs which mutate other
drawings. then you can start with a single line or an empty drawing, and run
the program for a while to get a new drawing.

take the basic substrate of 'drawings' to be a list of line segments. then, a
mutating program could be constructed out of primitives like:

- r: pick a random segment
- n: move to the next segment
- p: move to the previous segment
- s[0-1]: split the current segment
- dg[0-10]: displace the start point of the current segment within a gaussian
  neighborhood

so a program could be like [r s0.5 dg5]. repeat that for a while and you should
get some sort of wiggly line.

or perhaps you could take your primitives to be polygons, with actions like:

- displace all polygons by a random vector
- displace each polygon by a different random vector
- displace the points of each polygon by a different random vector
- spawn a new random polygon at a random location

