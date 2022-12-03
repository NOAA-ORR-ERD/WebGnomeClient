:orphan:

.. keywords
   Panama Canal, Panama, Pacific, location

.. _panama_canal_pacific_tech:

About Panama Canal Gatun Lake
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Panama Canal Pacific covers the Pacific side of the Panama Canal. It is one of a set of three location files that model the Panama Canal.


Background
=============================================

This location is designed to simulate oil spills at the entrance to the Panama Canal from the Pacific Ocean. IN the canal entrance, the currents are primarily tidally driven -- the tidal currents are simulated with a flood current pattern tied to the tide station at Balboa, near the Bridge of the Americas. 

Outside of the entrance, in the Bay of Panama, the tidal influence continues through the ship canal, and then lessens outside the channel. Further outside the entrance to the canal, there is a coastal current in the Bay of Panama that is driven by the circulation in the greater Gulf of Panama. The current pattern simulated in GNOME captures the flow as modified by the local shoreline and bathymetry. The overall strength of the flow is determined by the larger scale circulation in the Gulf of Panama. Typically, the flow is counter-clockwise, and about 0.3 knots (0.15 m/s) at the scaling location, located southwest of the entrance at: 8.7534°N--79.6358°W.


Current Patterns
======================================

The Ocean currents in the entrance to Panama Canal are primarily tidally driven -- the tidal currents are simulated with a flood current pattern tied to the tide station at Balboa, near the Bridge of the Americas. 

Outside the entrance to the canal, there is a coastal current in the Bay of Panama that is driven by the circulation in the greater Gulf of Panama. The current pattern simulated in GNOME captures the flow as modified by the local shoreline and bathymetry. But the overall strength of the flow is determined by the larger scale circulation in the Gulf of Panama. Typically, the flow is counter-clockwise, and about 0.4 knots (0.2 m/s) at the scaling location, located at:   8.7534°N--79.6358°W.

Global Circulation models do not have high enough resolution to capture the flow in the Bay of Panama, but they do capture the general flow in the Gulf of Panama, and can be used to scale the more local current pattern.

One source of results from global circulation model is the |ioos_link|. There are currently two global models accessible through that system: The US NAvy Global Ocean Forecast System (GOFS), and the NOAA Real Time Ocean Forecast System (RTOFS). The results from these models can be selected in the IOOS EDS Viewer, and the predicted velocities at a specified point can be determined. The GNOME coastal current scale should be set to the approximate value near the location: 8.75°N--79.64°W.

Note that the current pattern is set for a counter-clockwise circulation, so that the direction of flow at the reference point is to the SSW. If the global model predicts flow in the opposite direction (NNE), the value can be set to a negative number to simulate a clockwise flow in the Bay of Panama.


The current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.

.. |ioos_link| raw:: html

   <a href="https://eds.ioos.us/map" target="_blank">NOAA IOOS EDS</a>


References
==========================================


**Oceanography**

|panama_canal_link|

Panama Canal Meteorology and Hydrology.


**Wind and Weather**

|wunderground_link|

Weather products for Panama City, Panama.


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |wunderground_link| raw:: html

   <a href="https://www.wunderground.com/forecast/pa/panama-city" target="_blank">Weather Underground - Panama City, Panama</a>

.. |panama_canal_link| raw:: html

   <a href="https://panama.aquaticinformatics.net/AQWebPortal/Data/Dashboard/11" target="_blank">Panama Canal Meteorology and Hydrology</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>
