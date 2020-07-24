
:orphan:

.. _narragan_examples:

Narragansett Bay Example Problems
=================================


Try out these examples to learn the basics of modeling oil spills in
Narragansett Bay. Explore how the changing tides affect the trajectories
of oil slicks, how wind can move an oil slick in a different direction
from the currents, and how model and observation limitations can be
overcome by considering both the "Best Guess" and the "Minimum Regret"
(Uncertainty) solutions. This knowledge will help you in designing your
own GNOME model runs.

**The following conditions hold for each of the examples:**

Date: March 26, 2001.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day.

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind (constant at 0 knots), unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: 1000 barrels (bbls).

Spill: (Examples 1-3) Point source west of Prudence Island at 41° 38' N,
71° 23' W.

| (Example 4) Linear source extending from Conanicut Island, 41° 33' N,
| 71° 21' W, to Rhode Island, 41° 33' N, 71° 19' W.

Use GNOME's Standard Mode and the Narragansett Bay Location File to
answer the following questions:

Example 1.
----------

Tides are an important part of the circulation in Narragansett
Bay. In this example, you will place a spill at 41° 38' N, 71° 23' W
(west of Prudence Island) and examine the effects of tides by starting
the spill at two different times in the tidal cycle. Run the spill in
GNOME twice, once at the beginning of an ebb tide (Start Time: 0910) and
once at the beginning of a flood tide (Start Time: 1440).

**What are the differences in beach impacts? How do the two spills
differ in the amount and location of pollutant?**

    **Hints:** To easily set a spill at a particular location, simply
    click *anywhere* on the water area of the map\ **.** In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill\ **.** (This method is much
    easier than moving your mouse around the map and watching its
    location in the lower left corner of the window!)

    When you change the start time of a spill, you will want to change
    both the *spill* start time and the *model* start time\ **.** To do
    this, double-click the description of the spill ("Non-Weathering:
    1000 barrels") under **Spills** in the Summary List (the left
    section of the Map Window)\ **.** In the Spill Information window,
    change the Release Start Time to 1440\ **.** GNOME will then prompt
    you to change the model start time to match the spill start
    time\ **.** Click "Change"**.**


    **Answer:** When the spill starts with the ebb tide, after 24 hours,
    the spill ends up staying primarily in the West Passage, impacting
    the western shoreline north of Quonset Point. Since the Providence
    River has a net flow out to sea, the spill would continue to move
    back and forth with the tides, while slowly moving seaward.
    Shorelines downstream from the spill could be impacted. When the
    spill starts with the flood tide, the spill moves much further up
    the bay. Beach impacts now occur as far north as Cohimicut Point. In
    addition, the spill has reached the eastern shores of Prudence
    Island. When released on the flood tide, the spill has the potential
    to impact the shoreline on both sides of Prudence Island and all the
    shoreline downstream, including the area that the ebb tide spill
    could affect.

Example 2.
----------

Not much oil comes ashore in Example 1 because the spill is
moving and spreading only under the influence of the water. As a result,
the oil tends to flow parallel to the shoreline, without very much of it
beaching. Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
flood tide spill (Start Time: 1440) with the addition of a 10-knot (kn)
wind from the WSW.

**How does the oil's trajectory and shoreline impacts change from the
previous example?**

    **Hint:** To add wind to your model, double-click **Wind** in the
    Summary List, and then enter the wind speed and direction in the
    Constant or Variable Wind window.

    **Answer:** With the WSW wind, almost all the oil impacts shorelines
    to the east of the spill, including the National Estuarine Sanctuary
    on Prudence Island, and Popasquash Neck and Warren on the east side
    of the Providence River.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account uncertainty in
wind, horizontal mixing, and currents.

Rerun the flood tide spill with a 10-kn WSW wind. This time, run the
spill with the "Minimum Regret" solution.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the "Include Minimum Regret" box under **Model Settings** in
    the Summary List.

    **Answer:** The "Minimum Regret" solution covers a larger area than
    the "Best Guess" solution. This indicates to responders and planners
    that they must consider oil impacts to be a possibility over a
    larger area than just the "Best Guess" solution. Responders may
    choose to protect a highly valuable resource (such as endangered
    species) even though the probability of oil impacts is low.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of oil
("non-weathering") that did not change with time. Now you will run a
spill with two different types of products to see how evaporation and
dispersion change the oil impacts. Create a linear spill that extends
across the East Passage from Conanicut Island to Rhode Island, (try from
41° 33' N, 71° 21' W to 41° 33' N, 71° 19' W). Start the spill on March
26, 2001 at 1440 with no (0-kn) wind. Run one spill with 1,000 bbls of
fuel oil #6 (a North Shore crude) and then another spill with the same
amount of gasoline. You can record your results from the mass balance in
the table below.

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

    **Hints:** To remove the old point source spill, select its
    description ("Non-Weathering: 1000 barrels") under **Spills** in the
    Summary List. Under the GNOME **Item** menu, select Delete. To
    quickly set a linear spill at a particular location, click and drag
    the Spill Tool from any starting point to any end point on the
    water. In the Spill Information window that opens, you can then
    enter the exact location of the starting point and end point of the
    spill.

    To view the mass balance for each scenario, click the right-pointing
    triangle next to the spill description ("Fuel Oil #6: 1000 barrels")
    under **Spills** in the Summary List. Then click the right-pointing
    triangle next to "Splot Mass Balance" to view the mass balance for
    the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. (Your numbers may differ slightly.)


+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Gasoline    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   | 520             | 13            |
+----------------------------+-----------------+---------------+
| Beached                    | 299             | 14            |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 181             | 973           |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+
