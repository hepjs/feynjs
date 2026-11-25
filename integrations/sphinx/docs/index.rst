Feynman diagrams in Sphinx
==========================

Each ``feynman`` code block below is drawn by feynjs when the page loads.

.. toctree::
   :maxdepth: 1

   markdown

A process
---------

.. code-block:: feynman

   q qbar > Z > mu- mu+

A process with its decays
-------------------------

.. code-block:: feynman

   p p > t t~, (t > b w+, w+ > e+ ve), (t~ > b~ w-, w- > j j)

Every line written out
----------------------

.. code-block:: feynman

   i1 [e-] -- a -- i2 [e+]
   a [dot, label=e] -- [gamma] b [dot, label=e]
   f1 [mu-] -- b -- f2 [mu+]

Two diagrams side by side
-------------------------

.. code-block:: feynman

   --- (a) through a photon
   e- e+ > gamma > mu- mu+
   --- (b) through a Z
   e- e+ > Z > mu- mu+

As raw HTML
-----------

.. raw:: html

   <div class="feynman">
   g g > {t} > H
   </div>
