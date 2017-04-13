
:orphan:

.. _mobile_examples:

Mobile Example Problems
=======================


Try out these examples to learn the basics of modeling oil spills in
Mobile Bay. Explore how the changing tides affect the trajectories of
oil slicks, how wind can move an oil slick in a different direction from
the currents, and how model and observation limitations can be overcome
by considering both the "Best Guess" and the "Minimum Regret"
(Uncertainty) solutions. This knowledge will help you in designing your
own GNOME model runs.

**The following conditions hold for each of the examples:**

Date: As specified in each example.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day, unless specified in a particular example.

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind (constant at 0 knots), unless specified in a particular
example.

Pollutant type: Non-weathering, unless specified in a particular
example.

River flow: Low (30 kcfs), unless specified in a particular example.

Spill size: 1000 barrels (bbls), unless specified in a particular
example.

Spill: (Example 1) A point source midway between the entrance to Mobile
Bay and the Theodore Ship Channel at 30° 22' N, 88° 1' W.

(Example 2-4) A point source on the Mobile Ship Channel near Mobile at
30° 37' N, 88° 1' W.

(Example 5) A point source at the entrance to Mobile Bay, near Mobile
Point, at 30° 13.49' N, 88° 2.01' W.

Use GNOME's Standard Mode and the Mobile Bay Location File to answer the
following questions:

Example 1.
----------

Tides are an important part of the circulation in Mobile Bay. To
test this, you will start the same spill at two points in the tidal
cycle: the beginning of a flood tide (2340 on July 1, 2000) and the
beginning of an ebb tide (1215 on July 2, 2000). Place a spill at 30°
22' N, 88° 1' W (about halfway between the Gulf entrance to Mobile Bay
and the Theodore Ship Channel) and observe the effects of tides on the
spill trajectory and beach impacts.

**What are the differences in beach impacts between the two spills?**

    **Hints:** When you change the start time of the spill, you will
    want to change both the *spill* start time and the *model* start
    time. To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window). In the Spill Information
    window, change the Release Start Date to July 2, 2000 and the
    Release Start Time to 1215. GNOME will then prompt you to change the
    model start time to match the spill start time. Click "Change".

    **Answer:** When the spill starts just before the flood tide, most
    of the beached oil is on the fill island east of Deer River Point
    and some of the beached oil is on the western end of Theodore Ship
    Channel. When the spill starts just before the ebb tide, most of the
    spill is transported out of Mobile Bay towards the Gulf, with some
    oil beaching on Dauphin and Pelican Islands.

Example 2.
----------

The circulation in Mobile Bay is significantly affected by the
flow rate of the Mobile River. In this example, you will look at a spill
closer to Mobile in the springtime and examine the effects of low and
high river runoff on the transport of the spill. Set the spill at 30°
37' N, 88° 1' W and set the run time to 0530 on March 14, 2000 (a flood
tide is just starting at this time). Run the spill two times in GNOME,
the first time with a low (30 kcfs) river flow and the second time with
a high (200 kcfs) river flow. Change the model run duration to 3 days
for this example problem.

**What are the differences in beach impacts between these two
scenarios?**

    **Hints:** First, change the spill start time and location.
    (Double-click the spill description in the Summary List, as you did
    in Example 1.) Next, change the spill duration. (Double-click
    "Duration: 24 hours" in the Summary List.)

    To change the river flow rate, double-click the name of your
    Location File, "Mobile Bay," under **Location File** in the Summary
    List. In the windows that follow, you can change any of the
    conditions that you set earlier. In this case, you only want to
    change the river flow rate. In the Setting River Flow window, change
    the flow rate to "High 200 kcfs." Click "Next" to bypass windows
    that don't need to be changed. You can then rerun the model with the
    same spill, under the same conditions, but with a new river flow
    rate.

    **Answer:** Changing the river flow rate changes the oil spill
    trajectory, leading to different beach impact areas. When the river
    flow rate is low, the spill moves further up into the bay on the
    flood tides, impacting the marsh areas surrounding Mobile, before
    slowly starting to move toward the bay's entrances. When the river
    rate is high, the spill moves toward the entrances of Mobile Bay at
    a *much* faster rate, allowing less time for beach impacts enroute.

Example 3.
----------

Wind both moves the oil along the water's surface and drives
currents. Rerun the previous spill with the high river flow rate and add
a 15-knot wind from the northwest. Run this spill scenario for 2 days.

**How does the oil's trajectory change from the previous example?**

    **Hint:** To add wind to your model, double-click **Wind** in the
    Summary List, then enter the wind speed and direction in the
    Constant or Variable Wind window.

    **Answer:** The wind dramatically changes the oil's trajectory!
    Instead of quickly moving seaward, much of the oil beaches along the
    eastern shoreline of Mobile Bay, from Seacliff to Palmetto Beach.

4. Forecasts of environmental parameters are inherently uncertain. For
   example, wind and weather forecasts can be "off" in the speed,
   direction, or timing of winds. GNOME supports a "Minimum Regret"
   solution in addition to the "Best Guess" solution that you have been
   running. The "Minimum Regret" solution takes into account our
   uncertainty in wind, horizontal mixing, and currents. Now you will
   add the "Minimum Regret" solution to see where else the spill might
   go.

Rerun the previous spill with a high river flow rate, but first make
these changes: (1) change the wind to 15 knots from the east; (2) change
the spill start time to 0100 on March 15, 2000; (3) reset the model
duration to 1 day; and (4) include the “Minimum Regret” solution.

**"Zoom in" to your spill area and briefly discuss the difference
between the "Best Guess" (black) and "Minimum Regret" (red)
trajectories. Why do you think this type of information would be
useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the “Include Minimum Regret” box under **Model Settings** in
    the Summary List.

    **Answer:** The "Minimum Regret" solution shows where else the spill
    could go if the currents, winds or other model inputs were a little
    bit different. Although our "Best Guess" solution does not show any
    oil impacts on the fill island, the "Minimum Regret" solution shows
    that there could be oil contact. Responders use this information to
    make decisions about how they will allocate response resources.
    Sometimes a highly valued environmental resource (e.g. an endangered
    species) may be important enough to protect, even if it has a low
    probability of being oiled.

Example 5.
----------

Different types of pollutants weather differently. In the
previous examples, you were using an imaginary type of pollutant that
did not change with time ("non-weathering"). Now you are going to run a
"What if?" scenario that compares the effects of different types of
pollutants.

A barge carrying 10,000 barrels of product grounds at 0530, March 14,
2000 at the entrance to Mobile Bay, near Mobile Point (30° 13.49' N, 88°
2.01' W). The Mobile River is currently running low; winds are from the
northwest at 8 knots.

Run the above scenario for a barge containing medium crude and a barge
containing gasoline. At the end of your 24-hour prediction, write down
the mass balance for each scenario in the table below.

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 10,000           | 10,000       |
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
    Crude: 10000 barrels") under **Spills** in the Summary List. Then
    click the right-pointing triangle next to "Splot Mass Balance" to
    view the mass balance for the "Best Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that the beach impacts from
    the medium crude spill are more extensive than for the gasoline
    spill. (Your numbers may differ slightly.)

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 10,000           | 10,000       |
+----------------------------+------------------+--------------+
| Floating                   | 1,250            | 70           |
+----------------------------+------------------+--------------+
| Beached                    | 6,520            | 160          |
+----------------------------+------------------+--------------+
| Evaporated and Dispersed   | 2,230            | 9,770        |
+----------------------------+------------------+--------------+
| Off map                    | 0                | 0            |
+----------------------------+------------------+--------------+
