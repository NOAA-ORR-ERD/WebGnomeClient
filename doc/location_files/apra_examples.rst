
:orphan:

.. _apra_examples:

Apra Example Problems
=====================


Try out these examples to learn the basics of modeling oil spills in
Apra Harbor, Guam. Explore how the changing tides affect the
trajectories of oil slicks, how wind can move an oil slick in a
different direction from the currents, and how model and observation
limitations can be overcome by considering both the "Best Guess" and the
"Minimum Regret" (Uncertainty) solutions. This knowledge will help you
in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

Model duration: 1 day, unless specified in a particular example.

Uncertainty: Not included, unless specified.

Wind: Constant at 0 knot, unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: As specified in each example

Use GNOME's Standard Mode and the Apra Harbor Location File to answer
the following questions:

Example 1.
----------

Tides are an important part of the circulation near Apra Harbor.
To compare the effects of tides in this region, set a 40,000-gallon
spill at the entrance to Apra Harbor (13° 27.08'N, 144° 37.26'E).
Observe the effects of tides by starting the spill at two different
times in the tidal cycle. First, run the spill in GNOME at the beginning
of an ebb tide (7:15 a.m. on July 2, 2000), then run it again at the
beginning of a flood tide (2 p.m. on July 2, 2000).

**"Zoom in" to the spill area and discuss the differences in the
trajectories and beach impacts between these two spills.**

**Hints:** When you change the start time of the spill, you will
want to change both the *spill* start time and the *model* start
time. To do this, double-click the description of the spill
("Non-Weathering: 40000 gallons") under **Spills** in the Summary
List (the left section of the Map Window). In the Spill Information
window, change the Release Start Time to 1400. GNOME will then
prompt you to change the model start time to match the spill start
time. Click "Change". Because GNOME is set up to adjust the *model*
start time to the *spill* start time, you should always change the
spill start time first.

**Answer:** As currents change direction and speed during the tidal
cycle, the movement of a spill changes also. As the tide ebbs, areas
within the harbor are less likely to be affected as the oil moves
away from the harbor entrance. As the tide floods, oil is carried
into the bay. Knowing the time when a spill occurs is very important
for making good spill trajectory predictions in areas with
significant tidal currents.


Example 2.
----------

Guam's offshore circulation is heavily influenced by the North
Pacific Equatorial Current, which moves westward across the Pacific
between 8° and 15° N. The effects of this current can be seen by
simultaneously modeling two spills--one on the northwest coast of Guam
(13° 38.06'N, 144° 48.64'E) and one near the southwest coast (13°
16.42'N, 144° 36.92'E). Start both spills at 2 p.m. on July 2, 2000, set
each spill to 100 barrels, and run the simulation for 3 days.

**Where are the currents taking these spills?**

    **Hints:** (1) You can change the spill conditions you set in
    problem 1 to the conditions for the **northwest spill** in this
    problem in a few simple steps. Just double-click the description of
    the spill, then make the changes. (2) To add the **southwest spill**
    to GNOME, double-click **Spills** in the Summary List. In the Add
    New Spill window, click "Create" to add a point source spill to your
    scenario. (3) Finally, to change the model run duration to 3 days,
    double-click "Duration: 24 hours" under **Model Settings** in the
    Summary List. In the Model Settings window, change the Model Run
    Duration to 3 days.

    **Answer:** As the North Equatorial Current flows westward, it must
    flow around Guam. The current separates as it moves around the
    island, then rejoins on the west side. You can see the two spills
    slowly move closer to each other, and then move off the map as they
    approach and move through the confluence area.

3. Wind both moves the oil along the water's surface and drives
   currents. To see how winds affect an oil slick's trajectory, set a
   30,000-gallon spill in Apra Harbor (13° 27.25'N, 144° 39.71'E) at the
   same date and time (2 p.m. on July 2, 2000). Run the spill for 1 day
   with no wind, then add a 5-knot east wind to the model and rerun it.

**How does the oil's trajectory change with the addition of wind?**

    **Hints:** (1) To remove a spill from GNOME, select (single-click)
    the spill description in the Summary List. From the GNOME Item menu,
    choose "Delete." (2) To add wind to your model, double-click
    **Wind** in the Summary List, then change the wind speed and
    direction in the Constant or Variable Wind window.

    **Answer:** The wind dramatically changes the oil's trajectory. With
    no wind, the spill reaches most sections of the harbor. Areas that
    are particularly affected are the inner harbor and the region of
    coral reefs and mangroves north of Polaris Point. When the wind is
    blowing, the spill is quickly swept ashore, particularly to the
    developed (wharf) areas of the western inner harbor. In this "wind"
    scenario, little oil reaches the coral reef area between Polaris
    Point and Drydock Point.

Example 4.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Now, you will re-run the previous spill (with the 5-knot east wind).
This time, include the "Minimum Regret" solution to see where the spill
is expected to go, and where else the spill *might* go.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hints:** To include the "Minimum Regret" solution, click the box
    labeled "Include the Minimum Regret solution" under **Model
    Settings** in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where else the spill
    could go if the currents, winds, or other model inputs were a little
    bit different. This solution shows that more of the spill than we
    expected could leave the harbor and that the impacts within the
    harbor could be more severe. Oiling of Breakwater Glass, Orote
    Peninsula, the inner harbor, Polaris Point, and Drydock Point could
    be more extensive, and oil could also reach Cabras Island and
    further reaches of the reef area north of Polaris Point.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. Sometimes a highly valued environmental resource (e.g. an
    endangered species, or a sensitive habitat such as a coral reef) may
    be important enough to protect, even if it has a low probability of
    being oiled.

Example 5.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of pollutant that
did not change with time (it was "non-weathering"). Now you are going to
run two scenarios for the previous Apra Harbor spill with different
pollutant types.

Leave the spill start time at 2 p.m. on July 2, 2000, but set the wind
to zero. First run the spill with 30,000 gallons of **fuel oil #6** (a
common fuel on merchant vessels) and then with the same amount of
**diesel** (a common fuel on fishing vessels). At the end of each
24-hour prediction, record your results from the mass balance in the
table below.

**How does the pollutant type affect a spill's trajectory and potential
impacts?**


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

    **Hint:** To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description ("Fuel Oil #6:
    30000 gallons") under **Spills** in the Summary List. Then click the
    right-pointing triangle next to "Splot Mass Balance" to view the
    mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. The longer a product is in the water, the
    larger the area that could be impacted. You should note that much
    more of the diesel spill evaporated and dispersed within 24 hours.
    (Your numbers may differ slightly.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   | 14,520          | 11,580        |
+----------------------------+-----------------+---------------+
| Beached                    | 10,620          | 8,160         |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 4,860           | 10,260        |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+
