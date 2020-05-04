
:orphan:

.. _glacier_examples:

Glacier Example Problems
========================


Try out these examples to learn the basics of modeling oil spills in
Glacier Bay, Alaska. In these examples, you will see how different
tides, winds, and spill products can affect the trajectories of oil
slicks. In addition, you'll see how model and observation limitations
can be overcome by considering both the "Best Guess" and the "Minimum
Regret" (Uncertainty) solutions. This knowledge will help you in
designing your own GNOME model runs.

**Use GNOME's Standard Mode and the Glacier Bay Location File to answer
the following questions. Be sure to carefully read and enter all the
information in each problem. Don't include the Uncertainty solution
unless you are asked to.**

Example 1.
----------

Tides play an important part in the circulation of the Glacier
Bay region. Spring tides have maximum tidal velocities, while neap tides
have the minimal tidal velocities. In Glacier Bay, about every other
neap tide period has a large net outflow.

In this example, you will examine the effects of tides by simulating a
spill at two different times in the tidal cycle. The spill releases 1000
barrels of pollutant over a 5-hour period. Use a non-weathering
pollutant to best visualize the trajectory. The first spill (**spill
1a**) occurs just before the ebb tide during a spring tide period (Start
Date: January 13, 2002, Start Time: 1320, Spill [Release] End Time:
1820). The second spill you will simulate (**spill 1b**) occurs during a
neap period with a large outflow (Start Date: January 21, 2002, Start
Time: 0730, Spill [Release] End Time: 1230). Set the model run duration
to 72 hours. The spill location is near the north coast of Willoughby
Island (58° 37'N, 136° 7'W).

**How do the beach impacts differ (in amounts and areas) with the
different tide conditions? How does the trajectory change? If the spill
exits the bay, note the time that it started to exit.**

    **1a. Hint:** (1) To easily set a spill at a particular location,
    simply click *anywhere* in the water area of the map. In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill. (This method is much easier
    than moving your mouse around the map and watching its location in
    the lower left corner of the window!) (2) To show the release of
    pollutant over time, in the Spill Information window, click the box
    labeled "Different end release time" and enter the ending time (in
    this case, 5 hours from the spill start time).

    **1b. Hint:** When you change the start time of the spill, you will
    want to change both the *spill* start time and the *model* start
    time. To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window). In the Spill Information

    window, change the Release Start Time to January 21, 2002 at 0730.
    GNOME will then prompt you to change the model start time to match
    the spill start time. Click "Change". Because GNOME is set up to
    adjust the *model* start time to the *spill* start time, you should
    always change the spill start time first.

    **Note:** You will need to use the spill settings from spill 1b in
    Example 2 below. Before moving on, save your settings as a Location
    File Save (LFS) by choosing **Save** from the GNOME **File** menu.

    **Answer:** Spill 1a, the spring tide spill, takes a more northerly
    trajectory, impacting the shorelines of Willoughby and Drake
    Islands, and some shoreline in the southwestern part of the bay.
    Spill 1b, the neap tide spill, moves more to the south, affecting
    Willoughby Island and extensively oiling much of Glacier Bay's
    southwestern shoreline. Although the tidal velocities are greater
    during the spring tide, the spill doesn't quite get out of the bay.
    During the neap period, the flood tide velocities are comparatively
    less, which might make you think that the spill wouldn't go as far,
    but it starts to leave the bay around noon on January 23.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
previous neap tide scenario (spill 1b), adding a 15-knot wind from the
south (**spill 2a**), then from the north (**spill 2b**).

**How do the spills' trajectories and shoreline impacts change from the
scenario without any wind? If the spill exits the bay, note the time and
compare it with the 1b scenario.**

    **Hint:** To change the wind conditions, double-click **Wind** in
    the Summary List, then change the wind speed and direction in the
    Constant or Variable Wind window.

    **Note:** Before moving on, save your settings for spill 2b as a
    Location File Save (LFS) for use in the next example.

    **Answer:** Wind dramatically changes the oil's trajectory and
    causes the floating oil to beach. In the scenario with no wind, the
    oil moved south along the coast, moving and spreading only under the
    influence of the water currents and turbulence. In the "south wind"
    scenario (2a), the spill moves further north, beaching on the
    shorelines of the bay and Muir Inlet. In the "north wind" scenario
    (2b), the spill begins to leave the bay sooner (early in the morning
    of the 23rd), and the wind causes much more of the oil to beach
    along the southwestern shore of the bay.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account uncertainty in
wind, horizontal mixing, and currents.

Rerun the "north wind" spill (2b), but this time, include the "Minimum
Regret" solution.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the "Include Minimum Regret" box under **Model Settings** in
    the Summary List.

    **Answer:** In this scenario, the "Minimum Regret" solution differs
    from the "Best Guess" solution in a number of ways: (1) it covers a
    larger area than the "Best Guess" solution in scenario 2b,
    indicating where else oiling might occur; (2) it indicates shoreline
    areas that are less likely to be, but still could be, oiled; and (3)
    it shows that the spill could leave the bay in the early morning
    hours of January 22nd, much earlier than the "Best Guess" solution.
    This indicates to responders and planners that they must consider
    oil impacts to be a possibility over a larger area, and with more
    shoreline oiling, than the "Best Guess" solution. Responders may
    also choose to protect a highly valuable resource (such as an
    endangered species), even though the probability of oil impacts is
    low.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of oil
("non-weathering") that did not change with time. Now you will run a
spill with two different types of products to see how evaporation and
dispersion change the oil impacts.

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Gasoline    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   |                 |               |
+----------------------------+-----------------+---------------+
| Beached                    |                 |               |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   |                 |               |
+----------------------------+-----------------+---------------+
| Off map                    |                 |               |
+----------------------------+-----------------+---------------+

**How does the "weathering" of the pollutants affect the spill
impacts?**

    **Hints:** To remove the old point source spill, select its
    description ("Non-Weathering: 1000 barrels") under **Spills** in the
    Summary List. Under the GNOME **Item** menu, select Delete.

    To quickly set a linear spill at a particular location, click and
    drag the Spill Tool from any starting point to any end point on the
    water. In the Spill Information window, you can then enter the exact
    location of the starting point and end point of the spill.

    To easily change the duration and wind condition, click the
    appropriate item in the Summary List.

    To view the mass balance for each scenario, click the right-pointing
    triangle next to the spill description ("Fuel Oil #6: 1000 barrels")
    under **Spills** in the Summary List. Then click the right-pointing
    triangle next to "Splot Mass Balance" to view the mass balance for
    the "Best Guess" trajectory.

    To quickly change the pollutant type, double-click the spill
    description ("Fuel Oil #6: 1000 barrels") under **Spills** in the
    Summary List. In the Spill Information window, choose "gasoline"
    from the Pollutant pull-down menu.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. (Your mass balance numbers may differ
    slightly from those shown below.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Gasoline    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   | 726             | 19            |
+----------------------------+-----------------+---------------+
| Beached                    | 98              | 2             |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 176             | 979           |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+

    After 24 hours, beach impacts from the fuel oil spill are
    considerably more extensive than for the gasoline spill. With the
    fuel oil spill, about 10% of the spill beached on nearby shorelines,
    with about 73% of the spill still in the water. With the gasoline
    spill, beaching was negligible, and only about 2% of the spill was
    still floating. Most of the gasoline (approximately 98%) had
    evaporated or dispersed.

    If you'd like, try running either of these spill scenarios over
    again with some wind, and see how the beach impacts change.
