
:orphan:

.. _stef_examples:

Stefansson Sound Example Problems
=================================

**FIXME** This may have been superceded by the north slope location

Try out these examples to learn the basics of modeling oil spills in
Stefansson Sound, a region of the Beaufort Sea located off the North
Slope of Alaska. In these examples, you will see how different winds,
pollutants, and river flows can affect the trajectories of oil slicks.
In addition, you'll see how model and observation limitations can be
overcome by considering both the "Best Guess" and the "Minimum Regret"
(Uncertainty) solutions. This knowledge will help you in designing your
own GNOME model runs.

**The following conditions hold for each of the examples:**

Wind: Constant at 0 knot, unless otherwise specified.

Spill size: As specified in each example.

Pollutant type: Non-weathering, unless specified.

Model duration: 2 days, unless specified.

Uncertainty: Not included, unless specified.

**Use GNOME's Standard Mode and the Stefansson Sound Location File to
answer the following questions. Be sure to carefully read and enter all
the information in each problem.**

Example 1.
----------

Winds can have a significant effect on a spill because they
influence the currents and move the oil on the surface of the water. To
compare the effects of different winds, simulate a spill that occurs on
July 1, 2004, at 9:00 a.m. (0900), and continues to spill for about 6
hours. You should observe the spill effects after 2 days. Your scenario
should first include 20-knot winds from the east, then 20-knot winds
from the west. The Sag, Shaviovik, Canning, and Canning-Tamariak Rivers
rivers flows should be moderately high: 50, 20, 50, and 50 cm/s,
respectively. Set a spill of 1000 gallons of medium crude between the
Maguire Islands and the mainland, at approximately 70° 12.07'N, 146°
24.16'W.

"Zoom in" to the spill area and describe how the trajectory changes with
the wind conditions? How do the beach impacts differ?

    **Hints:** To easily set a spill at a particular location, simply
    click *anywhere* on the water area of the map. In the Spill
    Information window that opens, you can then enter the exact latitude
    and longitude of the spill. (This method is much easier than moving
    your mouse around the map and watching its location in the lower
    left corner of the window!)

    To model a point source spill that continues for several hours, you
    will need to enter the ending time in the Spill Information window.
    To do this, click the box labeled "Different end release time" and
    enter the ending time (1500 on July 1, 2004).

    **Note:** You will need to use the spill settings from the east wind
    spill in later examples. Before moving on, save your settings as a
    Location File Save (LFS) by choosing Save from the GNOME File menu.

    **Answer:** When the spill occurs with the east wind, the oil
    travels west, beaching heavily on Tigvariak Island and the delta of
    the Shaviovik River; the eastern section of the Sagavanirktok (Sag)
    River delta; and Point Brower. Some oil travels as far west as the
    Endicott Satellite Drilling Island (SDI). In comparison, when the
    spill occurs with the west wind, the oil moves to the east (and off
    the map). In this scenario, the most affected shorelines are on Mary
    Sachs Island and Flaxman Island.

Example 2.
----------

Different types of pollutants weather differently. In this
example, you'll re-run the east wind spill (your Location File Save from
the previous example), and compare the spill effects of the medium crude
spill with those of a kerosene spill. Try to predict how the spills will
differ in their behavior, and at the end of your 48-hour prediction,
write in the table below the mass balance that GNOME calculates for each
product.

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

    **Hints:** To view the mass balance for each scenario, click the
    right-pointing triangle next to the spill description ("Medium
    Crude: 1000 gallons") under **Spills** in the Summary List (the left
    section of the Map Window). Then click the right pointing triangle
    next to "Splot Mass Balance" to view the mass balance for the "Best
    Guess" trajectory.

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. You can see that after 48 hours, much
    more diesel (about 85% of the spill) has evaporated and dispersed
    than medium crude (about 34%). (Your numbers may differ slightly.)
    As a result, shoreline impacts are more severe in the medium crude
    oil spill.

+----------------------------+------------------+-----------------------+
|                            | **Medium Crude   | **Kerosene/Jet Fuel   |
|                            | (gallons)**      | (gallons)**           |
+----------------------------+------------------+-----------------------+
| Released                   | 1,000            | 1,000                 |
+----------------------------+------------------+-----------------------+
| Floating                   | 62               | 9                     |
+----------------------------+------------------+-----------------------+
| Beached                    | 596              | 140                   |
+----------------------------+------------------+-----------------------+
| Evaporated and Dispersed   | 342              | 851                   |
+----------------------------+------------------+-----------------------+
| Off map                    | 0                | 0                     |
+----------------------------+------------------+-----------------------+

Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in their speed,
direction, or timing. GNOME supports a "Minimum Regret" solution in
addition to the "Best Guess" solution that you have been running. The
"Minimum Regret" solution takes into account our uncertainty in wind,
horizontal mixing, and currents.

Rerun the east wind scenario from Example 1, but this time, run GNOME
with the "Minimum Regret" solution turned on.

**"Zoom in" to the spill area and briefly discuss the difference between
the "Best Guess" (black) and "Minimum Regret" (red) trajectories. Why do
you think this type of information would be useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the box labeled "Include the Minimum Regret solution" under
    **Model Settings** in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where the spill
    could go if the currents, winds, or other model inputs were set
    differently. In this case, the "Minimum Regret" solution shows that
    the spill effects could be more severe in the regions depicted by
    the "Best Guess" scenario, and the spill could be more far-reaching,
    traveling to more areas of Mikkelson Bay, Foggy Island Bay, Point
    Brower, and the Endicott drilling complex.

Responders use both the "Best Guess" and "Minimum Regret" trajectories
to make decisions about how they will allocate response resources. A
highly valued environmental resource (e.g. an endangered species) may be
important enough to protect, even if it has a low probability of being
oiled.

Example 4.
----------

In this example, you will simulate a spill that occurs in the
delta of the Sag River on July 1, 2004 at 9:00 a.m. (0900), and
continues for about 9 hours (until 1800). You should observe the spill
effects for 1 day. Your scenario should first include a very slow (5
cm/s) current speed on the Sag River, then a faster flow (100 cm/s, or 1
m/s). In your scenario, include a series of winds that will "push" the
oil upriver. Set the 100-barrel "non-weathering" spill in the Sag delta
at approximately 70° 17.34'N, 147° 52.31'W.

"Zoom in" to the spill area and note the effects of the different river
flows on the spill trajectory and beach impacts.

    **Hints:** To make the changes for this scenario, double-click the
    name of your Location File ("Stefansson Sound") in the Summary List.
    The Location File Welcome window will appear with all the settings
    you have chosen. You only have to enter information that you are
    changing, so in the Model Settings window, change the run duration
    to 1 day. In the Setting River Flow Speeds window, change all the
    river flows to slow (5 cm/s). In the Choosing Wind Type window,
    choose wind that is variable over time.

    To enter winds that will drive the oil upriver, you could try a wind
    series such as this, or make up your own winds:

+--------------------+--------------------+---------------------+-----------------+
| .. rubric:: Date   | .. rubric:: Time   | .. rubric:: Knots   | **Direction**   |
|    :name: date     |    :name: time     |    :name: knots     |                 |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 0900               | 10                  |     N           |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1000               | 10                  |     NNE         |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1100               | 10                  |     NE          |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1200               | 10                  |     ENE         |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1300               | 10                  |     NE          |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1400               | 10                  |     NNE         |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1500               | 10                  |     N           |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1600               | 10                  |     NNW         |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1700               | 10                  |     N           |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1800               | 10                  |     NNE         |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 1900               | 10                  |     NE          |
+--------------------+--------------------+---------------------+-----------------+
| 07/01/2004         | 2000               | 10                  |     ENE         |
+--------------------+--------------------+---------------------+-----------------+

To enter the winds in the Variable Winds window, first click "Delete
All" to clear any winds from your previous work. Next, because the wind
observations are 1 hour apart, enter an auto-increment time of 1 hour.
To enter a wind, click within the blue Wind Target on the point that
represents the wind speed and direction you want to enter (for example,
the intersection of the N axis and the 10-knot circle). If necessary,
you can hold down your mouse button and drag to adjust the wind speed
and direction to the combination you want.

    Finally, to change the details of the spill, double-click the spill
    description ("Kerosene / Jet Fuels: 1000 gallons") in the Summary
    List. In the Spill Information window, make the appropriate changes
    to the spill details.

    **Answer:** When the Sag is flowing more slowly, the winds can carry
    the oil further upriver, oiling the mud flats, lagoons, and river
    islands. When the river is flowing at 1 m/s, the current carries the
    oil almost completely out of the river mouth, oiling the Endicott
    SDI to the west, and Point Brower, the area of Foggy Island, and the
    western shorelines of Foggy Island Bay to the east.
