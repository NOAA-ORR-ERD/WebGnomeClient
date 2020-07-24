
:orphan:

.. _stjohns_examples:

St. Johns River Example Problems
================================


Try out these examples to learn the basics of modeling oil spills in the
St. Johns River in northeast Florida. In these examples, you will see
how different tides, winds, and spill products can affect the
trajectories of oil slicks. In addition, you'll see how model and
observation limitations can be overcome by considering both the "Best
Guess" and the "Minimum Regret" (Uncertainty) solutions. This knowledge
will help you in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

Date: October 8, 2002.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day.

Uncertainty: Not included, unless specified.

Wind: None, unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: 1000 barrels.

Spill Location: As specified.

**Use GNOME's Standard Mode and the St. Johns River Location File to
answer the following questions. Be sure to carefully read and enter all
the information in each problem. Don't include the Uncertainty solution
unless you are asked to.**

Example 1.
----------

Tides play an important part in the circulation of the St. Johns
River region. In this example, you will examine the effects of tides by
simulating a spill at two different times in the tidal cycle.

Create a spill at the mouth of the river (30° 24.05'N, 81° 24.28'W) that
starts just before an ebb tide on October 8, 2002 at 1:00 p.m. (1300)
(**spill 1a**). The spill releases 1000 barrels of pollutant into the
river (use a non-weathering pollutant to best visualize the trajectory).
Using the hint provided below, run this trajectory.

Next, change the spill start time to be just before a flood tide on the
same day, at 8:00 p.m. (2000) (**spill 1b**). Use the hint provided for
spill 1b.

**How do the beach impacts differ with the different tide conditions?**

**How does the trajectory change?**

**If the spill exits the river, note the time that it started to exit.**

    **1a. Hint:** To easily set a spill at a particular location, simply
    click *anywhere* in the water area of the map. In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill. (This method is much easier
    than moving your mouse around the map and watching its location in
    the lower left corner of the window!)

    **1b. Hint:** When you change the start time of the spill, you will
    want to change both the *spill* start time and the *model* start
    time. To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window). In the Spill Information
    window, change the Release Start Time to October 8, 2002 at 2002.
    GNOME will then prompt you to change the model start time to match
    the spill start time. Click "Change". Because GNOME is set up to
    adjust the *model* start time to the *spill* start time, you should
    always change the spill start time first.

    **Note:** You will need to use the spill settings from spill 1b in
    Example 2 below. Before moving on, save your settings as a Location
    File Save (LFS) by choosing **Save** from the GNOME **File** menu.

    **Answer:** The two spills take very different trajectories! Most of
    Spill 1a (the ebb tide spill) exits the river immediately (around 2
    p.m.) and is carried north under the influence of the water currents
    and turbulence. Spill 1b (the flood tide spill) is swept upriver,
    all the way to the Drummond Point area, and extensively oils the
    shorelines of the lower reaches of the river.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
previous flood tide scenario (spill 1b), adding a 20-knot (constant or
variable) wind in each of the cardinal directions (N, S, E, W).

**How do the spills' trajectories and shoreline impacts change from the
scenario without any wind?**

    **Hint:** To change the wind conditions, double-click **Wind** in
    the Summary List, then change the wind speed and direction in the
    Constant or Variable Wind window.

    **Answer:** Some of these winds dramatically change the oil's
    trajectory and others have minimal effect. In the scenario with no
    wind, the oil moved upriver under the influence of the tides. With
    the addition of a north wind, the spill quickly beaches on the
    southern shore of the river mouth. In the "south wind" scenario, the
    spill beaches quickly on the northern shore. The east wind blows
    basically in the direction of the flood current; however, it causes
    more oil to beach, so less oil is transported upriver. In the "west
    wind" scenario, the wind almost overpowers the currents in the first
    few hours of the spill, then the tide overtakes the wind. The oil
    doesn't travel as far upriver, and at the end of 24 hours, the area
    impacted by the spill is less extensive than without any wind.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of the winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The Minimum Regret solution takes into account our uncertainty
in wind, horizontal mixing, and currents.

**(a)** Using the saved flood tide scenario from example 1 (spill 1b),
change the location of the spill to 30° 24.08'N, 81° 36.29'W. Run GNOME
first without the "Minimum Regret" (Uncertainty) solution, then run it
again with the "Minimum Regret" solution included.

Briefly discuss the difference between the "Best Guess" (black) and
"Minimum Regret" (red) trajectories. Why do you think this type of
information would be useful?

    **Hints:** (1) To change the spill location, double-click the spill
    description ("Non-Weathering: 1000 barrels") under **Spills** in the
    Summary List. In the Spill Information window, change the Latitude
    and Longitude to those of the new spill location. (2) To include the
    Minimum Regret (Uncertainty) solution, click the box labeled
    "Include the Minimum Regret solution" under **Model Settings** in
    the Summary List.

    **Note:** You will need to use the spill settings from this example
    in Example 4 below. Before moving on, save your settings as a
    Location File Save (LFS).

    **Answer:** The Minimum Regret solution shows more extensive impacts
    in all directions. Responders use the "minimum regret" trajectory to
    make decisions about how they will allocate response resources.
    Sometimes a highly valued environmental resource (e.g. an endangered
    species) may be important enough to protect, even if it has a low
    probability of being oiled.

**(b)** Next, try adding a 10-knot (or greater) wind, from any
direction, to the "Minimum Regret" scenario.

**What do you learn about the trajectory?**

    **Answer:** The wind causes much more extensive beaching of the oil.
    The "Minimum Regret" spill particles (red) show that oil contact on
    shoreline could involve a slightly larger area.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of oil
("non-weathering") that did not change with time. Now you will run a
spill with two different types of products to see how evaporation and
dispersion change the oil impacts. Using your saved file from Example 3,
first change the pollutant type to a light product, such as gasoline,
and run the scenario (without the "Minimum Regret" solution). Next,
change the pollutant type to a heavy product, such as medium crude.

**Compare the shoreline impacts and review the Mass Balance to see how
the "weathering" of the pollutants affects the spill impacts.**

+----------------------------+---------------+------------------+
|                            | **Gasoline    | **Medium Crude   |
|                            | (barrels)**   | (barrels)**      |
+----------------------------+---------------+------------------+
| Released                   | 1,000         | 1,000            |
+----------------------------+---------------+------------------+
| Floating                   |               |                  |
+----------------------------+---------------+------------------+
| Beached                    |               |                  |
+----------------------------+---------------+------------------+
| Evaporated and Dispersed   |               |                  |
+----------------------------+---------------+------------------+
| Off map                    |               |                  |
+----------------------------+---------------+------------------+

    **Hints:** (1) To quickly change the pollutant type, double-click
    the spill description ("Non-Weathering: 1000 barrels") under
    **Spills** in the Summary List. In the Spill Information window,
    choose "gasoline" from the Pollutant pull-down menu. (2) To view the
    mass balance for a scenario, click the right-pointing triangle next
    to the spill description, "Gasoline: 1000 barrels", under **Spills**
    in the Summary List. Then click the right-pointing triangle next to
    "Splot Mass Balance" to view the mass balance for the "Best Guess"
    trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. (Your mass balance numbers may differ
    slightly from those shown below.)

+----------------------------+---------------+------------------+
|                            | **Gasoline    | **Medium Crude   |
|                            | (barrels)**   | (barrels)**      |
+----------------------------+---------------+------------------+
| Released                   | 1,000         | 1,000            |
+----------------------------+---------------+------------------+
| Floating                   | 3             | 98               |
+----------------------------+---------------+------------------+
| Beached                    | 18            | 681              |
+----------------------------+---------------+------------------+
| Evaporated and Dispersed   | 979           | 221              |
+----------------------------+---------------+------------------+
| Off map                    | 0             | 0                |
+----------------------------+---------------+------------------+

    After 24 hours, beach impacts from the medium crude spill are much
    more extensive than for the gasoline spill. With the medium crude
    spill, about 68% of the spill beached on river shorelines, with
    about 10% of the spill still in the water. With the gasoline spill,
    beaching was negligible, and less than 1% of the spill was still
    floating. Most of the gasoline (about 98%) had evaporated or
    dispersed.

If you'd like, try running either of these spill scenarios over again
with some wind, and see how the beach impacts change.
