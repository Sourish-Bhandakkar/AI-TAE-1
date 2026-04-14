% Facts 
male(john). 
male(sam). 
male(paul). 
 
female(mary). 
female(anna). 
female(lisa). 
parent(john, sam). 
parent(john, anna). 
parent(mary, sam). 
parent(mary, anna). 
parent(sam, paul). 
parent(lisa, paul). 
 
% Rules 
 
father(X, Y) :- 
parent(X, Y), 
male(X). 
 
mother(X, Y) :- 
parent(X, Y), 
female(X). 
sibling(X, Y) :- 
parent(Z, X), 
parent(Z, Y), 
X \= Y. 
grandparent(X, Y) :- 
parent(X, Z), 
parent(Z, Y). 
 
ancestor(X, Y) :- 
parent(X, Y). 
ancestor(X, Y) :- 
parent(X, Z), 
ancestor(Z, Y).
