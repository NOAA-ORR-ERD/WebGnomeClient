:orphan:

﻿.. keywords
   North Slope, Alaska, Stefansson, Harrison, Gwydyr, sound, bay, Mackenzie, Beaufort, location

.. _north_slope_tech:

About North Slope, Alaska
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This North Slope, Alaska location file is the third in a series for this area, covering the region of significant oil development that occurs on the North Slope. The *North Slope* Location File combines the two previous Arctic Location Files – *Stefansson Sound* and *Harrison and Gwydyr Bays* – and extends east into Canada to include the Mackenzie River delta as well.

The Arctic Ocean in this region, the Beaufort Sea, is covered with ice for about nine months each year. By mid-July, the Beaufort is usually ice-free from the shore to the edge of the pack ice, which by late summer, retreats from 6 to 60 miles (10 km to 100 km) offshore (Committee 2003). **This Location File should only be used during these ice-free times.**

The coastline modeled in this Location File is part of Alaska's (and Canada's) beautiful and fragile tundra. Tundra is a flat, treeless plain that supports shrubby or mat-like vegetation, such as low shrubs, sedges, grasses, mosses, and lichens. In Alaska, the North Slope tundra extends north from the foothills of the Brooks Range to the Arctic Ocean, and west from the Canadian border to the Chukchi Sea.

The North Slope shoreline is irregular, containing many small bays, lagoons, spits, beaches, and barrier islands. Extensive mud flats often occur in the deltas of the rivers. Some of the larger rivers discharging into the Beaufort Sea form depositional deltas that extend several miles from the shore. Most of the coastline is low-lying, with only small bluffs less than 10 feet (3 meters) high. Some areas of the coast are directly exposed to the open ocean, and other sections are protected by chains of barrier islands that are composed of sand and gravel (Committee 2003).

Gwydyr Bay is a lagoon area west of Prudhoe Bay, between the Return Islands and the mainland in northeastern Alaska. Harrison Bay is a large inlet north and west of the Colville River Delta. Rivers in this area tend to be fast-flowing and braided, with extensive delta systems. The river systems support a diversity of plant and animal life, and can serve as corridors for migrating mammals and birds (Committee 2003). 

North Slope Location File
============================================

The North Slope Location File simulates open water conditions (generally occurring mid-July through mid-September) in the coastal area between Harrison Bay and the Mackenzie River delta in Canada, including the Arctic National Wildlife Refuge (ANWR) as well as Gwydyr Bay and Stefansson Sound. The Location File contains circulation patterns that simulate the wind-driven coastal circulation and the flows of some of the region's larger rivers. Because the tidal currents are generally less than 5 cm s-1 (Endicott 1992), tides have not been included in the simulation. The Location File includes detailed circulation between the numerous barrier islands of this region; however, other than the field work done for the earlier *Harrison and Gwydyr Bays* Location File, we lack data for calibration of the currents.

In this Location File, seven North Slope rivers are simulated. Unfortunately, east of Prudhoe Bay few bathymetric surveys of the river channels have been conducted and very little information exists on flow rates at the mouths of the rivers. With so little data available to build the hydrodynamics of the four Stefansson Sound river channels, we could not set the range of values and user-inputs well for any of the rivers. (The Sag River has the most data; however, these data are not as good as we would like, because the gauge is very far upstream.) Other complications in simulating these rivers are that the river flow rates can change very quickly, and the physical terrain of these braided rivers includes extensive mud flats, spits, and barrier islands. Consequently, we used our best professional judgment to depict these rivers. 

A result of the limitations in simulating the rivers is that more information is needed from the user in order to set the river flows within a reasonable margin of error. In this Location File, the user needs to set a flow velocity near (generally < 1 NM) the mouth of each river. The user can either (1) make an estimate by throwing an orange into the river channel and tracking it with a global positioning system (GPS), pacing off the distance traveled, or by using some other estimation method; or (2) guess a range of values and see what happens in the model.  

In general, the higher the river flow, the harder it is for oil to move up into the river. Wind can partly overcome the river flow to move oil, but the complicated geometry of these river mouths (e.g., braided rivers with deltas and many barrier islands) means the wind would have to change direction in just the right combination of speeds and directions in order to move the oil through these complicated channels.


Circulation
====================================

The coastal circulation in the Beaufort Sea is driven by the wind and is constrained along the shoreline in either direction. Summer winds are primarily from the east to northeast, and secondarily from the west to northwest. Winds with an easterly component drive coastal circulation toward the west and offshore, while winds with a westerly component drive the coastal currents toward the east and onshore (Aagaard 1979, Barnes and Reimnitz 1974, Cannon and Hachmeister 1987, Hachmeister et al. 1987, Hale et al. 1989, Savoie and Wilson 1986). Changes in wind direction are generally reflected in the coastal circulation within a few hours (Savoie and Wilson 1986).

Wind-driven Ekman transport can alter the across-shelf surface pressure gradient. Upwelling situations tend to increase the water column stratification, while downwelling situations tend to make the water column more homogeneous (Hale et al. 1989). When the wind relaxes or reverses, the forcing sustaining this pressure gradient is released and water tends to move on- or off-shore (Savoie and Wilson 1986). Large river discharges, such as from the Mackenzie River in Canada, also create a surface plume with significant offshore velocities that move the fresher surface water offshore, creating an estuary-like circulation with colder, more saline water moving to the surface in response (Hale et al. 1989). These effects are not simulated in this Location File.

West Dock Break

We have been careful to simulate the cut through West Dock causeway to allow the coastal circulation to pass through. The surface circulation in this Location File flows both through the West Dock and as a jet around the margin of the causeway, returning shoreward on the other side, as seen in the field (Hachmeister et al. 1987, Savoie and Wilson 1986, Short et al. 1988a).


Current Patterns
========================================

This Location File has eight current patterns: one component of the wind-driven currents in the lagoon systems; and seven river systems: the Mackenzie, Colville, Kuparuk, Sagavanirktok (Sag), Shaviovik, Canning, and Tamayariak Rivers. All were created with the NOAA Current Analysis for Trajectory Simulations (CATS) hydrodynamic model.


Wind-Driven Currents
==============================================

Wind-driven currents were simulated in the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic model, using the Wind-Driven Analysis Currents model. This model was used with linear physics so that the wind-driven currents could be related to a time-average of the wind data entered by the user. Both easterly winds and resultant baroclinic flow were simulated in the CATS model, so the wind velocity that the user enters is decomposed into those two components. The total current velocity is then related to the wind stress calculated from the winds input by the user. The wind-driven circulation patterns in this Location File were scaled with respect to the western boundary circulation in the Harrison and Gwydyr Bay Location File. The scaling in the Harrison and Gwydyr Bays Location File was created from fieldwork conducted during August 2001.


﻿Rivers
================================================

The rivers simulated in this Location File include the four Stefansson Sound rivers (Sagavanirktok ["Sag"], Canning, Shaviovik, and Tamayariak Rivers), Colville, Kuparuk and Mackenzie Rivers. 

* The Sag, begins on the north slope of the Brooks Range and flows about 180 miles (290 km) north-northwest across a broad, open floodplain to the Beaufort Sea near Prudhoe Bay.

* Another major river, the Canning, forms the western boundary of Alaska's Arctic National Wildlife Refuge (ANWR). This river originates at a glacier in the Franklin Mountains and flows 125 miles (201 km) north to Camden Bay.

* The Shaviovik, whose name derives from an Inuit phrase meaning "place where there is iron," flows northeast 75 miles (121 km) to the Beaufort Sea between Foggy Island and Mikkelsen Bay.

* The smallest of the Stefansson Sound rivers, the Tamayariak flows northeast 40 miles (64 km) from its lakehead at the west end of the Sadlerochit Mountains, draining into the Canning River 2 miles (3 km) southwest of its mouth.

* The Colville flows 350 miles (560 km) east and north to the Beaufort Sea, receiving inflow from the numerous tributaries that descend from the western Brooks Range.

* The Kuparuk River flows 150 miles (240 km) northward from the eastern Brooks Range, terminating in the Beaufort Sea

* The longest of the rivers, the Mackenzie, flows northward 1,080 miles (1,738 km) from its source at the shallow swamps and mudbanks of Great Slave Lake in Canada's Northwest Territories. With its watershed covering almost one-fifth of Canada, the Mackenzie River flow parallels the Mackenzie Mountains, ending in a wide fan-shaped delta of channels and islands where it empties into the Beaufort Sea.

Stefansson Sound Rivers
------------------------------------------------

The Stefansson Sound river flows are simulated with user interaction in this Location File. Unfortunately, very little information is available on riverbed bathymetry and flow rates in this region of the Arctic. The Sag River does have a river gauge, with forecasts made at the river's mouth in the Beaufort Sea; however, these forecasts are not available online. In order to create a useful planning tool in this Location File, we have estimated river circulation patterns and likely river flow rates, based on other rivers in the U.S. We have included simple methods for measuring river currents in the *River Flows* Help Topic. If measurements of surface currents are unavailable, we recommend that the user choose high and low values for the river flow, and run the model with these values to evaluate the difference.

Colville River Flow
------------------------------------------------

The Colville River flows into Harrison Bay and is simulated with user interaction in this Location File. The user can choose one of three flow values as estimates of the flow rate. 

The three flow rates (20,000 cfs, 10,000 cfs, and 3,000 cfs) are estimates of high, medium, and low flow rates for river flow after the extremes of the spring freshet have passed. The 1996 Colville River Delta Channel Assessment by Shannon & Wilson, Inc. was used for flow estimates. 

Kuparuk River Flow
------------------------------------------------

The Kuparuk River flows into Gwydyr Bay and is also simulated with user interaction in this Location File. The user can choose one of three flow values as estimates of the flow rate, or can enter a flow rate based on real-time or historical flow values. 

The three flow values available in the pull-down menu are the mean flow rate (2250 cfs) plus/minus the standard deviation (1550 cfs) calculated from historical flow data from 1971-1999. The historical measurements were taken between July 1 and August 31, with flow rates greater than 10,000 cfs discarded, as we did not simulate these flooding conditions in this Location File.

To obtain real-time or historical flow values for the Kuparuk River, visit |usgs_link|. On the interactive map, click Alaska (AK). Next, either click the Kuparuk River on the Alaska map or select "Statewide Streamflow Table." Under the heading, "Arctic Slope", select station number "15896000" for the station Kuparuk River near Deadhorse, Alaska.

Mackenzie River Flow
------------------------------------------------

The Mackenzie River flows into the Beaufort Sea and is simulated via user interaction in this Location File. The user can choose one of three flow values as estimates of the flow rate, or can enter a flow rate based on real-time or historical flow values.

The three flow values available in the pull-down menu are the high, medium and low flow rates (30000, 20000, and 10000 m3 s-1) calculated from historical flow data from 1972-2010. 

To obtain real-time or historical flow values for the Mackenzie River, see the Environment Canada – Water Survey of Canada hydrometric data web page for the |red_river_link|. Under the heading, Data Category, select "Real-Time." Under the heading, Parameter Type, select "Discharge." Next to Parameter Type, click "Redraw." A time-series graph of the discharge is provided in cubic meters per second.

**Note:** For the Mackenzie River, high, mean, and low estimates were derived from |historical_link| (and from investigation of the hydrology of the Mackenzie River by the Water Survey of Canada. Additional analysis of these data was provided by the |gewex_link| (Global Energy & Water Cycle Experiment) Study. In situ measurements of discharge and the resultant current speeds at principal channels of the Mackenzie were provided by Water Survey of Canada (Roger Pilling – Hydrometric Supervisor, personal communication, June 21, 2012).

.. |usgs_link| raw:: html

   <a href="http://waterdata.usgs.gov/nwis/rt" target="_blank">USGS Current Water Data for the Nation</a>

.. |red_river_link| raw:: html

   <a href="http://www.wateroffice.ec.gc.ca/graph/graph_e.html?stn=10LC014" target="_blank">Mackenzie River at Arctic Red River</a>

.. |historical_link| raw:: html

   <a href="http://www.wsc.ec.gc.ca/applications/H2O/graph-eng.cfm?station=10LC014&report=daily&year=2010" target="_blank">historical data recorded from 1972 to 2010</a>

.. |gewex_link| raw:: html

   <a href="http://www.usask.ca/geography/MAGS/Data/discharge/discharge_e.html" target="_blank">Canadian Mackenzie GEWEX</a>



References
=================================

**Oceanography**

Aagaard, K. 1984. The Beaufort Undercurrent. In: The Alaskan Beaufort Sea: Ecosystems and Environments. P.W. Barnes, D.M. Schell, and E. Reimnitz (eds). Orlando: Academic Press. pp 47-71.

Aagaard, K. 1979. Current Measurements in Possible Dispersal Regions of the Beaufort Sea. U.S. Dept. Commerce, NOAA, OCSEAP, Environ. Assess. Alaskan Continental Shelf, Annual Report 7: 208-232.

Barnes, P.W. and E. Reimnitz. 1974. Sedimentary processes on Arctic Shelves off the northern coast of Alaska. Pp. 439-476 in The Coast and Shelf of the Beaufort Sea, J.C. Reed and J.E. Sater, eds. Arctic Institute of North America, Arlington, VA.

Cannon, T. and L. Hachmeister. 1987. Integration and Assessment. Part I, Chapter 2 in 1985 Final Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska.

1988 Endicott Environmental Monitoring Program Final Report: Oceanography. 1992. Prepared by Science Applications International Corporation for U.S. Army Corps of Engineers, Alaska District.

Environmental Protection Agency (EPA), Region 10. 1988. Causeways in the Alaskan Beaufort Sea. Technical Report 910/9-88-218. Anchorage: Alaska Operations Office. 25 pp.

Hachmeister, L.E., K.S. Short, K.B. Winnick, G.C. Schrader, and J.W. Johannessen. 1987. Oceanographic Monitoring. Part III, Chapter 3 in 1985 Final Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 162 pp. + appendices.

Hale, D.A., M.J. Hameedi, L.E. Hachmeister, and W.J. Stringer. 1989. Effects of the West Dock Causeway on Nearshore Oceanographic Processes in the Vicinity of Prudhoe Bay, Alaska. Technical Report. Anchorage: NOAA, Ocean Assessments Division. 50 pp.

Hanzlick, D., C. Schrader, and L. Hachmeister. 1988. Ice Breakup/Freezeup. Part III, Chapter 1 in 1987 Draft Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 49 pp. + appendices.

Hummer, P.G. 1988. Meteorology. Part II, Chapter 1 in 1987 Draft Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska.

Savoie, M.A. and D.E. Wilson. 1986. Physical Processes Monitoring Program - 1984, final report. In: Prudhoe Bay Waterflood Environmental Monitoring Program - 1984. Prepared by Kinnetic Laboratories, Inc. for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 195 pp + appendices.

Schrader, G.C. and L.E. Hachmeister. 1987. Ice Breakup/Freezeup Monitoring. Part III, Chapter 1 in 1986 Draft Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 49 pp.

Short, K.S., G.C. Schrader, L.E. Hachmeister, and C.J. Van Zee. 1988a. Oceanographer. Part II, Chapter 3 in 1986 Draft Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 276 pp. + appendices.

Short, K.S., C.D. Janzen, C.J. Van Zee, and D.J. Hanzlick. 1988b. Oceanography. Part II, Chapter 3 in 1987 Draft Report of the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska. 171 pp. + appendices.

St. Martin, J.W. 1987. Arctic Drifting Buoy Data: 1979-1985. Technical Report CG-D-10-87. Prepared by U.S. Coast Guard, Research and Development Center, Avery Point, Groton, CT for Department of Transportation, U.S. Coast Guard, Office of Research and Development, Washington, D.C.

Stringer, W.J. 1987. Ice Breakup/Freezeup. Part III, Chapter 1 in 1985 Final Report for the Endicott Environmental Monitoring Program. Prepared by Envirosphere Company for U.S. Army Corps of Engineers, Alaska District, Anchorage, Alaska.

**Hydrography**

Hydrocon Engineering (Continental) Ltd. 1982. Point Thomson Development Hydrologic Studies. Prepared for Exxon Company, USA, Production Department, Western Division. Calgary, AB: Hydrocon Engineering (Continental) Ltd. 93 pp. + appendices.

Dames & Moore. 1983. Data Report: Point Thomson Development, Alaska, 1983 Hydrology Program. Prepared for Exxon Company, USA, Production Department, Western Division. Golden, CO: Dames & Moore. 58 pp. + appendices.

Committee on Cumulative Environmental Effects of Oil and Gas Activities on Alaska's North Slope. 2003. Cumulative Environmental Effects of Oil and Gas Activities on Alaska's North Slope. Washington, D.C.: The National Academies Press. 160 pp. + appendices.

McNamara, J.P., D.L. Kane, and L.D. Hinzman (1998). An analysis of streamflow hydrology in the Kuparuk River Basin, Arctic Alaska: a nested watershed approach. Journal of Hydrology 206: 39-57.

Shannon & Wilson, Inc. 1996. 1996 Colville River Delta Channel Assessment, Colville River Delta, North Slope, Alaska. Fairbanks, AK: Shannon & Wilson, Inc. 9 pp. + appendices.

**Wind and Weather**

.. _National Weather Service Forecast Office (NWSFO), Fairbanks, Alaska.: http://pafg.arh.noaa.gov/

`National Weather Service Forecast Office (NWSFO), Fairbanks, Alaska.`_

.. _zone forecast for Zone 203: http://pafg.arh.noaa.gov/zonefcst.php?zone=AKZ203

A `zone forecast for Zone 203`_ , Central Beaufort Sea Coast (including Nuiqsut, Prudhoe Bay, Alpine, Deadhorse, Kuparuk).

.. _zone forecast for Zone 204: http://pafg.arh.noaa.gov/zonefcst.php?zone=AKZ204

A `zone forecast for Zone 204`_ , Eastern Beaufort Sea Coast (including Kaktovik, Flaxman Island).

NWSFO pages include links to other forecasts, satellite pictures, weather history, and related information.


.. _Interactive Weather Information Network - National Weather Service (NWS): http://www.nws.noaa.gov/view/largemap.php

`Interactive Weather Information Network - National Weather Service (NWS)`_

To obtain weather reports and forecasts for this region, click AK on the U.S. map, then click Deadhorse or Barrow on the Alaska map.


.. _NOAA/NOS Center for Operational Oceanographic Products and Services (CO-OPS): http://co-ops.nos.noaa.gov/geo.shtml?location=9497645

`NOAA/NOS Center for Operational Oceanographic Products and Services (CO-OPS)`_

Retrieve environmental data recently collected at National Ocean Service data collection platforms and stored in the CO-OPS databases. Click the links under "Products" to view the form you can use to retrieve data. Follow these steps to view current wind observations for station 9497645, Prudhoe Bay, AK:

* Check that "Prudhoe Bay, AK 9497645" is shown atop the Products links.
* Click "Meteorological Obs." in the Products links.
* At the bottom of the page, enter beginning and ending dates for the data you'd like to view.
* Select either Imperial or metric data units, then select a Time Zone (local [includes daylight savings], GMT [Greenwich Mean Time], or LST [Local Standard Time, doesn't shift with daylight savings]).
* Click the "View Data" button to see the data in tabular form, or click the "View Plot" button to see the data in graphical form. Wind direction is provided in degrees true.


**Oil Spill Response**

.. _NOAA's Emergency Response Division (ERD): http://response.restoration.noaa.gov

`NOAA's Emergency Response Division (ERD)`_

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.


Acknowledgements
================================================

We would like to thank **British Petroleum** for sponsoring the fieldwork in Gwydyr Bay from August 16-20, 2001, as well as **Alaska Clean Seas**, which arranged for boats and personnel to assist NOAA/OR&R/ERD personnel during three days of sampling trips.

.. _Environment Canada – Water Survey of Canada: http://www.ec.gc.ca/rhc-wsc/

Additional thanks to `Environment Canada – Water Survey of Canada`_ for access to hydrometric data for the Mackenzie River watershed.
