
:orphan:

.. _tampa_examples:

Tampa Example Problems
======================


Try out these examples to learn the basics of modeling oil spills in
Tampa Bay. Explore how the changing tides affect the trajectories of oil
slicks, how wind can move an oil slick in a different direction from the
currents, and how model and observation limitations can be overcome by
considering both the "Best Guess" and the "Minimum Regret" (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Wind: Constant wind at 0 knot (kn), unless otherwise specified in a
particular example.

Spill size: 1000 gallons.

Pollutant type: Non-weathering, unless specified.

Use GNOME's Standard Mode and the Tampa Bay Location File to answer the
following questions:

Example 1.
----------

To see how changing winds affect an oil slick's trajectory, set
up the model for a spill to occur on December 15, 1999 at 2100 located
at 27° 34' N, 82° 53' W. Run the model for 6 hours and watch how the
spill moves. Next, add a 20-knot (kn) wind from the SW and rerun the
model.

**What is the difference between the oil slick trajectory with and
without the wind?**

    **Hint:** To easily set a spill at a particular location, simply
    double-click the Spill Tool on the GNOME toolbar. You can then enter
    the *exact* latitude and longitude of the spill in the Spill
    Information window. (This method is much easier than moving your
    mouse around the map and watching its location in the lower left
    corner of the window!)

    To add wind to your model, double-click **Wind** in the left section
    of the Map Window (the Summary List), then change the wind speed and
    direction in the Constant Wind window.

    **Answer:** Offshore of Tampa Bay, the north-south component of the
    wind sets up a current running north or south. The wind also moves
    the oil on the surface of the water. As a result, the slick does not
    move very much without wind, and begins to move more as the wind
    increases.

2. To see how the changing monthly (spring to neap) and daily tides can
   affect the movement of a spill, change the spill location to the
   mouth of Tampa Bay at 27° 34.81' N, 82° 40.34' W. Change the model
   duration to 24 hours to see more of the tidal transport. Start the
   spill and see how far the spill moves in 24 hours.

    **Hint:** To move a spill, simply double-click the description of
    the spill in the Spills section of the Summary List. (In this case,
    the spill description is "Non-Weathering: 1000 gallons".) In the
    Spill Information window, change the position data to that shown
    above.

    To change the model duration, double-click the item "Duration: 6
    hours" in the Summary List. In the Model Settings window, change the
    Run Duration to 24 hours.

Next, change the start date and time to December 22, 1999 at 0030 and
rerun the model for 24 hours.

    **Hint:** You will need to change the start date and time for both
    the *model* and the *spill*. You can make these changes from the
    Summary List.

**How did the spill trajectory of the second spill compare with the
first?** Note the differences in the tidal currents in the information
below:

+------------+------------+----------------------+
| **Date**   | **Time**   | **Tidal Current**    |
+------------+------------+----------------------+
| 12/15/99   | 2058       | slack before ebb     |
+------------+------------+----------------------+
| 12/15/99   | 2347       | 0.7-kn ebb           |
+------------+------------+----------------------+
| 12/16/99   | 0252       | slack before flood   |
+------------+------------+----------------------+
| 12/16/99   | 0536       | 0.6-kn flood         |
+------------+------------+----------------------+
| 12/22/99   | 0029       | slack before ebb     |
+------------+------------+----------------------+
| 12/22/99   | 0417       | 2.7-kn ebb           |
+------------+------------+----------------------+
| 12/22/99   | 0835       | slack before flood   |
+------------+------------+----------------------+
| 12/22/99   | 1104       | 2.0-kn flood         |
+------------+------------+----------------------+

    **Answer:** The first spill starts during neap tides, when the tidal
    exchange is minimal, whereas the second spill starts during spring
    tides, when the tidal currents are maximal. The stronger the tidal
    currents, the farther the oil slick will travel and spread.

2. To see how uncertainty in model input (such as the uncertainty in
   weather forecasts) is modeled in GNOME, you will create a new spill
   with same model start time as the last spill on December 22, 1999.
   Change the model duration to 12 hours, and the spill location to 27°
   46' 0.3" N and 82° 32' 22.2" W, and include the Minimum Regret
   solution. Run the three cases below and compare how the extent and
   amount of beached pollutant changes as the wind increases.

**Case 1:** 0-kn wind

**Case 2:** 5-kn wind from S

**Case 3:** 20-kn wind from S

    **Answer:** As the wind increases, larger amounts of oil beach on
    the shorelines. Although the overall length of impacted shoreline is
    less with increased wind, the shoreline that is oiled has a higher
    density of oil.

+--------------+-------------------------+--------------------------+
|              | **Wind**                | **Amount Beached (%)**   |
+--------------+-------------------------+--------------------------+
| **Case 1**   |     0-kn wind           | < 5                      |
+--------------+-------------------------+--------------------------+
| **Case 2**   |     5-kn wind from S    | 15 – 25                  |
+--------------+-------------------------+--------------------------+
| **Case 3**   |     20-kn wind from S   | > 30                     |
+--------------+-------------------------+--------------------------+

    Note that the Minimum Regret solution (red splots) indicates how the
    beach impacts and oil location could change with different inputs
    (e.g., the weather forecast was not correct). This allows people
    using GNOME to alert decision-makers of potential impacts beyond the
    "Best Guess" of the spill location.

Example 4.
----------

Rerun the last scenario (20-kn wind from S) twice more with new
spill products: **gasoline** and **medium crude oil**.

**How does the extent of the oil slick and the mass balance change with
each product?**

    **Hint:** To change the pollutant type, double-click the description
    of the spill ("Non-Weathering: 1000 gallons") in the Summary List.

    **Answer:** The extent of the oil slick does not change from one
    product to another, but the mass balance does change dramatically.
    Gasoline is a light, refined product that evaporates quickly. Medium
    crude is a much heavier product that persists much longer. Your
    answers may differ slightly from the ones shown below:

+--------------------------------+----------------+--------------------+
|                                | **Gasoline**   | **Medium Crude**   |
+--------------------------------+----------------+--------------------+
| floating (%)                   | 2              | 29                 |
+--------------------------------+----------------+--------------------+
| beached (%)                    | 7              | 58                 |
+--------------------------------+----------------+--------------------+
| evaporated and dispersed (%)   | 91             | 13                 |
+--------------------------------+----------------+--------------------+
