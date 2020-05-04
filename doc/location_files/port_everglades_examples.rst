
:orphan:

.. _ptevr_examples:

Port Everglades Example Problems
================================


Try out these examples to learn the basics of modeling oil spills in
Port Everglades. Explore how changing tides, winds, pollutants, and
outflow can affect the trajectory of an oil slick. One example
demonstrates how model and observation limitations can be overcome by
considering both the "Best Guess" and the "Minimum Regret" (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Wind: Constant at 0 knot, unless otherwise specified.

Power Plant Discharge Effects: No effects, unless specified.

Spill size: As specified in each example.

Pollutant type: Non-weathering, unless specified.

Model duration: 1 day.

Uncertainty: Not included, unless specified.

Use GNOME's Standard Mode and the Port Everglades Location File to
answer the following questions. Be sure to carefully read and enter all
the information in each problem.

Example 1.
----------

Tides are an important part of the circulation in Port
Everglades. In this example, you will examine the effects of tides by
starting a spill at two different times in the tidal cycle. Run the
spill in GNOME twice, once at the beginning of a flood tide [Start Time:
June 1, 2004 at 5:00 p.m. (1700)] and once at the beginning of an ebb
tide [Start Time: June 1, 2004 at 11:00 p.m. (2300)]. The winds at the
time of the spill are 5 knots from the south. In this example, we won't
simulate the effects from the power plant discharge. Place a 100-barrel
spill in the south end of the turning basin at 26° 05.4' N, 80° 07.1' W.

"Zoom in" to the spill area and describe the differences in beach
impacts between the two spills. How do the two spills differ in the
amount and location of pollutant?

    **Hints:** (1) To easily set a spill at a particular location,
    simply click anywhere on the water area of the map. In the Spill
    Information window that opens, you can then enter the exact latitude
    and longitude of the spill. (This method is much easier than moving
    your mouse around the map and watching its location in the lower
    left corner of the window!)

    (2) When you change the start time of the spill, you will want to
    change both the spill start time and the model start time. To do
    this, double-click the description of the spill ("Non-Weathering:
    100 barrels") under **Spills** in the Summary List (the left section
    of the Map Window). In the Spill Information window, change the
    Release Start Time to June 1 at (2300). GNOME will then prompt you
    to change the model start time to match the spill start time. Click
    "Change". Because GNOME is set up to adjust the model start time to
    the spill start time, it is more convenient to change the spill
    start time first.

    **Note:** You will need to use the spill settings from the ebb tide
    (2300) spill in a later example. Before moving on, save your
    settings as a Location File Save (LFS) by choosing Save from the
    GNOME File menu.

    **Answer:** When the spill starts just before the flood tide, the
    oil travels north with the wind and the tide, throughout the
    northern sections of the port and the waterways feeding into it.
    Much of the oil beaches and is not immediately carried back out with
    the ebb tide. In fact, very little oil leaves the port. In
    comparison, when the spill starts at the beginning of the ebb tide,
    much of the oil travels through Bar Cut to the Atlantic Ocean. There
    is, however, considerable oiling in the Harbor Heights area, and
    lighter oiling up the Stranahan River.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
ebb tide spill (June 1 at 2300) with a 5-knot wind from the NW, then
with no wind.

How do the oil's trajectory and shoreline impacts change from the
previous example?

    **Hint:** To change the wind conditions in GNOME, double-click
    **Wind** in the Summary List, then enter the wind speed and
    direction in the Constant Wind window.

    **Answer:** Even a very light wind dramatically changes the oil's
    trajectory! With the south wind in Example 1, the spill moved to the
    northern regions of Port Everglades. Now, with the northwest wind,
    the spill moves to the southeast, particularly affecting the shores
    of the south extension of the Port Everglades turning basin, the
    Lake Mabel area, and the south shore of Bar Cut. Some oil reaches as
    far south as John U. Lloyd Beach Recreation Area. Without the wind,
    the oil impacts are much more far-reaching. Carried by the tides and
    currents, the oil travels far to the north (near Tarpon Bend) and
    far to the south (to the Dania Cutoff Canal in the Intracoastal
    Waterway, and to Hollywood Beach on the coast).

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in their speed,
direction, or timing. GNOME supports a "Minimum Regret" solution in
addition to the "Best Guess" solution that you have been running. The
"Minimum Regret" solution takes into account our uncertainty in wind,
horizontal mixing, and currents.

Rerun the previous scenario, increasing the wind to 10 knots from the
NW. This time, run GNOME with the "Minimum Regret" solution turned on.

**"Zoom in" to the spill area and briefly discuss the difference between
the "Best Guess" (black) and "Minimum Regret" (red) trajectories. Why do
you think this type of information would be useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the box labeled "Include the Minimum Regret solution" under
    **Model Settings** in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where the spill
    could go if the currents, winds, or other model inputs were set
    differently. In this case, the "Minimum Regret" solution shows that
    the spill effects could be more severe in the south extension of the
    turning basin. Similarly, in the "Minimum Regret" solution, more oil
    reaches the Intracoastal Waterway and some enters the Gulf Stream.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. A highly valued environmental resource (e.g. an
    endangered species) may be important enough to protect, even if it
    has a low probability of being oiled.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you are going to run a scenario that
compares the effects of different types of pollutants.

A damaged vessel begins to leak fuel as it enters Port Everglades. The
vessel spills 30,000 gallons of product between 6:00 and 6:30 p.m. on
June 1, 2004 as it travels from 26° 5.62' N, 80° 6.42' W to 26° 5.6' N,
80° 6.77' W. There are no winds. For this example, turn off the Minimum
Regret solution.

Run the above scenario for a vessel carrying **fuel oil #6** and for a
fishing vessel carrying **diesel fuel**. At the end of your 24-hour
prediction, write down the mass balance for each product in the table
below.

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   |                 |               |
+----------------------------+-----------------+---------------+
| Beached                    |                 |               |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   |                 |               |
+----------------------------+-----------------+---------------+
| Off map                    |                 |               |
+----------------------------+-----------------+---------------+

    **Hints:** (1) The spills you set up in previous examples have been
    point source spills, representing catastrophic releases at a
    particular time and location. The spill described in this example is
    from a vessel that is leaking as it is moving. To model this "line
    source" spill in GNOME, you will need to enter the ending time and
    location of the spill in the Spill Information window. To do this,
    click the box labeled "Different end release time" and enter the
    ending time (June 1, 2004 at 1830). Then click the box labeled
    "Different end release location" and enter the ending location of
    the spill (26° 5.6' N, 80° 6.77' W).

    (2) To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description ("Fuel Oil #6:
    30000 gallons") under **Spills** in the Summary List. Then click the
    right pointing triangle next to "Splot Mass Balance" to view the
    mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that after 24 hours, much
    more diesel has evaporated and dispersed than fuel oil #6. (Your
    numbers may differ slightly.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   | 15120           | 12180         |
+----------------------------+-----------------+---------------+
| Beached                    | 2760            | 2190          |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 4680            | 9810          |
+----------------------------+-----------------+---------------+
| Off map                    | 7440            | 5820          |
+----------------------------+-----------------+---------------+

Example 5.
----------

A Florida Power & Light Company (FPL) power plant discharges
water into a discharge canal about 4 miles south of the turning basin in
Port Everglades. To demonstrate how this discharge may impact spilled
oil trajectories, run a 10-barrel (non-weathering) line source spill
over the outfall site from 26° 4.73' N, 80° 6.92' W to 26° 4.68' N, 80°
6.92' W. Start the spill on June 1, 2004 at noon and have it run for 1
hour. Run GNOME twice for this spill, once with the discharge option
turned on, and once with power plant discharge turned off.

**How does the power plant discharge impact the oil's trajectory?**

    **Hint:** Make the necessary changes to the spill details in the
    Spill Information window. Then, to include the power plant discharge
    effects but keep all other Location File settings the same,
    double-click "No discharge effects" under **Location File** in the
    Summary List. In the windows that follow, you can change any of the
    conditions that you set earlier. In this case, you only want to add
    the discharge effects. Click "Next" to bypass windows that don't
    need to be changed. In the Power Plant Discharge window, choose "Add
    discharge effects" from the menu.

    **Answer:** Few, if any, discernible differences results from adding
    the effects of the power plant discharge.
