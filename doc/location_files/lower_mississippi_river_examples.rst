
:orphan:

.. _lmiss_examples:

Lower Mississippi Example Problems
==================================


Try out these examples to learn the basics of modeling oil spills in the
lower Mississippi River. In these examples, you will see how different
river flow, winds, and pollutants, can affect the trajectories of oil
slicks. In addition, you'll see how model and observation limitations
can be overcome by considering both the "Best Guess" and the "Minimum
Regret" (Uncertainty) solutions. This knowledge will help you in
designing your own GNOME model runs.

**Use GNOME's Standard Mode and the Lower Mississippi River Location
File to answer the following questions. Be sure to carefully read and
enter all the information in each problem.**

Example 1.
----------

Let's begin by simulating a spill that occurs on May 3, 2005, at
9:00 a.m. (0900), and continues to spill for about 6 hours. You should
observe the spill effects throughout 24 hours. To compare the effects of
different river flow rates, run the model three times, setting the
Mississippi River stage height first to 5, then 10, and then 15 feet.
Set a spill of 1000 gallons of medium crude in the center of the river
channel, at approximately 29° 38.5'N, 89° 56.8'W. Name the spill
"Example 1."

"Zoom in" to the spill area and describe how the trajectory changes with
the different river flow conditions.

    **Hints:** (1) To easily set a spill at a particular location,
    simply click *anywhere* on the water area of the map. In the Spill
    Information window that opens, you can then enter the exact latitude
    and longitude of the spill. (This method is much easier than moving
    your mouse around the map and watching its location in the lower
    left corner of the window!)

    (2) To model a point source spill that continues for several hours,
    you will need to enter the ending time in the Spill Information
    window. To do this, click the box labeled "Different end release
    time" and enter the ending time (1500 on May 3, 2005 is 6 hours
    later than our spill start time of 0900).

    (3) To make the stage height changes for this scenario, double-click
    "River stage height: 5 feet" under **Location File** in the Summary
    List, to the left of the map. The Location File Welcome window will
    appear with all the settings you have chosen. You only have to enter
    information that you are changing! So, in the Setting River Flow
    window, change the stage height value to 10, then 15 for the next
    run.

    **Note:** Let's use the spill settings from your last model run
    (stage height set to 15 feet) for later examples. Before moving on,
    save your settings as a Location File Save (LFS) by choosing Save
    from the GNOME File menu.

    **Answer:** When the spill occurs with the lowest river flow (stage
    height of 5 feet), the oil travels from the release point downriver,
    past Sixtymile Pt. When the stage height is 10 feet, the oil travels
    as far as Venice, and when the stage height is 15 feet, it moves
    into the three main passes of the bird's-foot delta: Southwest Pass,
    South Pass, and Main Pass.

Example 2.
----------

Winds can have a significant effect on a spill because they
influence the currents and move the oil on the surface of the water.
Particularly in a narrow river channel, the wind has large effects on
where the oil beaches. To compare the effects of different winds, add to
your last scenario a 5-knot wind from the east, then a 5-knot wind from
the west.

**Describe how the trajectory changes with the wind conditions. How do
the shoreline impacts differ?**

    **Hint:** To change the wind conditions in GNOME, double-click
    **Wind** in the Summary List, then enter the wind speed and
    direction in the Constant Wind window.

    **Answer:** Even a very light wind dramatically changes the oil's
    trajectory! When the spill occurs with the 5-knot east wind, the oil
    travels downriver past Sixtymile Pt., beaching along the river's
    right descending bank. With the west wind, the oil moves a similar
    distance; however, in this scenario, the most affected shorelines of
    those of the left descending bank
    (http://www.uscgboating.org/safety/aton/rivers\_marking\_system.htm).

Example 3.
----------

Different types of pollutants weather differently. In this
example, you'll re-run the 15-foot stage height spill, and compare the
spill effects of the medium crude spill with those of a kerosene spill.
Try to predict how the spill will differ in its behavior, and at the end
of your 24-hour prediction, write in the table below the mass balance
that GNOME calculates for each product.

+----------------------------+------------------+-----------------------+
|                            | **Medium Crude   | **Kerosene/Jet Fuel   |
|                            | (gallons)**      | (gallons)**           |
+----------------------------+------------------+-----------------------+
| Released                   | 1,000            | 1,000                 |
+----------------------------+------------------+-----------------------+
| Floating                   |                  |                       |
+----------------------------+------------------+-----------------------+
| Beached                    |                  |                       |
+----------------------------+------------------+-----------------------+
| Evaporated and Dispersed   |                  |                       |
+----------------------------+------------------+-----------------------+
| Off map                    |                  |                       |
+----------------------------+------------------+-----------------------+

    **Hints:** (1) To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill name ("Example 1: Medium
    Crude: 1000 gallons") under **Spills** in the Summary List. Then
    click the right pointing triangle next to "Splot Mass Balance" to
    view the mass balance for the "Best Guess" trajectory.

    (2) To change the pollutant type, double-click the spill name
    ("Example 1: Medium Crude: 1000 gallons") in the Summary List. In
    the Spill Information window, change the Pollutant to "kerosene /
    jet fuels".

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that after 24 hours, about
    69% of the kerosene has evaporated and dispersed, compared to about
    21% of the medium crude. (Your numbers may differ slightly.) As a
    result, shoreline impacts are more severe in the medium crude oil
    spill.

+----------------------------+------------------+-----------------------+
|                            | **Medium Crude   | **Kerosene/Jet Fuel   |
|                            | (gallons)**      | (gallons)**           |
+----------------------------+------------------+-----------------------+
| Released                   | 1,000            | 1,000                 |
+----------------------------+------------------+-----------------------+
| Floating                   | 216              | 106                   |
+----------------------------+------------------+-----------------------+
| Beached                    | 576              | 208                   |
+----------------------------+------------------+-----------------------+
| Evaporated and Dispersed   | 208              | 686                   |
+----------------------------+------------------+-----------------------+
| Off map                    | 0                | 0                     |
+----------------------------+------------------+-----------------------+

Example 4.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in their speed,
direction, or timing. GNOME supports a "Minimum Regret" solution in
addition to the "Best Guess" solution that you have been running. The
"Minimum Regret" solution takes into account our uncertainty in wind,
horizontal mixing, and currents.

Rerun the 15-foot stage height scenario from Example 1, but first make
these changes: (1) Change the model run duration to 8 hours, and (2) run
GNOME with the "Minimum Regret" solution turned on.

**"Zoom in" to the spill area and briefly discuss the difference between
the "Best Guess" (black) and "Minimum Regret" (red) trajectories. Why do
you think this type of information would be useful?**

    **Hints:** (1) To change the duration, double-click "Duration: 24
    hours" under **Model Settings** in the Summary List. In the Model
    Settings window, change the Model Run Duration to 8 hours.

    (2) To include the Minimum Regret (Uncertainty) solution, click the
    box labeled "Include the Minimum Regret solution" under **Model
    Settings** in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where the spill
    could go if the currents, winds, or other model inputs were set
    differently. In this case, the "Minimum Regret" solution shows that
    the spill effects could be more severe in the regions depicted by
    the "Best Guess" scenario, and the effects could be more
    far-reaching, traveling around Sixtymile Pt.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources. A highly valued environmental resource (e.g., an
    endangered species) may be important enough to protect, even if it
    has a low probability of being oiled.
