
:orphan:

.. _cre_examples:

Cre Example Problems
====================


Try out these examples to learn the basics of modeling oil spills in
Columbia River Estuary. Explore how the changing river flow alters the
estuary's tidal currents and the trajectory of an oil slick, how wind
can move an oil slick in a different direction from the currents, and
how model and observation limitations can be overcome by considering
both the "Best Guess" and the "Minimum Regret" solutions. This knowledge
will help you in designing your own GNOME scenarios.

**The following conditions hold for each of the examples:**

Date: December 6, 1998

Model and Spill Start Time: 4:00 p.m. (1600)

Run duration: 1 day

Wind: No wind, unless specified in a particular example.

Pollutant type: Non-weathering.

Use GNOME's Standard Mode and the Columbia River Estuary Location File
to answer the following questions:

Example 1.
----------

To see the effects of river flow on the tidal currents, use each
of the three given Columbia River flow rates in the Location File with a
wind speed of zero (0). Set a nonweathering spill of any amount at 46°
14.087' N, 123° 42.708' W (an interesting portion of the deeper
channel).

How long does it take for some of the leading "best guess" (black)
splots to leave the estuary?

    **Hint:** To find the time elapsed, stop the model using the Pause
    button, and then subtract the time shown on the run bar from the
    start time.

    **Answer:** The order from fastest to slowest is

+----------+------------+
| High     | 7 hours    |
+----------+------------+
| Medium   | 15 hours   |
+----------+------------+
| Low      | 18 hours   |
+----------+------------+

As you watch the slick move during each model run, the movement of the
slick up-river during the flood tide will increase as the Columbia River
flow decreases. When the river flow is low, the tides move the oil back
and forth as the oil is moving out of the estuary. Under high river flow
conditions, flood tides only slow the river flow, and there is no
current reversal or reversal in the oil's direction of travel. This is
because the river flow is greater than the tidal flood currents during a
longer time period of the tidal flood cycle.

Example 2.
----------

Rerun the fastest and slowest scenarios above with the addition
of a 10-knot wind from the north.

What happens to the spill?**

    **Answer:** Even light winds can dramatically change the trajectory
    of a spill. In both the fastest and the slowest cases, a 10-knot
    wind from the north will cause most of the oil to beach on the
    southern shore of the estuary before leaving the estuary. This
    beaching happens because the wind both moves the oil directly (by
    pushing it) and generates surface waves that move the oil.

3. GNOME chooses between two different methods for estimating total
   river flow at Astoria, depending on the value you enter for the flow
   rates at Bonneville Dam and for the Willamette River. If both your
   values are small enough, the low flow method is used; otherwise, the
   high flow method is used (check the Technical Documentation section
   of the Columbia River Estuary **User's Guide** to learn more). To see
   the difference, set a spill at 46° 12.02' N, 123° 51.65' W. Run the
   spill using 200 kcfs for the Bonneville Dam flow rate and 90 kcfs for
   the Willamette River at Portland flow. Rerun the spill with 210 kcfs
   for the Bonneville Dam flow rate and 100 kcfs for the Willamette
   River at Portland flow, respectively.

**Can you see a difference in how fast the spill moves down river?**

    **Answer:** Yes, when you increase river flow, you should be able to
    see a difference in how the oil moves, because a high river flow
    rate overwhelms the tidal currents. When the river flow is low, the
    tides move the oil back and forth as the oil is moving out of the
    estuary. Under high river flow conditions, flood tides only slow the
    river flow, and there is no current reversal or reversal in the
    oil's direction of travel. The first scenario (200 and 90 kcfs)
    leads to a total transport of 352 kcfs at Astoria. The second
    scenario (210 and 100 kcfs) leads to a substantially higher total
    transport of 506 kcfs. The large difference in oil movement that you
    saw when you ran the two scenarios shows that GNOME may not
    accurately model oil movement in the Columbia River Estuary near
    transitions between high and low flow conditions.

**4.(a)** Suppose there is a bird rookery on the southeastern portion of
Puget Island (the large island near the eastern boundary of the map);
the rookery extends from 46° 09.03'N, 123° 22.2' W to 46° 09.19' N, 123°
20.58' W. An oil spill occurs across the entire river at the right
(eastern) edge of the map from a sunken boat. The river flow is low (125
kcfs) and you are concerned about immediate (within a few hours) impacts
to the rookery.

Remember that the wind can be an important influence on oil
trajectories. Experiment by changing the wind speed and direction to
find the wind conditions that would keep all of the oil away from the
rookery for the first hour of the spill.

From what direction must the wind blow to keep the rookery oil-free for
the first hour? What is the minimum wind speed that would keep the
rookery oil-free for that time?

    **Hint:** Try zooming in to the area before you start. Select the
    Zoom In tool and use it to outline the new desired map area.

    **Hint:** To set a line spill, click and drag the Spill Tool from
    the starting point to the end point of your spill.

(b) Suppose that you were responding to this spill, and the wind
    forecast was the same as your answer to part (a). Would you
    anticipate any oil reaching the bird rookery?

    **Hint:** Try including the "Minimum Regret" solution to see if it
    makes a difference in the results.

    **Answers:**

(a) A wind of 20 knots from the north should keep all splots off the
        bird rookery area.

(b) Though the "Best Guess" splots will probably not hit the bird
        rookery, the "Minimum Regret" splots will indicate more impacts
        to the rookery, showing you how important it is to consider the
        uncertainty solution when you want to understand the full range
        of possibilities. This is because forecasts are not likely to be
        perfect, and the "Minimum Regret" splots take into account how
        forecasts most commonly err. For more information, refer to the
        Uncertainty and "Minimum Regret" GNOME Help topics.
