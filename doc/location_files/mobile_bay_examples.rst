
:orphan:

.. _mobile_bay_examples:

Mobile Example Problems
=======================


Try out these examples to learn the basics of modeling oil spills in
Mobile Bay. Explore how the changing tides affect the trajectories of
oil slicks, how wind can move an oil slick in a different direction from
the currents, and how model and observation limitations can be overcome
by considering both the "Best Estimate" and the "Uncertainty"
solutions. This knowledge will help you in designing your
own WebGNOME model runs.

Example 1
---------

Tides are an important part of the circulation in Mobile Bay. To
test this, you will start the same spill at two points in the tidal
cycle: the beginning of a flood tide (2340 on July 1, 2000) and the
beginning of an ebb tide (1215 on July 2, 2000). Place a spill at 30°
22' N, 88° 1' W (about halfway between the Gulf entrance to Mobile Bay
and the Theodore Ship Channel) and observe the effects of tides on the
spill trajectory and beach impacts.

Begin by selecting the Mobile Bay Location File which will launch
the Wizard to guide you through setting up the scenario. Use the information 
in the following table as you advance through the Wizard.

=======================  =================================================
Start time:               As above for flood or ebb tide.
Model duration:           1 day.
Uncertainty:              Not included.
River flow:               Low (30 kcfs).
Wind:                     No wind (constant at 0 knots).
Spill type:               Instantaneous.
Time of Release:          Same as model start time.
Amount released:          1000 barrels (bbls)
Pollutant type:           Non-weathering.
Position:                 30°22' N, 88° 1' W
=======================  =================================================

**Tips:**

1. If you only want to change one spill parameter (like the start time 
of the spill in this example), there is no need to reload the Location File
and step through the Wizard. Instead, use the buttons on the Menu Bar to 
switch from Map View to Setup View. In Setup View are various panels which 
allow you to edit the model setup. In the **Spill** panel, click on the edit 
(pencil) icon of the spill you created to edit the time of release. 

When you change the start time of the spill, you will likely want to
change both the spill start time and the model start time. If you change
the spill start time first, WebGNOME will automatically
prompt you to change the model start time to match the spill start time. 
So it is a good idea to always change the spill start time first.

2. To more easily visualize the difference between the spill impacts, 
consider taking a screenshot of the map at the end of the first run.

Answer:
.......

When the spill starts just before the flood tide, most
of the beached oil is on the fill island east of Deer River Point
and some of the beached oil is on the western end of Theodore Ship
Channel. When the spill starts just before the ebb tide, most of the
spill is transported out of Mobile Bay towards the Gulf, with some
oil beaching on Dauphin and Pelican Islands.

Example 2
---------

The circulation in Mobile Bay is significantly affected by the
flow rate of the Mobile River. In this example, you will look at a spill
closer to Mobile in the springtime and examine the effects of low and
high river runoff on the transport of the spill. Set the spill at 30°
37' N, 88° 1' W and set the run time to 0530 on March 14, 2000 (a flood
tide is just starting at this time). Run the spill two times in GNOME,
the first time with a low (30 kcfs) river flow and the second time with
a high (300 kcfs) river flow. Change the model run duration to 3 days
for this example problem.

What are the differences in beach impacts between these two
scenarios?

**Tips:**

1. Once again, use the **Spill** panel in Setup View to change spill
settings. 

2. The run duration can be edited in the Model Settings panel.

3. The :ref:`Mobile Bay User Guide <mobile_bay_tech>` explains how the currents 
due to the river are scaled based on the river flows into the Bay. Since this 
scaling is linear, an increase in the river flow from 30 kcfs to 300 kcfs implies 
the scaling should be increased by a factor of 10. If you click the edit icon (pencil)
next to the River Currents in the currents panel, you'll be able to edit the Reference
Point Value. If you started with the low river flow case, you'll be increasing this value
from ~0.197 to 1.97.

Answer:
.......

Changing the river flow rate changes the oil spill
trajectory, leading to different beach impact areas. When the river
flow rate is low, the spill moves further up into the bay on the
flood tides, impacting the marsh areas surrounding Mobile, before
slowly starting to move toward the bay's entrances. When the river
rate is high, the spill moves toward the entrances of Mobile Bay at
a *much* faster rate, allowing less time for beach impacts enroute.

Example 3
---------

Wind both moves the oil along the water's surface and drives
currents. Rerun the previous spill with the high river flow rate and add
a 15-knot wind from the northwest. Run this spill scenario for 2 days.

How does the oil's trajectory change from the previous example?

**Tip:**

You created a spatially constant wind at 0 knots in the initial model setup. It
shows up in a list (currently with just one entry) at the bottom of 
the Point Wind panel. You can choose to edit this wind (by clicking the pencil
icon in the list) or add a new constant wind by clicking the + icon at the 
top right of the panel.

Answer:
.......

The wind dramatically changes the oil's trajectory!
Instead of quickly moving seaward, much of the oil beaches along the
eastern shoreline of Mobile Bay, from Seacliff to Palmetto Beach.

Example 4
---------

Forecasts of environmental parameters are inherently uncertain. For
example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. GNOME supports an "Uncertainty"
solution in addition to the "Best Estimate" solution that you have been
running. The "Uncertainty" solution takes into account our
uncertainty in wind, horizontal mixing, and currents. Now you will
add the "Uncertainty" solution to see where else the spill might
go.

Rerun the previous spill with a high river flow rate, but first make
these changes: (1) change the wind to 15 knots from the east; (2) change
the spill start time to 0100 on March 15, 2000; (3) reset the model
duration to 1 day; and (4) include the "Uncertainty" solution.

"Zoom in" to your spill area and examine the difference
between the "Best Estimate" (black) and "Uncertainty" (red)
trajectories. Why do you think this type of information would be
useful?**

**Tip:**

To include the "Uncertainty" solution,
click the box labeled "Include uncertainty in particle
transport" in the Model Settings panel in Setup View.

Answer: 
.......

The "Ucnertainty" solution shows where else the spill
could go if the currents, winds or other model inputs were a little
bit different. Although our "Best Estimate" solution does not show any
oil impacts on the fill island, the "Uncertainty" solution shows
that there could be oil contact. Responders use this information to
make decisions about how they will allocate response resources.
Sometimes a highly valued environmental resource (e.g. an endangered
species) may be important enough to protect, even if it has a low
probability of being oiled.

Example 5.
----------

Different types of pollutants weather differently. In the
previous examples, you were using a "non-weathering" pollutant that
did not change with time. Now you are going to run a
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
| Evaporated                 |                  |              |
+----------------------------+------------------+--------------+
| Dispersed                  |                  |              |
+----------------------------+------------------+--------------+
| Off map                    |                  |              |
+----------------------------+------------------+--------------+

**Tips:**

1. You can make all the changes to the model setup in Setup View 
or start over with the Wizard by choosing "Select a Location File" from 
the **New** pull down menu on the menubar.

2. Use the ADIOS Oil Database link to open the ADIOS oil database.
From the database interface you can select an oil that corresponds to a medium
crude or a gasoline. It doesn't matter which exact oil you select, as long 
as it falls into one of these broad categories. Download the oil and
load the file into WebGNOME using the load oil drop box.

3. To view the mass balance for each scenario switch to the Fate View.


Answer:
-------

Heavier oils remain in the environment longer than
lighter, refined products. You can see that the beach impacts from
the medium crude spill are more extensive than for the gasoline
spill. 