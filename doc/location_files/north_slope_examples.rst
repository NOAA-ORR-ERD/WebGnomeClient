
:orphan:

.. _north_slope_examples:

#####################################
North Slope Location Example Problems
#####################################

**NOTE:** This was created by copy and pasting from the old PDF version -- it will need more editing!


Try out these examples to learn the basics of modeling oil spills in the waters off the North Slope of Alaska. In these examples, you will see how different winds, pollutants, and river flows can affect the trajectories of oil slicks. In addition, you’ll see how model and observation limitations can be overcome by considering both the “Best Estimate” and the “Minimum Regret” (Uncertainty) solutions. This knowledge will help you in designing your own GNOME model runs.

The first four examples are in Stefansson Sound, a region of the Beaufort Sea.

The following conditions hold for each of the examples:

=================   =================================================================
Wind:                Constant at 0 knots, unless otherwise specified.

Spill size:          As specified in each example.

Pollutant type:      Non-weathering, unless specified.

Model duration:      2 days, unless specified.

Uncertainty:         Not included, unless specified.

River Flow Rates:    Mackenzie, Kuparuk and Colville rates “low”, others as specified.
=================   =================================================================


Use GNOME’s North Slope Location File to answer the following questions. Be sure to carefully read and enter all the information in each problem.


Example 1.
----------

Winds can have a significant effect on a spill because they influence the currents and move the oil on the surface of the water. To compare the effects of different winds, simulate a spill that occurs on July 1, 2004, at 9:00 a.m. (0900), and continues to spill for about 6 hours. You should observe the spill effects after 2 days. Your scenario should first include 20-knot winds from the east, then 20-knot winds from the west. The Sag, Shaviovik, Canning, and Canning-Tamariak rivers’ flows should be moderately high: 50, 20, 50, and 50 cm/s, respectively. Set a spill of 1000 gallons of medium crude between the Maguire Islands and the mainland, at approximately 70° 12.07'N, 146° 24.16'W.

“Zoom in” to the spill area and describe how the trajectory changes with the wind conditions? How do the beach impacts differ?

**Hints:** To easily set a spill at a particular location, simply click anywhere on the water area of the map. In the Spill Information window that opens, you can then enter the exact latitude and longitude of the spill. (This method is much easier than moving your mouse around the map and watching its location in the lower left corner of the window!)
To model a point source spill that continues for several hours, you will need to enter the ending time in the Spill Information window. To do this, click the box labeled “Different end release time” and enter the ending time (1500 on July 1, 2004).

**Note:** You will need to use the spill settings from the east wind spill in later examples. Before moving on, save your settings as a Location File Save (LFS) by choosing Save from the GNOME File menu.

**Answer:** When the spill occurs with the east wind, the oil travels west – beaching heavily on Tigvariak Island, the delta of the Shaviovik River, and the eastern section of the Sagavanirktok (Sag) River delta. In comparison, when the spill occurs with the west wind, the oil moves to the east. In this scenario, the most affected shorelines are on Mary Sachs Island and Flaxman Island.

2. Different types of pollutants weather differently. In this example, you’ll re-run the east wind spill (your Location File Save from the previous example), and compare the spill effects of the medium crude spill with those of a kerosene spill. Try to predict how the spills will differ in their behavior, and at the end of your 48-hour prediction, write in the table below the mass balance that GNOME calculates for each product.

=============================  ==============================  ===================
Medium Crude (gallons)          Kerosene/Jet Fuel (gallons)
=============================  ==============================  ===================
   Released                             1,000                       1,000
   Floating
   Beached
   Evaporated and Dispersed
   Off map
=============================  ==============================  ===================


**Hints:** To view the mass balance for each scenario, click the right-pointing triangle next to the spill description (“Medium Crude: 1000 gallons”) under Spills in the Summary List (the left section of the Map Window). Then click the right pointing triangle next to “Splot Mass Balance” to view the mass balance for the “Best Estimate” trajectory.

**Answer:** Heavier oils remain in the environment longer than lighter, refined products. You can see that after 48 hours, much more kerosene (about 86% of the spill) has evaporated and dispersed than medium crude (about 33%). (Your numbers may differ slightly.) As a result, shoreline impacts are more severe in the medium crude oil spill.


=============================  ==============================  ===================
Medium Crude (gallons)          Kerosene/Jet Fuel (gallons)
=============================  ==============================  ===================
   Released                        1,000                         1,000
   Floating                            7                             1
   Beached                           661                           139
   Evaporated and Dispersed          332                           860
   Off map                             0                             0
=============================  ==============================  ===================


3. Forecasts of environmental parameters are inherently uncertain. For example, wind and weather forecasts can be “off” in their speed, direction, or timing. GNOME supports a “Minimum Regret” solution in addition to the “Best Estimate” solution that you have been running. The “Minimum Regret” solution takes into account our uncertainty in wind, horizontal mixing, and currents.

Rerun the east wind scenario from Example 1, but this time, run GNOME with the “Minimum Regret” solution turned on.

“Zoom in” to the spill area and briefly discuss the difference between the “Best Estimate” (black) and “Minimum Regret” (red) trajectories. Why do you think this type of information would be useful?

**Hint:** To include the Minimum Regret (Uncertainty) solution, click the box labeled “Include the Minimum Regret solution” under Model Settings in the Summary List.

**Answer:**  The “Minimum Regret” solution shows where the spill could go if the currents, winds, or other model inputs were set differently. In this case, the “Minimum Regret” solution shows that the spill effects could be more severe in the regions depicted by the “Best Estimate” scenario, and the spill could be more far- reaching, traveling to more areas of Mikkelson Bay, Foggy Island Bay, and Point Brower.

Responders use both the “Best Estimate” and “Minimum Regret” trajectories to make decisions about how they will allocate response resources. A highly valued environmental resource (e.g. an endangered species) may be important enough to protect, even if it has a low probability of being oiled.

4. In this example, you will simulate a spill that occurs in the delta of the Sag River on July 1, 2004 at 9:00 a.m. (0900), and continues for about 9 hours (until 1800). You should observe the spill effects for 1 day. Your scenario should first include a very slow (5 cm/s) current speed on the Sag River, then a faster flow (100 cm/s, or 1 m/s). In your scenario, include a series of winds that will “push” the oil upriver. Set the 100-barrel “non-weathering” spill in the Sag delta at approximately 70° 19.03'N, 147° 55.34'W.

“Zoom in” to the spill area and note the effects of the different river flows on the spill trajectory and beach impacts.

**Hints:** To make the changes for this scenario, double-click the name of your Location File (“North Slope”) in the Summary List. The Location File Welcome window will appear with all the settings you have chosen. You only have to enter information that you are changing, so in the Model Settings window, change the run duration to 1 day. In the Setting River Flow Speeds window, change all the river flows to slow (5 cm/s). In the Choosing Wind Type window, choose wind that is variable over time.

To enter winds that will drive the oil upriver, you could try a wind series such as this, or make up your own winds:

=============  ========  =========  ==========
Date            Time      Knots      Direction
=============  ========  =========  ==========
07/01/2004      0900      10         N
07/01/2004      1000      10         NNE
07/01/2004      1100      10         NE
07/01/2004      1200      10         ENE
07/01/2004      1300      10         NE
07/01/2004      1400      10         NNE
07/01/2004      1500      10         N
07/01/2004      1600      10         NNW
07/01/2004      1700      10         N
07/01/2004      1800      10         NNE
07/01/2004      1900      10         NE
07/01/2004      2000      10         ENE
=============  ========  =========  ==========


To enter the winds in the Variable Winds window, first click “Delete All” to clear any winds from your previous work. Next, because the wind observations are 1 hour apart, enter an auto-increment time of 1 hour. To enter a wind, click within the blue Wind Target on the point that represents the wind speed and direction you want to enter (for example, the intersection of the N axis and the 10-knot circle). If necessary, you can hold down your mouse button and drag to adjust the wind speed and direction to the combination you want.

Finally, to change the details of the spill, double-click the spill description (“Kerosene / Jet Fuels: 1000 gallons”) in the Summary List. In the Spill Information window, make the appropriate changes to the spill details.

**Answer:**  When the Sag is flowing more slowly, the winds can carry the oil further upriver, oiling the mud flats, lagoons, Howe Island, and other river islands. When the river is flowing at 1 m/s, the current carries the oil almost completely out of the river mouth, oiling the Endicott drilling island.

The following five examples model oil spills in Harrison and Gwydyr Bays, Alaska. The coastal circulation of the North Slope is primarily controlled by winds, both within the lagoon system and slightly farther offshore.

The following conditions hold for each of the examples:

===========================  ========================
Date:                        August 17, 2001.
Model and Spill Start Time:  1200.
Model duration:              1 day, unless specified in a particular example.
Uncertainty:                 Not included, unless specified.
River Flow Rates:            All rates low or 5 cm/s, unless otherwise specified.
Wind:                        As specified in each example.
Pollutant type:              As specified.
Spill size:                  1000 gallons, unless specified.
Spill Location:              As specified.
===========================  ========================


Use GNOME’s North Slope Location File to answer the following questions:

5. Winds play an important part in the circulation of the coastal North Slope. To compare the effects of different winds, you will simulate a spill that occurs on August 17, 2001, at approximately 1200. Your scenario should include wind of 6 meters/sec first from 75 degrees true, then wind of the same speed from the NW. Set your spill volume at 1000 gallons of medium crude. The spill location is north of the Return Islands (70° 27'N, 148° 41'W).

How do the beach impacts differ in with the different wind conditions? How does the trajectory change?

**Hints:** To easily set a spill at a particular location, simply click anywhere in the water area of the map. In the Spill Information window that opens, you can then enter the exact latitude and longitude of the spill. (This method is much easier than moving your mouse around the map and watching its location in the lower left corner of the window!)

To change the wind conditions, double-click Wind in the Summary List, then change the wind speed and direction in the Constant or Variable Wind window.

Note: You will need to use the spill settings from this example in Example 6. below. Before moving on, save your settings as a Location File Save (LFS) by choosing Save from the GNOME File menu.
North Slope

**Answer:**  The wind causes the oil in each scenario to beach quickly and extensively. With the wind from 75 degrees true, the oil travels to the southwest, impacting the Return Islands and shorelines of Simpson Lagoon. With the NW wind, the oil travels southeast into Prudhoe Bay, with oiling occurring on Stump Island and the Endicott drilling island.

6. Different types of pollutants weather differently. Now you will compare the effects of different types of pollutants. Using your saved files, re-run the scenarios from Example 5, but this time change the pollutant type to a light product, such as gasoline.
How does the “weathering” of the pollutants affect the spill impacts?

**Hints:** To quickly change the pollutant type, double-click the spill description (“Medium Crude: 1000 gallons”) under Spills in the Summary List (the left section of the Map Window). In the Spill Information window, choose “gasoline” from the Pollutant pull-down menu.

**Answer:**  Heavier oils remain in the environment longer than lighter, refined products. Beach impacts from the crude oil spill are much more extensive than for the gasoline spill in both wind scenarios. (To view the mass balance for a scenario, click the right-pointing triangle next to the spill description, “Gasoline: 1000 gallons”, under Spills in the Summary List. Then click the right-pointing triangle next to “Splot Mass Balance” to view the mass balance for the “Best Estimate” trajectory. You should see that about 98% of the gasoline evaporated and dispersed in each of these scenarios.)

7. In the next scenario, you will see how the Kuparuk River flow influences the large- scale circulation during normal summer conditions. You can set up the new scenario in either of two ways: (1) You can make the changes shown below in the appropriate sections of the Summary List; or (2) You can close your file (choose Close from the GNOME File menu), then double-click Location File in the Summary List. Choose the North Slope Location File and enter these conditions in the Location File dialog boxes:

* Wind speed is zero.
* Model duration is 2 days.
* Colville River flow set as “low”.
* Pollutant type is “non-weathering”.
* Spill location is a point east of Gwydyr Bay, between the Return Islands
  and the mainland (70° 25'N, 148° 42'W).

Next, try running the scenario with each of these Kuparuk River flow rates:


(a) low - 700 cfs (b) mean - 2250 cfs (c) high - 3800 cfs
Note: After setting up GNOME for the low Kuparuk River flow scenario, save your work as a Location File Save (LFS). You will use those settings in Example 8 below.
How does the trajectory change with the different river conditions?

**Answer:**  The oil spreads farther, particularly to the east, with higher river flows. The higher the river flow rate, the more the outflow will keep oil out of the river delta.

8. Forecasts of environmental parameters are inherently uncertain. For example, wind and weather forecasts can be “off” in the speed, direction, or timing of the winds. GNOME supports a “Minimum Regret” solution in addition to the “Best Estimate” solution that you have been running. The Minimum Regret solution takes into account our uncertainty in wind, horizontal mixing, and currents. Using your saved file from Example 7 (a), add the Minimum Regret (Uncertainty) solution to your settings to see where else the spill might go.
Briefly discuss the difference between the “Best Estimate” (black) and “Minimum Regret” (red) trajectories. Why do you think this type of information would be useful?

**Hints:** To include the Minimum Regret (Uncertainty) solution, click the box labeled “Include the Minimum Regret solution” under Model Settings in the Summary List.

**Answer:**  The Minimum Regret solution shows more extensive impacts in all directions. In addition, it shows that there could be oil contact in the river delta, outside the Return Islands, and east of Gwydyr Bay. Responders use the “minimum regret” trajectory to make decisions about how they will allocate response resources. Sometimes a highly valued environmental resource (e.g. an endangered species) may be important enough to protect, even if it has a low probability of being oiled.

9. The Colville River also influences the large-scale circulation of this region. To compare the effects of different river flow rates, simulate a spill that occurs on August 17, 2001 at 1200. Set the model duration to 2 days, and don’t include the Minimum Regret solution. The wind is constant during this time at 20 knots from the east. For now, set both the Colville and Kuparuk River flow rates to “Low”. The pollutant released is 1000 barrels of medium crude, spilled at the mouth of the Colville River (70° 27'N, 150° 9'W). It continues to spill for the next 24 hours.

After you’ve run the low river flow conditions, re-run the simulation with a medium (10,000 cfs), and then high (20,000 cfs), flow rate for the Colville River only.
What effect(s) do the Colville River flow changes have on the trajectory and shoreline impacts of this spill?

**Hint:** To model a continuous release, in the Spill Information window, click the box labeled “Different end release time”, and enter August 18th as the end release time.

**Answer:**  Higher river flows keep the oil offshore longer so that response equipment, like skimmers and boom, can be mobilized.
In the low flow condition (shown below), the “Best Estimate” or Forecast trajectory shows that after 2 days, heavy oiling has occurred in the Colville River delta.


Low river flow condition [needimage here]

In the medium flow condition, the extent of beaching in the delta is not as severe. In this case, the fresh water from the higher river flow is pushing the oil out of the inlet, and the wind is pushing the oil west of the delta. The oil remains offshore until the oil spreads far enough to find a place where the river outflow is less, and then the wind pushes it onshore in a limited area.

Medium river flow condition [need image here]

In the high flow condition, most of the oil is pushed offshore by the higher river flow, where it is affected by the wind and coastal circulation. While this gives responders time to deploy equipment, it also means that the oil can travel a greater distance, possibly causing shoreline impacts to be more widespread.

High river flow condition [need image here]


