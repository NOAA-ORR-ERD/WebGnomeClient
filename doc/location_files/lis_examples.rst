
:orphan:

.. _lis_examples:

Central Long Island Sound Example Problems
==========================================


Try out these examples to learn the basics of modeling oil spills in
Central Long Island Sound. Explore how the changing river flow alters
the estuary's apparent tidal currents and an oil spill's trajectory, how
wind can move an oil spill in a direction different from the currents,
and how model and observation limitations can be overcome by considering
both the "Best Guess" and the "Minimum Regret" (Uncertainty) solutions.
This knowledge will help you in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

Date: December 1, 1998

Model and Spill Start Time: 5:00 a.m. (0500)

Model duration: 2 days

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind, unless specified in a particular example.

Pollutant type: Nonweathering, unless specified.

Use GNOME's Standard Mode and the Central Long Island Sound Location
File to answer the following questions:

Example 1.
----------

Tides are an important part of the circulation in Central Long
Island Sound. To see how the phase of the tide (e.g. ebb, flood, slack
before ebb, and slack before flood) affects a spill, place **four
instantaneous spills** at 41° 13.71' N, 72° 44.78' W. Each one should
start at a different time, as follows:

    **Spill a 0525** (5:25 a.m.) Maximum flood tidal current

    **Spill b 0832** (8:32 a.m.) Slack current before ebb tide

    **Spill c 1054** (10:54 a.m.) Maximum ebb tidal current

**Spill d 1509** (3:09 p.m.) Slack current before flood tide

**Note the farthest longitudes east and west that each spill reaches.**
Which spill moves the farthest east? The farthest west?

**Hint:** You may want to zoom in to the spill location before
running the model. Spills at this location move primarily east-west.
When the spills appear to stop moving and look more like "bees
swarming", pause the model. You can move (but don't click!) the
cursor to the point that appears to be the center of the spill and
read the latitude and longitude in the lower left corner of the Map
Window. Don't worry about matching the answers exactly.


**Answer:**

+-------------+-----------------------------+-----------------------------+
| **Spill**   | .. rubric:: Farthest West   | .. rubric:: Farthest East   |
|             |    :name: farthest-west     |    :name: farthest-east     |
+-------------+-----------------------------+-----------------------------+
| a           | 72° 47.71' W                | 72° 40.69' W                |
+-------------+-----------------------------+-----------------------------+
| b           | 72° 45.77' W                | 72° 38.90' W                |
+-------------+-----------------------------+-----------------------------+
| c           | 72° 47.18' W                | 72° 40.63' W                |
+-------------+-----------------------------+-----------------------------+
| d           | 72° 49.37' W                | 72° 43.97' W                |
+-------------+-----------------------------+-----------------------------+


Spill b, set on the slack current before the ebb tide, moves the
farthest east, while Spill d, set on the slack current before the
flood tide, moves the farthest west. You can now see that knowing
the timing of a spill relative to the tides (to within a few hours)
can make a big difference in spill trajectories. (Winds can make a
big difference to spill trajectories also! If the wind had been
blowing onshore when these spills occurred, very different coastal
areas would be threatened, even though the spills occurred in the
same location.)

Note that the date chosen for this example is during a spring tide
period, when the flood and ebb currents are greatest. During neap tide
conditions, the differences would not be as great.


Example 2.
----------

The effects of forecast wind and the uncertainty of forecasts are
important to trajectory modelers. Using only **Spill b** from the first
example, set a constant wind of **15 knots from the south** and include
the **"Minimum Regret" (Uncertainty) solution** in your model run.

Is your "Minimum Regret" solution very different from your "Best Guess"
solution?

    **Hint:** You can remove the spills that you don't need by selecting
    them one at a time in the left section of the Map Window, then
    selecting Delete from the Item pull-down menu. To input the constant
    wind, double-click Constant Wind in the left section to bring up the
    Constant Wind box. To include the "Minimum Regret" solution, check
    the "Include the Minimum Regret solution" box in the left section to
    turn on the "Minimum Regret" splots.

    **Answer:** The coastal areas that could be impacted by the oil
    spill in the "Minimum Regret" solution (the most conservative
    estimation) are almost three times greater than in the "Best Guess"
    solution. Responders need this information in order to balance the
    value of a resource with the possibility of it being oiled. For
    example, a nesting site for a rare bird species may need to be
    protected even if it is not in an area likely to be oiled, because
    the consequences of exposing the birds to oiling could be
    devastating.
