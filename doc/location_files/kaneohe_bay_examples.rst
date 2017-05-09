
:orphan:

.. _kaneohe_examples:

Kaneohe Example Problems
========================


Try out these examples to learn the basics of modeling oil spills in
Kaneohe Bay, Hawaii. Explore how the changing tides affect the
trajectories of oil slicks, how wind can move an oil slick in a
different direction from the currents, and how model and observation
limitations can be overcome by considering both the "Best Guess" and the
"Minimum Regret" (Uncertainty) solutions. This knowledge will help you
in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

Wind: Constant at 0 knot, unless otherwise specified in a particular
example.

Pollutant type: Non-weathering, unless specified.

Model duration: 1 day.

Uncertainty: Not included, unless specified.

Use GNOME's Standard Mode and the Kaneohe Bay Location File to answer
the following questions:

Example 1.
----------

Tides are an important part of the circulation within Kaneohe
Bay. To compare the effects of tides in this region, you will simulate a
100-barrel spill off Kualoa Point at 21° 30.7'N, 157° 49.26'W. Start the
spill at two different times in the tidal cycle, once at the beginning
of a flood tide (8:15 p.m. on Jan. 9, 2001) and once at the beginning of
an ebb tide (3:15 a.m. on Jan 10, 2001). Set a constant wind from the
east at 5 knots and observe the effects of the spills after 24 hours.

**"Zoom in" to the spill area and discuss the differences in the
trajectories and beach impacts between these two spills.**

    **Hints:** (1) To easily set a spill at a particular location,
    simply click *anywhere* in the water area of the map. In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill. (This method is much easier
    than moving your mouse around the map and watching its location in
    the lower left corner of the window!) (2) When you change the start
    time of the spill, you will want to change both the *spill* start
    time and the *model* start time. To do this, double-click the
    description of the spill ("Non-Weathering: 1000 barrels") under
    **Spills** in the Summary List (the left section of the Map Window).
    In the Spill Information window, change the Release Start Time to
    0315 on January 10, 2001. GNOME will then prompt you to change the
    model start time to match the spill start time. Click "Change".
    Because GNOME is set up to adjust the *model* start time to the
    *spill* start time, you should always change the spill start time
    first.

    **Answer:** The spill that occurred at flood tide has greater
    impacts within the bay. The spill that occurred at ebb tide, on the
    other hand, has greater impacts up the coast, with heavy beaching
    from Kualoa Point to Kaaawa Point. Knowing the time when a spill
    occurs is very important for making good spill trajectory
    predictions in areas with significant tidal currents.

Example 2.
----------

Wind both moves the oil along the water's surface and drives
currents. To see how changing winds affect an oil slick's trajectory,
run a new spill scenario with a release that occurred north of Moku Manu
at 21° 28.83'N, 157° 43.3'W. This 70,000-gallon "spill" occurred at 3:15
a.m. on Jan. 10, 2001 (the same time as the previous example). Run this
scenario once with no wind, then rerun it with a 10-knot east wind.

**How does the oil's trajectory change with the addition of wind?**

    **Hint:** (1) To change the spill conditions, double-click the
    description of the spill as you did in Example 1. In the Spill
    Information window, change the amount and location of the release.
    (2) To change the wind conditions, double-click **Wind** in the
    Summary List, then change the wind speed and direction in the
    Constant Wind window.

    **Answer:** The wind dramatically changes the oil's trajectory! With
    no wind, the oil remains out in the water; however, with the 10-knot
    wind, shoreline oiling is *very* heavy in the northern sections of
    the bay and up the coast.

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

Rerun the previous scenario (with the 10-knot east wind). This time, run
GNOME with the "Minimum Regret" solution.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the "Include Minimum Regret" box under **Model Settings** in
    the Summary List.

    **Answer:** The "Minimum Regret" solution shows where else the spill
    could go if the currents, winds or other model inputs were a little
    bit different. In this case, the "Minimum Regret" solution shows
    that the spill impacts could be much more severe, with the
    possibility of pollutant reaching as far north as Kaoio Point and as
    far south as Moku o Loe (Coconut) Island, a marine life conservation
    district. The area around Pyramid Rock on Mokapu Peninsula could
    also be impacted.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. Sometimes a highly valued environmental resource (e.g. an
    endangered species, or a sensitive habitat such as a coral reef) may
    be important enough to protect, even if it has a low probability of
    being oiled.

Example 4.
----------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you will compare the effects of different
types of pollutants.

Run two scenarios for a "spill" that occurs within Kaneohe Bay at 21°
26.38'N, 157° 47.85'W. The spill occurs at 2:00 p.m. on July 2, 2000.
Winds at the time were 0 knot. First simulate a spill of 70,000 gallons
of **fuel oil #6** (a common fuel on merchant vessels), then simulate a
spill of the same amount of **jet fuel**. You can record the mass
balance for each scenario in the table below.

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Jet Fuel    |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 70,000          | 70,000        |
+----------------------------+-----------------+---------------+
| Floating                   |                 |               |
+----------------------------+-----------------+---------------+
| Beached                    |                 |               |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   |                 |               |
+----------------------------+-----------------+---------------+
| Off map                    |                 |               |
+----------------------------+-----------------+---------------+

    **Hint:** To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description ("Fuel Oil #6:
    70000 gallons") under **Spills** in the Summary List. Then click the
    right-pointing triangle next to "Splot Mass Balance" to view the
    mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. The longer a product is in the water, the
    larger the area that could be impacted. In this example, you should
    note that much of the jet fuel (about 70%) evaporated and dispersed
    within 24 hours. In contrast, only about 15-20% of the fuel oil #6
    evaporated and dispersed. (Your numbers may differ slightly.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Jet Fuel    |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 70,000          | 70,000        |
+----------------------------+-----------------+---------------+
| Floating                   | 46,200          | 15,330        |
+----------------------------+-----------------+---------------+
| Beached                    | 11,130          | 3,920         |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 12,670          | 50,750        |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+
