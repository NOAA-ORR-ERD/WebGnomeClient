
:orphan:

.. _sjuan_examples:

San Juan Example Problems
=========================

Try out these examples to learn the basics of modeling oil spills in San
Juan, Puerto Rico. Explore how the changing tides affect the
trajectories of oil slicks, how wind can move an oil slick in a
different direction from the currents, and how model and observation
limitations can be overcome by considering both the "Best Guess" and the
"Minimum Regret" (Uncertainty) solutions. This knowledge will help you
in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

Wind: Constant at 0 knot, unless otherwise specified in a particular
example.

Spill size: 1000 barrels (bbls)

Pollutant type: Non-weathering, unless specified.

Model duration: 1 day, unless specified.

Uncertainty: Not included, unless specified.

Use GNOME's Standard Mode and the San Juan Location File to answer the
following questions:

Example 1.
----------

Tides are an important part of the circulation of the San Juan
coastline; however, the periodic range of the tide in this region is
only about 1 foot. As a result, the actual fluctuations in the water
level depend largely upon the winds and other meteorological conditions.
To compare the effects of tides in this region, set a spill at two times
in the tidal cycle: the beginning of a flood tide (0745 on January 4,
2000) and the beginning of an ebb tide (2245 on January 4, 2000). Set a
spill in the center of the entrance to Bahia de San Juan (18° 28.23' N,
66° 7.78' W), run it for 10 hours, and observe the effects of the tides.

**"Zoom in" to the spill area and discuss the differences in the
trajectories and beach impacts between these two spills.**

    **Hints:** When you change the start time of the spill, you will
    want to change both the *spill* start time and the *model* start
    time. To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window). In the Spill Information
    window, change the Release Start Time to 2245. GNOME will then
    prompt you to change the model start time to match the spill start
    time. Click "Change". Because GNOME is set up to adjust the *model*
    start time to the *spill* start time, you should always change the
    spill start time first.

    **Answer:** Because the tidal differences are small, the impacts of
    these two scenarios are quite similar. You should note, however,
    that the spill that occurred at flood tide has greater impacts
    inside the bay. In the case of the second spill, the ebb tide moves
    more of the pollutant outside the harbor to areas along the coast.
    Wind would be an important consideration in these scenarios.

2.** To see how changing winds affect an oil slick's trajectory, add a
10-knot wind from the NE to the last spill (Jan. 4, 2000, 2245) and
rerun the model.

**What is the difference between the oil slick trajectory with and
without the wind?**

    **Hint:** To add wind to your model, double-click **Wind** in the
    left section of the Map Window (the Summary List), then change the
    wind speed and direction in the Constant Wind window.

    **Answer:** The wind dramatically changes the oil's trajectory! With
    no wind, much of the spill leaves the bay, with some impacts on the
    shorelines near the bay entrance. With the wind, very little oil
    leaves the bay, and shoreline oiling is *very* heavy along
    northeastern shoreline of the bay.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents. Now you run a
spill that includes the "Minimum Regret" solution to see where the spill
is expected to go, and where else the spill *might* go.

Suppose that a spill has occurred in Bahia de San Juan at 18° 27.5' N,
66° 7.5' W at 1400 on August 23, 2000. Winds at this time are constant
at 5 knots from the northeast. Include the "Minimum Regret" solution,
and run the spill for 12 hours.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hints:** To easily change the model settings, double-click **Model
    Settings** in the Summary List, enter the new model start time and
    duration, then click the box labeled "Include the Minimum Regret
    (Uncertainty) solution." To change the wind conditions, double-click
    **Wind** in the Summary List, as you did in the previous example. To
    change the spill start time and location, double-click the spill
    description, "Non-Weathering: 1000 barrels," under **Spills**.

    **Answer:** The "Minimum Regret" solution shows where else the spill
    could go if the currents, winds or other model inputs were a little
    bit different. The "Best Guess" solution shows that the spill would
    still be within Bahia de San Juan at the end of 12 hours; however,
    the "Minimum Regret" solution shows that the spill could leave the
    bay. Not only that, the impacts could be much more severe on the
    northwest coastline and entrance to the bay, with the possibility of
    pollutant reaching the eastern sections of Isla San Juan and Isla
    Grande. Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. Sometimes a highly valued environmental resource (e.g. an
    endangered species) may be important enough to protect, even if it
    has a low probability of being oiled.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you are going to run a scenario that
compares the effects of different types of pollutants.

A barge carrying 1,000 barrels of product grounds at 0930, August 18,
2000 near the eastern end of Isla San Juan (18° 28.22' N, 66° 5.1' W).
Winds at this time are from the north at 5 knots.

Run the above scenario for a barge containing medium crude and a barge
containing gasoline. At the end of your 24-hour prediction, write down
the mass balance for each scenario in the table below.

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 1,000            | 1,000        |
+----------------------------+------------------+--------------+
| Floating                   |                  |              |
+----------------------------+------------------+--------------+
| Beached                    |                  |              |
+----------------------------+------------------+--------------+
| Evaporated and Dispersed   |                  |              |
+----------------------------+------------------+--------------+
| Off map                    |                  |              |
+----------------------------+------------------+--------------+

    **Hint:** To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description ("Medium
    Crude: 1000 barrels") under **Spills** in the Summary List. Then
    click the right-pointing triangle next to "Splot Mass Balance" to
    view the mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that the beach impacts from
    the medium crude spill are much more extensive than for the gasoline
    spill. (Your numbers may differ slightly.)

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 1,000            | 1,000        |
+----------------------------+------------------+--------------+
| Floating                   | 152              | 2            |
+----------------------------+------------------+--------------+
| Beached                    | 629              | 25           |
+----------------------------+------------------+--------------+
| Evaporated and Dispersed   | 219              | 973          |
+----------------------------+------------------+--------------+
| Off map                    | 0                | 0            |
+----------------------------+------------------+--------------+
