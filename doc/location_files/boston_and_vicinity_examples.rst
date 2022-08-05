
.. Use somethig like this to include little images

.. .. |biohazard| image:: images/biohazard.png

.. The |biohazard| symbol must be used on containers used to dispose of medical waste.

:orphan:

.. _boston_and_vicinity_examples:

Boston Example Problems
=======================


Try out these examples to learn the basics of modeling oil spills in
Boston Harbor and vicinity. Explore how changing tides, winds, runoff
from the Merrimack River, and wastewater outflow can affect the
trajectories of oil slicks. In addition, one example demonstrates how
model and observation limitations can be overcome by including Uncertainty 
in the model solution. This knowledge will help you in designing your 
own WebGNOME model runs.

Example 1
---------

Tides are an important part of the circulation in Boston Harbor.
In this example, you will examine the effects of tides by starting a
spill at two different times in the tidal cycle,
once at the beginning of a flood tide:

Start Time: May 4, 2000 at 6:00 p.m. (1800)

and once at the beginning of an ebb tide:

Start Time: May 5, 2000 at midnight (0000)

The winds at the time of the spill are 5 knots from the SE. 
In this example, we won't simulate the effects from
the Effluent Outfall Tunnel. We will place an approximately
100-barrel spill near the Deer Island entrance to Boston Harbor.

Begin by selecting the Boston and vicinity Location File which will launch
the Wizard to guide you through setting up the scenario. Use the information 
in the following table as you advance through the Wizard.

=======================  =================================================
Start time:               As above for flood or ebb tide.
Model duration:           1 day.
Uncertainty:              Not included.
Sewage outfall effects:   Don't consider outfall.
Wind:                     5 knots from the SE.
Spill type:               Instantaneous.
Time of Release:          Same as model start time.
Amount released:          100 bbls.
Pollutant type:           Non-weathering.
Position:                 42° 20.45' N, 70° 57.44' W.
=======================  =================================================

Once you have run the model for both start times, zoom in to the spill area and 
examine the differences in beach impacts between the two spills. To more easily 
visualize the difference between the spill impacts, you could take
a screenshot of the map at the end of the first run.

How do the two spills differ in the amount and location of pollutant?


**Tip:**

1.  If you only want to change one spill parameter (like the start time 
of the spill in this example), there is no need to reload the Location File
and step through the Wizard. Instead, use the buttons on the Menu Bar to 
switch from Map View to Setup View. In Setup View there are various panels which 
allow you to edit the model setup. In the **Spill** panel, click on the edit 
(pencil) icon of the spill you created to edit the time of release. 

When you change the start time of the spill, you will likely want to
change both the spill start time (done via clicking on the edit icon on the **Spill** panel)
and the model start time (via the edit icon on the **Model Settings** panel).
If you change the spill start time first, WebGNOME will automatically
prompt you to change the model start time to match the spill start time. 
So it is a good idea to always change the spill start time first.

2.  In the Map View, you can open the **Layers** panel (top right) to select different basemaps 
for familiarizing yourself with the local geography.


Answer:
.......

When the spill starts just before the flood tide, oil
reaches the Charles River and the northern portion of Boston Harbor.
The oil beaches in these areas and is not immediately carried back
out with the ebb tide. When the spill starts at the beginning of the
ebb tide, the oil also impacts the western portion of Broad Sound.


Example 2
---------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. Rerun the
ebb tide spill (May 5 at 0000) with 5-knot wind from the NW, then with
no wind.

How do the oil's trajectory and shoreline impacts change from the previous example?


**Tip:** 

To change the wind conditions in WebGNOME, in Setup View, 
click on the edit icon in the **Wind** panel then enter the wind speed
and direction in the Constant Wind tab. Because you are entering a 
"Constant Wind" the Date & Time Field is not important as the 
same values will be applied at all model times.

For the "no wind" case, you 
either set the wind speed to 0 or delete the Wind from the list.

Answer:
.......

Even a very light wind dramatically changes the oil's
trajectory! With the SE wind in Example 1, the spill moved to the
northwestern regions of the harbor. Now, with the NW wind, the spill
moves to the southeast, oiling the northern shores of Long Island,
Houghs Neck, Peddocks, Hull, and other harbor islands. Without the
wind, the oil does not spread as far north or as far south as it
does with the wind's assistance.


Example 3
---------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. WebGNOME supports an "Uncertainty"
solution in addition to the "Best Estimate" solution that you have been
running. The "Uncertainty" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Rerun the previous scenario, increasing the wind to 10 knots from the
NW. This time, run WebGNOME with the "Uncertainty" solution turned on.

Examine the difference between the "Best Estimate" (black) and "Uncertainty" (red) trajectories.
Why do you think this type of information would be useful?

**Tip:**

To include the "Uncertainty" solution,
click the box labeled "Include uncertainy in particle transport"
in the Model Settings panel in Setup View.

Answer:
.......

The "Uncertainty" solution shows where else the spill
could go if the currents, winds, or other model inputs were a little
bit different. In this case, the "Uncertainty" solution shows
that the spill impacts could be more severe in the northern and
western regions of the harbor, with the possibility of pollutant
reaching areas near Deer Island, Spectacle Island, and Boston Inner
Harbor. To the east, the spill could also be more extensive, with
oil floating north of Little Harbor and Cohasset Harbor.

Responders use both the "Best Estimate" and "Uncertainty"
trajectories to make decisions about how they will allocate response
resources. Sometimes a highly valued environmental resource (e.g. an
endangered species) may be important enough to protect, even if it
has a low probability of being oiled.

Further Examples
----------------
The next few examples are brand new scenarios. You can choose to 
edit the various components as we did in the previous examples, or 
you may find it easier to re-load the Location file and step 
through the Wizard (just choose "Select a 
Location File" from the New pull down menu).

For these
examples, turn off the "Uncertainty" solution and don't
include effects from the Sewage Outfall (we'll learn how to turn 
this on in Example 6.) 


Example 4
---------

The Merrimack River has very high flows in the spring. This
strong pulse of fresh water into the Gulf of Maine leads to a coastal
current in Massachusetts Bay. Run two 1-day spill scenarios of 70,000 gallons
of non-weathering oil near the entrance to Gloucester Harbor at 
42° 34.73' N, 70° 38.97' W. 
Run one scenario during the spring freshet, on May 15, 2000 at 3:45 p.m. 
Run another scenario during the fall on
October 15, 2000 at 7:15 p.m. Both of these times represent the
beginning of a flood tide. In each case, there are no winds. 

How does the oil's trajectory change from the spring to the fall example?


**Tip:**

Remember to change the spill release time first rather than the model 
start time to automatically synchronize these two. 


Answer:
.......

In the spring, much of the oil is pushed to the
southwest, away from Gloucester Harbor. In the fall, however, most
of the oil ends up in the harbor.

Example 5
---------

Different types of pollutants weather differently. In the
previous examples, the pollutant that spilled did not change with time
(it was "non-weathering"). Now you are going to run a 1-day scenario that
compares the effects of different types of pollutants.

A damaged vessel begins to leak fuel as it heads into Boston Harbor
along Nantasket Roads. The vessel spills 30,000 gallons of product
between 6:00 and 7:00 p.m. on May 4, 2000 as it travels from 42° 19.16'
N, 70° 53.55' W to 42° 18.76' N, 70° 55.25' W. Winds are 5 knots from the W.

A scenario that includes weathering requires additional water property
information. In the Water panel, enter a water temperature of 55° F and 
use the defaults for the other parameters.

Run the above scenario for a barge carrying a heavy fuel oil (e.g., an 
IFO or Intermediate Fuel Oil) and for a fishing vessel carrying 
a diesel fuel. At the end of your 24-hour
prediction, write down the mass balance for each product in the table
below.

+----------------------------+-----------------+---------------+
|                            | **IFO           | **Diesel      |
|                            | (gallons)**     | (gallons)**   |
+----------------------------+-----------------+---------------+
| Released                   | 30,000          | 30,000        |
+----------------------------+-----------------+---------------+
| Floating                   |                 |               |
+----------------------------+-----------------+---------------+
| Beached                    |                 |               |
+----------------------------+-----------------+---------------+
| Evaporated                 |                 |               |
+----------------------------+-----------------+---------------+
| Dispersed                  |                 |               |
+----------------------------+-----------------+---------------+


**Tips:**

1. The spills you have set in previous examples have
been point source spills, representing catastrophic releases at a
particular time and location. The spill described in this example is
a spill from a vessel that is leaking as it is moving. To model this
"line source" spill in WebGNOME, you'll create a Continuous
Release. If you are using the Wizard, you'll simply choose this option.
If you are modifying the scenario using Setup View, start by
deleting existing spills from the previous examples.
Then click on the Create Spill Icon (plus sign) in the **Spill** panel.
Choose Continuous Release. 

The spill duration in this example is 1
hour. Use the Add Endpoint button to specify a spill along a transit.

2. Use the ADIOS Oil Database link to open the ADIOS oil database.
From the database interface you can select an oil that corresponds to an IFO
or a diesel fuel. It doesn't matter which exact oil you select, as long 
as it falls into one of these broad categories. Download the oil and
load the file into WebGNOME using the load oil drop box.

3. To view the mass balance for each scenario switch to the Fate View.

Answer:
-------

Heavier oils remain in the environment longer than
lighter, refined products. You should see that much more diesel has
evaporated and dispersed than fuel oil #6 after 24 hours in the
water. 


Example 6
---------

The new Effluent Outfall Tunnel discharges wastewater in
Massachusetts Bay, about 14 km from Boston Harbor. Numerical modeling
studies suggest that the discharge will have little or no effect on
surface currents in the region in the summer and a small effect on
surface currents in the winter. To demonstrate how this discharge may
impact spilled oil trajectories, run a 100-barrel linear spill over the
outfall site from 42° 24.97' N, 70° 47.04' W to 42° 21.96' N, 70° 46.98'
W. Leave the substance as the diesel used in the last example.
Start the spill at noon on February 15. Run WebGNOME twice for this
spill, once with the sewage outfall effects option turned on, and once
with no sewage outfall effects. 

Model Parameters:

=======================  =========================================================
Start time:               February 15, 2000 12:00.
Model duration:           1 day.
Uncertainty:              Not included.
Sewage outfall effects:   Run both cases.
Wind:                     5 knots from the SE.
Spill type:               Instantaneous.
Time of Release:          Same as model start time.
Amount released:          100 bbls.
Pollutant type:           Non-weathering.
Position:                 42° 24.97' N, 70° 47.04' W to 42° 21.96' N, 70° 46.98'W.
=======================  =========================================================

How does the wastewater outfall impact the oil's trajectory?


**Tip:**

To include the sewage outfall effects without relaunching the Wizard, you 
will change a setting in the **Current** panel. Within this panel is a list of 
surface current patterns that are described in the Location File User 
Guide. Find the pattern labeled "Sewage Outfall Current". The checkbox next
to the current name is unchecked if you chose not to consider the outfall
effects when you set up the scenario. Click the checkbox to include this 
current pattern.

Answer:
.......

Few, if any, discernible changes result from adding the
effects of the sewage outfall; however, in the scenario that
includes the sewage outfall effects, there is an area in the middle
of the trajectory that tends to remain clear of oil.
