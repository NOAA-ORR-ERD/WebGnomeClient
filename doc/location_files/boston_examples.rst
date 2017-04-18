
.. Use somethig like this to include little images

.. .. |biohazard| image:: images/biohazard.png

.. The |biohazard| symbol must be used on containers used to dispose of medical waste.

:orphan:

.. _boston_examples:

Boston Example Problems
=======================


Try out these examples to learn the basics of modeling oil spills in
Boston Harbor and Vicinity. Explore how changing tides, winds, runoff
from the Merrimack River, and wastewater outflow can affect the
trajectories of oil slicks. In addition, one example demonstrates how
model and observation limitations can be overcome by considering both
the "Best Guess" and the "Minimum Regret" (Uncertainty) solutions. This
knowledge will help you in designing your own GNOME model runs.

**The following conditions hold for each of the examples:**

=======================  =======================================
Wind:                     Constant at 0 knot, unless otherwise specified in a particular example.
Sewage outfall effects:   No effects, unless specified.
Spill size:               As specified in each example.
Pollutant type:           Non-weathering, unless specified.
Model duration:           1 day.
Uncertainty:              Not included, unless specified.
=======================  =======================================


Use the Boston and Vicinity Location to answer the following questions:



Example 1.
----------

Tides are an important part of the circulation in Boston Harbor.
In this example, you will examine the effects of tides by starting a
spill at two different times in the tidal cycle. Run the spill in GNOME
twice, once at the beginning of a flood tide

Start Time: May 4, 2000 at 6:00 p.m. (1800)

and once at the beginning of an ebb tide

Start Time: May 5, 2000 at midnight (0000)

The winds at the time of the spill are
5 knots from the SE. In this example, we won't simulate the effects from
the Effluent Outfall Tunnel. Place the 100-barrel spill near the Deer
Island entrance to Boston Harbor at:

42° 20.45’ N, 70° 57.44’ W.

"Zoom in" to the spill area and describe the differences in beach
impacts between the two spills.

How do the two spills differ in the amount and location of pollutant?
.....................................................................

**Hints:**


(1) To easily set a spill at a particular location,
simply click *anywhere* on the water area of the map. In the Spill
Information window that opens, you can then enter the *exact*
latitude and longitude of the spill. (This method is much easier
than moving your mouse around the map and watching its location in
the lower left corner of the window!)

(2) When you change the start time of the spill, you will want to
change both the *spill*
start time and the *model* start time. To do this, double-click the
description of the spill ("Non-Weathering: 100 barrels") under
"Spills" in the Summary List (the left section of the Map Window).

In the Spill Information window, change the Release Start Time to
May 5 at 0000. GNOME will then prompt you to change the model start
time to match the spill start time. Click "Change". Because GNOME is
set up to adjust the *model* start time to the *spill* start time,
you should always change the spill start time first.

Answer:
.......

When the spill starts just before the flood tide, oil
reaches the Charles River and the northern portion of Boston Harbor.
The oil beaches in these areas and is not immediately carried back
out with the ebb tide. When the spill starts at the beginning of the
ebb tide, the oil also impacts the western portion of Broad Sound.


Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
ebb tide spill (May 5 at 0000) with 5-knot wind from the NW, then with
no wind.

How do the oil's trajectory and shoreline impacts change from the previous example?
...................................................................................

**Hint:** To change the wind conditions in GNOME, double-click
"Wind" in the Summary List, then enter the wind speed and
direction in the Constant Wind window.

Answer:
.......

Even a very light wind dramatically changes the oil's
trajectory! With the SE wind in Example 1, the spill moved to the
northwestern regions of the harbor. Now, with the NW wind, the spill
moves to the southeast, oiling the northern shores of Long Island,
Houghs Neck, Peddocks, Hull, and other harbor islands. Without the
wind, the oil does not spread as far north or as far south as it
does with the wind's assistance.


Example 3.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Rerun the previous scenario, increasing the wind to 10 knots from the
NW. This time, run GNOME with the “Minimum Regret” solution turned on.

Briefly discuss the difference between the "Best Guess" (black) and "Minimum Regret" (red) trajectories.
........................................................................................................

Why do you think this type of information would be useful?

**Hint:**

To include the Minimum Regret (Uncertainty) solution,
click the box labeled "Include the Minimum Regret solution" under
**Model Settings** in the Summary List.

Answer:
.......

The "Minimum Regret" solution shows where else the spill
could go if the currents, winds, or other model inputs were a little
bit different. In this case, the "Minimum Regret" solution shows
that the spill impacts could be more severe in the northern and
western regions of the harbor, with the possibility of pollutant
reaching areas near Deer Island, Spectacle Island, and Boston Inner
Harbor. To the east, the spill could also be more extensive, with
oil floating north of Little Harbor and Cohasset Harbor.

Responders use both the "Best Guess" and "Minimum Regret"
trajectories to make decisions about how they will allocate response
resources. Sometimes a highly valued environmental resource (e.g. an
endangered species) may be important enough to protect, even if it
has a low probability of being oiled.

Example 4.
----------

The Merrimack River has very high flows in the spring. This
strong pulse of fresh water into the Gulf of Maine leads to a coastal
current in Massachusetts Bay. Run two spill scenarios of 70,000 gallons
of non-weathering oil near the entrance to Gloucester Harbor at 42°
34.73’ N, 70° 38.97’ W. Run one scenario during the spring freshet, on
May 15, 2000 at 3:45 p.m. Run another scenario during the fall on
October 15, 2000 at 7:15 p.m. Both of these times represent the
beginning of a flood tide. In each case, there are no winds. For these
examples, you can turn off the "Minimum Regret" solution.

How does the oil's trajectory change from the spring to the fall example?
.........................................................................

**Hints:**

(1) To change the spill information in GNOME,
double-click the description of the spill, as you did in Example 1.
In the Spill Information window, change the amount of pollutant and
the release start time and location.

(2) If your view of the map
doesn't show the spill location, double-click the "Zoom-Out"
control, on the GNOME toolbar to fit the map to the window.

Answer:
.......

In the spring, much of the oil is pushed to the
southwest, away from Gloucester Harbor. In the fall, however, most
of the oil ends up in the harbor.

Example 5.
----------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you are going to run a scenario that
compares the effects of different types of pollutants.

A damaged vessel begins to leak fuel as it heads into Boston Harbor
along Nantasket Roads. The vessel spills 30,000 gallons of product
between 6:00 and 6:30 p.m. on May 4, 2000 as it travels from 42° 19.16’
N, 70° 53.55’ W to 42° 18.76’ N, 70° 55.25’ W. There are no winds.

Run the above scenario for a barge carrying **fuel oil #6** and for a
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


**Hints:**

1. The spills you have set in previous examples have
been point source spills, representing catastrophic releases at a
particular time and location. The spill described in this example is
a spill from a vessel that is leaking as it is moving. To model this
"line source" spill in GNOME, you'll need to enter the ending time
and location of the spill in the Spill Information window. To do
this, click the box labeled "Different end release time" and enter
the ending time (May 4, 2000 at 1830). Then click the box labeled
"Different end release location" and enter the ending location of
the spill (42° 18.76’ N, 70° 55.25’ W).

2. To view the mass balance for each scenario, click the right-pointing triangle next to
the spill description ("Fuel Oil #6: 30000 gallons") under
**Spills** in the Summary List. Then click the right-pointing
triangle next to "Splot Mass Balance" to view the mass balance for
the "Best Guess" trajectory.

Answer:
-------

Heavier oils remain in the environment longer than
lighter, refined products. You can see that much more diesel has
evaporated and dispersed than fuel oil #6 after 24 hours in the
water. (Your numbers may differ slightly.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   | 17,430          | 13,110        |
+----------------------------+-----------------+---------------+
| Beached                    | 7,200           | 6,390         |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 5,370           | 10,500        |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+

Example 6.
----------

The new Effluent Outfall Tunnel discharges wastewater in
Massachusetts Bay, about 14 km from Boston Harbor. Numerical modeling
studies suggest that the discharge will have little or no effect on
surface currents in the region in the summer and a small effect on
surface currents in the winter. To demonstrate how this discharge may
impact spilled oil trajectories, run a 10-barrel linear spill over the
outfall site from 42° 24.97’ N, 70° 47.04’ W to 42° 21.96’ N, 70° 46.98’
W. Start the spill at noon on February 15. Run GNOME twice for this
spill, once with the sewage outfall effects option turned on, and once
with no sewage outfall effects.

How does the wastewater outfall impact the oil's trajectory?
............................................................


**Hint:**

Make the necessary changes to the spill details in the
Spill Information window. Then, to include the sewage outfall
effects but keep all other Location File settings the same,
double-click "No outfall effects" under **Location File** in the
Summary List. In the windows that follow, you can change any of the
conditions that you set earlier. In this case, you only want to add
the outfall effects. Click "Next" to bypass windows that don't need
to be changed. In the Sewage Outflow window, choose "Add surface
outfall effects" from the menu.

Answer:
.......

Few, if any, discernible changes result from adding the
effects of the sewage outfall; however, in the scenario that
includes the sewage outfall effects, there is an area in the middle
of the trajectory that tends to remain clear of oil.
