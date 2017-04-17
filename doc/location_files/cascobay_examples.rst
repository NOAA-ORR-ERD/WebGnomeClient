
:orphan:

.. _cascobay_examples:

Cascobay Example Problems
=========================


Try out these examples to learn the basics of modeling oil spills in
Casco Bay. Explore how the changing tides affect the trajectories of oil
slicks, how wind can move an oil slick in a different direction from the
currents, and how model and observation limitations can be overcome by
considering both the “Best Guess” and the “Minimum Regret” (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Date: As specified in each example.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day, otherwise specified in a particular example.

Uncertainty: Not included, unless specified.

Wind: Constant at 0 knot, unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: 1000 barrels (bbls), unless specified.

Spill: (Examples 1-3) A point source on Jordan Reef at 43° 37’ N, 70°
11.22’ W

(Example 4) A point source in Portland Harbor at 43° 39’ N, 70° 15.2’ W.

Use GNOME's Standard Mode and the Casco Bay Location File to answer the
following questions:

Example 1.
----------

Tides are an important part of the circulation in Casco Bay. In
this example, you will examine the effects of tides by starting spills
at two different times in the tidal cycle. You will run these spill in
GNOME twice, once at the beginning of a flood tide and once at the
beginning of an ebb tide.

**(a)** First, set up GNOME for a spill that occurs on February 9, 2001
at 0545 (the beginning of a flood tide). Place a spill on Jordan Reef at
43° 37’ N, 70° 11.22’ W (southeast of the main channel entrance to
Portland Harbor).

**Observe the effects of tides on the spill trajectory and beach
impacts.**

    **Hint:** To easily set a spill at a particular location, simply
    click *anywhere* on the water area of the map\ **.** In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill\ **.** (This method is much
    easier than moving your mouse around the map and watching its
    location in the lower left corner of the window!)

    **Answer:** When the spill starts with the **flood tide**, beach
    impacts occur as far north as Portland and Great Diamond Island,
    with extensive beaching in the South Portland area and on the
    southern islands of the bay.

**Note:** You will need to use the spill settings from this example in
Example 2 below. Before moving on, save your settings as a Location File
Save (LFS) by choosing **Save** from the GNOME **File** menu.

**(b)** Next, change the spill start times to February 9, 2001 at 1200
(the beginning of an ebb tide).

**Compare the effects of the ebb tide with the previous example.**

    **Hint:** When you change the start time of a spill, you will want
    to change both the *spill* start time and the *model* start
    time\ **.** To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window)\ **.** In the Spill
    Information window, change the Release Start Time to 1200\ **.**
    GNOME will then prompt you to change the model start time to match
    the spill start time\ **.** Click "Change"**.** Because GNOME is set
    up to adjust the *model* start time to the *spill* start time, you
    should always change the spill start time first.

    **Answer:** When the spill starts on the **ebb tide**, the spill
    moves back and forth with the tides while slowly moving seaward.
    This spill affects waters further south and has fewer shoreline
    impacts overall.

**Note:** Don't forget to save your settings as a Location File Save
(LFS) by choosing **Save** from the GNOME **File** menu.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
previous ebb tide scenario (1200 on February 9, 2001), adding a 15-knot
wind from the northeast.

**How do the oil's trajectory and shoreline impacts change from the
scenario without any wind?**

    **Hint:** To change the wind conditions in GNOME, double-click
    **Wind** in the Summary List, then enter the wind speed and
    direction in the Constant Wind window.

    **Answer:** Wind dramatically changes the oil’s trajectory and
    causes the floating oil to beach. In the scenario with no wind, the
    oil moved south along the coast; however, in the "wind" scenario,
    most of the oil beaches along the northeastern shoreline of Cape
    Elizabeth.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be “off” in the speed,
direction, or timing of the winds. GNOME supports a “Minimum Regret”
solution in addition to the “Best Guess” solution that you have been
running. The “Minimum Regret” solution takes into account our
uncertainty in wind, horizontal mixing, and currents. Now you will add
the “Minimum Regret” solution to see where else the spill might go.

Rerun the flood tide spill from Example 1 (0545 on February 9, 2001),
but first make these changes: (1) change the wind to 8 knots from the
south; and (2) include the “Minimum Regret” solution.

Briefly discuss the difference between the “Best Guess” (black) and
“Minimum Regret” (red) trajectories. Why do you think this type of
information would be useful?

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the “Include Minimum Regret” box under **Model Settings** in
    the Summary List.

    **Answer:** Although our “Best Guess” solution shows very little, if
    any, oil impact on Long Island or in Portland Harbor at the mouth of
    the Fore River, the “Minimum Regret” solution shows that there could
    be oil contact in these areas. Responders use the "minimum regret"
    trajectory to make decisions about how they will allocate response
    resources. Sometimes a highly valued environmental resource (e.g. an
    endangered species) may be important enough to protect, even if it
    has a low probability of being oiled.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you are going to run a “What if?”
scenario that compares the effects of different types of pollutants.

A tanker loading product at 2:30 p.m. (1430), July 24, 2001 in Portland
Harbor spills oil into the harbor (43° 39’ N, 70° 15.2’ W). At the time
of the spill, winds were from the southwest at 4 knots.

Run the above scenario for a tanker spilling **fuel oil #6** and for a
tanker spilling **jet fuel**. At the end of your 24-hour prediction,
write down the mass balance for each scenario in the table below.

**How does the "weathering" of these pollutants affect the spill
impacts?**

    **Hint:** To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description (“Fuel Oil #6:
    1000 barrels”) under **Spills** in the Summary List. Then click the
    right-pointing triangle next to “Splot Mass Balance” to view the
    mass balance for the “Best Guess” trajectory.

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Jet Fuel    |
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

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that the beach impacts from
    the fuel oil are more extensive than for the jet fuel. Much more jet
    fuel than fuel oil has evaporated and dispersed. (Your numbers may
    differ slightly.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Jet Fuel    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   | 383             | 123           |
+----------------------------+-----------------+---------------+
| Beached                    | 486             | 152           |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 181             | 725           |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+
