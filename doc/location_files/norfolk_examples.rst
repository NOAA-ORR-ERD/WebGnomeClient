
:orphan:

.. _norfolk_examples:

Norfolk Example Problems
========================


Try out these examples to learn the basics of modeling oil spills in the
Norfolk/Hampton Roads area. Explore how changing tides, winds, and
pollutants can affect the trajectory of an oil slick. In addition,
you'll see how model and observation limitations can be overcome by
considering both the "Best Guess" and the "Minimum Regret" (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Wind: Constant at 0 knot, unless otherwise specified.

Spill size: As specified in each example.

Pollutant type: Non-weathering, unless specified.

Model duration: 1 day, unless specified.

Uncertainty: Not included, unless specified.

**Use GNOME's Standard Mode and the Norfolk Location File to answer the
following questions. Be sure to carefully read and enter all the
information in each problem.**

Example 1.
----------

Tides are an important part of the circulation in Norfolk. In
this example, you will examine the effects of tides by starting a
continuous spill at two different times in the tidal cycle. Run the
spill in GNOME twice, once at the beginning of an ebb tide [Start Time:
June 23, 2005 at 11:00 a.m. (1100)] and once at the beginning of a flood
tide [Start Time: June 23, 2005 at 5:00 p.m. (1700)]. The winds at the
time of the spill are 10 knots from the south. The 100-barrel spill
occurs in the turning basin at 36° 56.7' N, 76° 23.7' W and continues
for 2 days. Observe the spill effects after 12 hours.

"Zoom in" to the spill area and describe the differences in shoreline
impacts between the two spills.

    **Hints:** (1) To easily set a spill at a particular location,
    simply click anywhere on the water area of the map. In the Spill
    Information window that opens, you can then enter the exact latitude
    and longitude of the spill. (This method is much easier than moving
    your mouse around the map and watching its location in the lower
    left corner of the window!)

    (2) To set a spill that continues for a period of time, in the Spill
    Information window, click the box labeled "Different end release
    time" and enter the ending time.

    (3) When you change the start time of the spill, you will want to
    change both the spill start and end times, and the model start time.
    To do this, under **Spills** in the Summary List (the left section
    of the Map Window), double-click the description of your spill,
    "[Name you've provided]: Non-Weathering: 100 barrels". In the Spill
    Information window, change the Release Start Time to June 23 at 1700
    and the Release End time to June 25 at 1700. GNOME will then prompt
    you to change the model start time to match the spill start time.
    Click "Change". Since GNOME is set up to adjust the model start time
    to the spill start time, it is more convenient to change the spill
    start time first.

    **Note:** You will need to use the spill settings from the flood
    tide (1700) spill in a later example. Before moving on, save your
    settings as a Location File Save (LFS) by choosing Save from the
    GNOME File menu.

    **Answer:** When the spill starts with the ebb tide, in the first 12
    hours of the spill, the oil travels to the east with the tide and
    the wind. About half of the spill beaches, predominantly on
    shorelines in the Newport News and Phoebus areas. When the spill
    starts with the flood tide, less oil beaches (about a third of the
    spill); however, impacts are more severe on the western shorelines
    of Newport News. No oil reaches Phoebus.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives the currents. Rerun
the flood tide spill (June 23 at 1700) with a 10-knot wind from the
east, then with no wind.

**How do the oil's trajectory and shoreline impacts change from the
previous example?**

    **Hint:** To change the wind conditions in GNOME, double-click
    **Wind** in the Summary List, then enter the wind speed and
    direction in the Constant Wind window.

    **Answer:** Even a light wind can dramatically change the oil's
    trajectory! With the south wind, the spill moved with the tide and
    winds, beaching in the western Newport News area. With the east
    wind, the oil moves to the west, with very little oil beaching
    within the first 12 hours. Beaching occurs on Ragged Island, north
    of Batten Bay. With no wind, no beaching occurs! In the first 12
    ours, the oil remains in the turning basin.

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in their speed,
direction, or timing. GNOME supports a "Minimum Regret" solution in
addition to the "Best Guess" solution that you have been running. The
"Minimum Regret" solution takes into account our uncertainty of the
wind, horizontal mixing, and currents.

Rerun the previous scenario, increasing the wind to 15 knots from the
east. This time, run GNOME with the "Minimum Regret" solution turned on.

**"Zoom in" to the spill area and briefly review the difference between
the "Best Guess" (black) and "Minimum Regret" (red) trajectories. Why do
you think this type of information would be useful?**

    **Hints:** To include the Minimum Regret (Uncertainty) solution,
    click the box labeled "Include the Minimum Regret solution" under
    Model Settings in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where the spill
    could go if the currents, winds, or other model inputs were set
    differently. In this case, the "Minimum Regret" solution shows that
    the spill could cover a greater area, and that effects could be more
    severe and extensive on Ragged Island.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. A highly valued environmental resource (e.g. an
    endangered species) may be important enough to protect, even if it
    has a low probability of being oiled.

Example 4.
----------

In the previous examples, the pollutant that was spilled did not
change with time (it was "non-weathering"). Since different types of
pollutants will weather differently, you will run a scenario that
compares the weathering effects of different types of pollutants.

    A damaged vessel begins to leak fuel as it enters Norfolk. The
    vessel spills 30,000 gallons of product between 6:00 and 6:30 p.m.
    on June 15, 2005 as it travels from 36° 59.71' N, 76° 18.67' W to
    36° 59.07' N, 76° 20.08' W. There are no winds. For this example,
    turn off the Minimum Regret solution.

Run the above scenario for a vessel carrying **fuel oil #6** and for a
vessel carrying **diesel fuel**. At the end of your 24-hour prediction,
write down the mass balance for each product in the table below.

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
    ending time (June 15, 2005 at 1830). Then click the box labeled
    "Different end release location" and enter the ending location of
    the spill (36° 59.07' N, 76° 20.08' W).

(2) To view the mass balance for each scenario, click the right-pointing
triangle next to the spill description ("[Name you've provided]: Fuel
Oil #6: 30000 gallons") under Spills in the Summary List. Then click the
right pointing triangle next to "Splot Mass Balance" to view the mass
balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that after 24 hours, much
    more diesel (about 33% of the spill) has evaporated and dispersed
    than fuel oil #6 (about 17%). (Your numbers may differ slightly).

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   | 24840           | 19980         |
+----------------------------+-----------------+---------------+
| Beached                    | 0               | 0             |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 5168            | 10020         |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+
