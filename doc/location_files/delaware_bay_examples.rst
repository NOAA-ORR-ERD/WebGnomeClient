
:orphan:

.. _delbay_examples:

Delaware Bay Example Problems
=============================


Try out these examples to learn the basics of modeling oil spills in
Delaware Bay. Explore how the changing tides affect the trajectories of
oil slicks, how wind can move an oil slick in a different direction from
the currents, and how model and observation limitations can be overcome
by considering both the "Best Guess" and the "Minimum Regret"
(Uncertainty) solutions. This knowledge will help you in designing your
own GNOME model runs.

**The following conditions hold for each of the examples:**

Date: July 3, 2000.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day, unless specified in a particular example.

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind (constant at 0 knots), unless specified in a particular
example.

Pollutant type: Non-weathering, unless specified in a particular
example.

Spill size: 1000 barrels (bbls).

Spill: (Example 1-3) Point source southeast of Port Mahon at 39° 9.73'
N, 75° 21.1' W.

(Example 4) Linear source extending from Jones River, 39° 4.19' N, 75°
23.48' W, to Egg Island Point, 39° 10.66' N, 75° 8.83' W.

Use GNOME's Standard Mode and the Delaware Bay Location File to answer
the following questions:

Example 1.
----------

Tides are an important part of the circulation in Delaware Bay.
In this example, you will place a spill at 39° 9.73' N, 75° 21.1' W
(southeast of Port Mahon) and examine the effects of tides by starting
the spill at two different times in the tidal cycle. Run the spill in
GNOME twice, once at the beginning of an ebb tide (Start Time: 1130) and
once at the beginning of a flood tide (Start Time: 1730).

**What are the differences in beach impacts? How do the two spills
differ in the amount and location of pollutant?**

    **Hints:** When you change the start time of the spill, you will
    want to change both the *spill* start time and the *model* start
    time. To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window). In the Spill Information
    window, change the Release Start Time to 1730. GNOME will then
    prompt you to change the model start time to match the spill start
    time. Click "Change".

    **Answer:** When the spill starts with the ebb tide, after 24 hours,
    the spill ends up near Milford Neck between Murderkill River and
    Mispillion River. Since the river has a net flow out to sea, the
    spill would continue to move back and forth with the tides, while
    slowly moving seaward. Shorelines downstream from the spill could be
    impacted. When the spill starts with the flood tide, the spill moves
    much further up the bay. Beach impacts now occur as far north as
    Port Mahon, and the spill has the potential to impact all the
    shoreline downstream, including the area that the ebb tide spill
    could affect.

Example 2.
----------

Not much oil comes ashore in Example 1. because the spill is
moving and spreading only under the influence of the water. As a result,
the oil tends to flow parallel to the shoreline, without very much of it
beaching. Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
flood tide spill (Start Time: 1730) for 2 days with the addition of a
15-knot (kn) wind from the WSW.

**How does the oil's trajectory and shoreline impacts change from the previous example?**

Try rerunning the spill with a light wind (5-kn) from the ENE.

**Are the shoreline impacts more extensive?**

    **Hint:** To add wind to your model, double-click **Wind** in the
    Summary List, then enter the wind speed and direction in the
    Constant or Variable Wind window.

    **Answer:** With the 15-kn WSW wind, almost all the oil impacts
    beaches to the east of the spill. Many of the wildlife conservation
    areas and refuges along the New Jersey shore have oil impacts.
    Shoreline impacts occur more quickly with the 5-kn ENE wind because
    the wind is blowing the oil toward the nearer shoreline. This time,
    the beaches that are impacted are to the west and range from Goose
    Point to Big Stone Beach.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Rerun the flood tide spill with a 15-kn east wind. (Change the model run
duration back to 1 day.) This time, run the spill with the "Minimum
Regret" solution.


**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hints:** To change the model run duration, double-click "Duration:
    48 hours" under **Model Settings** in the Summary List. In the Model
    Settings window, you can change the model run duration and add the
    "Minimum Regret" solution.

    **Answer:** The "Minimum Regret" solution covers a larger area than
    the "Best Guess" solution. This indicates to responders and planners
    that they must consider oil impacts to be a possibility over a
    larger area than just the "Best Guess" of the solution. Responders
    may choose to protect a highly valuable resource (such as endangered
    species) even though the probability of oil impacts is low.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of oil
("non-weathering") that did not change with time. Now you will run a
spill with two different types of products to see how evaporation and
dispersion change the oil impacts. Create a linear spill that extends
across Delaware Bay about halfway up the bay, (try from Jones River 39°
4.19' N, 75° 23.48' W to Egg Island Point 39° 10.66' N, 75° 8.83' W).
Start the spill on July 3, 2000 at 1730 with no (0-kn) wind. Run one
spill with 1,000 bbls of fuel oil #6 (a North Shore crude) and then
another spill with the same amount of gasoline. You can record your
results from the mass balance in the table below.

+----------------------------+-----------------+--------------+
|                            | **Fuel Oil #6   | **Gasoline   |
|                            | (bbls)**        | (bbls)**     |
+----------------------------+-----------------+--------------+
| Released                   | 1000            | 1000         |
+----------------------------+-----------------+--------------+
| Floating                   |                 |              |
+----------------------------+-----------------+--------------+
| Beached                    |                 |              |
+----------------------------+-----------------+--------------+
| Evaporated and Dispersed   |                 |              |
+----------------------------+-----------------+--------------+
| Off map                    |                 |              |
+----------------------------+-----------------+--------------+

    **Hints:** To remove the old point source spill, select its
    description ("Non-Weathering: 1000 barrels") under **Spills** in the
    Summary List. Under the GNOME Item menu, select Delete. To quickly
    set a linear spill at a particular location, click and drag the
    Spill Tool from *any* starting point to *any* end point on the
    water. In the Spill Information window that opens, you can then
    enter the exact location of the starting point and end point of the
    spill.

    To view the mass balance for each scenario, click the right-pointing
    triangle next to the spill description ("Medium Crude: 10000
    barrels") under **Spills** in the Summary List. Then click the
    right-pointing triangle next to "Splot Mass Balance" to view the
    mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter refined

    products.

+----------------------------+-----------------+--------------+
|                            | **Fuel Oil #6   | **Gasoline   |
|                            | (bbls)**        | (bbls)**     |
+----------------------------+-----------------+--------------+
| Released                   | 1000            | 1000         |
+----------------------------+-----------------+--------------+
| Floating                   | 786             | 12           |
+----------------------------+-----------------+--------------+
| Beached                    | 50              | 4            |
+----------------------------+-----------------+--------------+
| Evaporated and Dispersed   | 164             | 984          |
+----------------------------+-----------------+--------------+
| Off map                    | 0               | 0            |
+----------------------------+-----------------+--------------+
