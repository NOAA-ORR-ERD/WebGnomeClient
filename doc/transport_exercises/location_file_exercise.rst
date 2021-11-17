####################################
Example Scenario using Location File
####################################

Columbia River Estuary Example Problem
--------------------------------------

This exercise will introduce the basics of setting up a transport model in WebGNOME using the 
Columbia River Estuary "Location File". :doc:`Location Files <../location_files>` contain pre-packaged
information about the tides, currents, and shorelines for a specific region.

The example setup will explore how the changing river flow alters the
estuary's tidal currents and the trajectory of an oil slick, how wind
can move an oil slick in a different direction from the currents, and
how model and observation limitations can be overcome by considering
both the "Best Estimate" and the "Minimum Regret" solutions. 

Incident
--------

At approximately 1 PM on 15 May 2017,  USCG Sector Columbia River was notified that the M/V Pauly Shore, 
a 738-foot bulk carrier laden with grain, had run aground in the Columbia River near river mile 29 
(near Brookfield, WA) while outbound. The vessel is carrying 300,000 gallons of marine diesel. The vessel's 
hull was breached but no fuel was released. Two tugs are assisting with stabilizing and turning the vessel for 
transit to Kalama. Spill response equipment is on-scene and standing by in the event of a fuel release.

The USCG has requested information on which shorelines might be at risk in the event of a release this afternoon
while the vessel is being stabilized. Operations are expected to commence around 2 PM and take several hours.

Setting up the Intial Scenario
------------------------------

Begin by loading the Columbia River Location File. Use the following information to answer questions in the 
Location File Wizard.

=======================  =================================================
Start time:               May 15, 2017 at 2 PM (1400).
Model duration:           1 day.
Uncertainty:              Not included.
Columbia River Flow:      Low.
Wind:                     No wind (0 knots).
Spill type:               Instantaneous.
Time of Release:          Same as model start time.
Amount released:          300,000 gallons.
Pollutant type:           Non-weathering.
Position:                 46° 15.1' N, 123° 33.5' W.
=======================  =================================================

Run the model and observe what happens. You can use the Layers panel on the right 
hand side to view the current patterns used in the Location File which include tidal 
currents and river flow. Learn more in 
the :doc:`Columbia River Location File User Guide <../location_files/columbia_river_estuary_tech>`

Return to Setup View to add Winds
---------------------------------

After setting up the model, modification can be made to the scenario using Setup View. 
To navigate to this view, click the pencil icon in the menu bar (right hand side). We will
add a constant wind from the N at 10 kts. 

To change the wind conditions, 
click on the edit icon in the **Wind** panel then enter the wind speed
and direction in the Constant Wind tab. Because you are entering a 
"Constant Wind" the Date & Time Field is not important as the 
same values will be applied at all model times. If you are unfamiliar with 
conventions for how wind data is reported, click the question mark icon in 
the title bar of the form for help.

Re-run the model and see how the impacts change.

Change the Spill Start Time
---------------------------

Previously, we set the spill start time as 2 PM. If you visualized the currents previously, you might have
observed that this coincides with the beginning of the flood tide, when currents are directed up the estuary.
How does the trajectory change if the spill began later in the evening at the onset of the edd tide (7 pm).

To do this, leave the winds as in the previous example. In the **Spill** panel, click on the edit 
(pencil) icon of the spill you created to edit the time of release. 

When you change the start time of the spill, you will likely want to
change both the spill start time and the model start time. If you change
the spill start time first, WebGNOME will automatically
prompt you to change the model start time to match the spill start time. 
So it is a good idea to always change the spill start time first.

Re-run the model and see how the impacts change.

Stronger River Flow
-------------------

When we setup the original scenario, we specfied "Low Flow" for the Columbia River. However, this scenario is 
in the spring during the freshet when the river outflow is typically very high. Let's scale up the river currents 
to be more representative of high flow conditions. 

To scale the river currents, without going back through the Location File Wizard
you can select "River Currents" from the Currents panel in Setup View. Click the pencil icon next to this 
item to edit and you will see a "Scale Value" parameter. How this value is derived from the river flow is explained 
in the :doc:`Columbia River Location File User Guide <../location_files/columbia_river_estuary_tech>`. For now, 
just increase this value to 0.4 which is the scale value for a higher river flow of ~500,000 cfs.

Re-run the model and see how the impacts change. (You might also try switching back to the earlier flood tide spill 
start time to see how the flood tide transport is modified during high river flow conditions).

Include Uncertainty
-------------------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of winds. WebGNOME supports a "Minimum Regret"
solution in addition to the "Best Estimate" solution that you have been
running. The "Minimum Regret" solution takes into account our
uncertainty in wind, horizontal mixing, and currents.

Rerun the previous scenario, this time with the "Minimum Regret" solution turned on.
You'll find this option in the Model Settings panel as "Include uncertainy in particle transport".

