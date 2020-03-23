
:orphan:

.. _sandiego_examples:

San Diego Bay Example Problems
==============================


Try out these examples to learn the basics of modeling oil spills in San
Diego Bay. Explore how the changing tides affect the trajectories of oil
slicks, how wind can move an oil slick in a different direction from the
currents, and how model and observation limitations can be overcome by
considering both the "Best Guess" and the "Minimum Regret" (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Date: January 19, 2000.

Model and Spill Start Time: As specified in each example.

Model duration: 1 day, unless specified in a particular example.

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind, unless specified in a particular example.

Pollutant type: Non-weathering, unless specified in a particular
example.

Spill size: 1000 barrels (bbls).

Spill: (Example 1-3) Linear source extending from 117° 13.55' W to 117°
16.5' W along 32° 39.5' N.

(Example 4) Point source in the center of San Diego Bay.

Use GNOME's Standard Mode and the San Diego Bay Location File to answer
the following questions:

Example 1.
----------

Tides are an important part of the circulation in and near San
Diego Bay. To see how the tides affect a spill's trajectory, we will
start the spill at different times in the tidal cycle. Run the spill in
GNOME twice, once before the ebb tide (Start Time = 0740) and once
before the flood tide (Start Time = 1500).

**What is the difference in beach impacts (amount and areas) between the
two spills?**

    **Hints:** To quickly set a linear spill at a particular location,
    click and drag the Spill Tool from the *any* starting point to *any*
    end point on the water. In the Spill Information window that opens,
    you can then enter the exact location of the starting point and end
    point of the spill.

    When you change the start time of the spill, you will want to change
    both the *spill* start time and the *model* start time. To do this,
    double-click the description of the spill ("Non-Weathering: 1000
    barrels") under **Spills** in the Summary List (the left section of
    the Map Window). In the Spill Information window, change the Release
    Start Time to 1500. GNOME will then prompt you to change the model
    start time to match the spill start time. Click Change.


    **Answer:** When the spill starts just before the flood tide, the
    entrance channel to San Diego Bay receives heavy beach impacts. When
    the spill starts just before the ebb tide, the oil drifts southward,
    away from the mouth of San Diego Bay. When the tide shifts back to
    flood, much less oil moves into the bay.

2. Wind both moves the oil along the water's surface and drives
   currents. Rerun the spill that started at 1500 with the addition of a
   15-knot wind from the NW.

**How does the oil's trajectory change from the previous example?**

    **Hint:** To add wind to your model, double-click **Wind** in the
    Summary List, then enter the wind speed and direction in the
    Constant or Variable Wind window.

    **Answer:** Now very little oil impacts the entrance to San Diego
    Bay, and then only on the eastern side. Most of the oil now beaches
    south of 32° 38' N.

2. Different types of oil weather differently. In the previous examples
   you were using an imaginary type of oil that did not change with
   time. Now, rerun the spill from example #2 with 1,000 bbls of medium
   crude and then with the same amount of gasoline. You can record your
   results from the mass balance in the table below.

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 1000             | 1000         |
+----------------------------+------------------+--------------+
| Floating                   |                  |              |
+----------------------------+------------------+--------------+
| Beached                    |                  |              |
+----------------------------+------------------+--------------+
| Evaporated and Dispersed   |                  |              |
+----------------------------+------------------+--------------+
| Off map                    |                  |              |
+----------------------------+------------------+--------------+

    **Answer:** Heavier oils remain in the environment longer than
    lighter refined products.\ **
    **

+----------------------------+------------------+--------------+
|                            | **Medium Crude   | **Gasoline   |
|                            | (bbls)**         | (bbls)**     |
+----------------------------+------------------+--------------+
| Released                   | 1000             | 1000         |
+----------------------------+------------------+--------------+
| Floating                   | 58               | 0            |
+----------------------------+------------------+--------------+
| Beached                    | 536              | 20           |
+----------------------------+------------------+--------------+
| Evaporated and Dispersed   | 211              | 971          |
+----------------------------+------------------+--------------+
| Off map                    | 195              | 9            |
+----------------------------+------------------+--------------+

Example 4.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Set a point source spill of non-weathering pollutant in the center of
San Diego Bay. Set a start time of 0720 and a model duration of 2 hours.
Run the model without winds and then with a 25-knot wind from each of
the cardinal directions (N, S, E and W).

**Zoom in to your spill area and briefly discuss the difference between
the "Best Guess" (black) and "Minimum Regret" (red) trajectories. Why do
you think this type of information would be useful?**

    **Hint:** To remove the old linear spill, select its description
    ("Non-Weathering: 1000 barrels") in the Summary List. Under the
    GNOME Item menu, select Delete. Then, use the Spill Tool to set a
    point source spill in the center of the bay.

    To change the model duration, double-click "Duration: 24 hours"
    under **Model Settings** in the Summary List. In the Model Settings
    window, change the Model Run Duration to 2 hours. In this window,
    you can also include the Minimum Regret (Uncertainty) solution.

    **Answer:** The "Minimum Regret" solution always covers a bigger
    area than the "Best Guess" solution. This indicates to responders
    and planners that they must consider oil impacts to be a possibility
    over a larger area than just the Best Guess of the solution.
