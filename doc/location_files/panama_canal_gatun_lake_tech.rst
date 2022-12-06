:orphan:

.. keywords
   Panama Canal, Panama, Gatun Lake, Gatun, location

.. _panama_canal_gatun_lake_tech:

About Panama Canal Gatun Lake
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The Panama Canal -- Lake Gatun location file covers the navigable section of Lake Gatun, and the canal from Lake Gatun to the locks on the Pacific side of the canal

This location file is one of three location files covering Panama - the others model the Atlantic entrance and approach and the Pacific entrance and approach.


Background
=============================================

The location file is designed to simulate oil spills in the area. Oil spill risk is mainly from the large amount of vessel traffic navigating through the Panama Canal, making this location important for oil spill response and response planning.

Gatun Lake is a massive artificial lake in the middle of the Isthmus of Panama, formed by the creation of the Panama canal, which crosses through Panama from the Atlantic to the Pacific Ocean. It forms a major part of the Panama Canal, transiting ships for 33 km across the Isthmus of Panama. The lake was created between 1907 and 1913 during the creation of the Gatun Dam.

The lake level is maintained by regulating the balance between the inflow and outflow of the lake. Major inflows are from the Chagras river, as controlled by the Madden Dam, and uncontrolled flow from smaller tributaries around the lake. Outflow is through the various locks and the Gatun Dam.

Circulation in the lake is driven primarily by flow through the lake from controlled releases from the Madden Dam and tributaries, and out the lake at Gatun (via the Gatun Dam and the the Agua Clara and Gatun locks). There is also a flow from the Chagras River entrance through the canal to the lock on the Pacific side. Finally, there is a modest current driven by the wind blowing over the surface of the lake.


Current Patterns
======================================

The Panama Canal -- Lake Gatun Location File uses four current patterns to simulate circulation in the lake and flow in the canal.

One of the patterns models flow from the Chagres River down the ship canal toward the Pedro Miguel and Cocoli locks on the Pacific end.

Another pattern simulates the flow from the Chagres River through Lake Gatun, and out the Gatun dam and Gatun and Aqua Clara locks at the north end of the lake.

A third models flow from other uncontrolled tributaries into the lake, and out at the Gatun Dam.

The current patterns are scaled by specifying the flow into the lake from Madden Dam, and the flow out of the lake at the Pacific side locks, and at the Atlantic side locks and Gatun Dam. The uncontrolled tributary flow is scaled by the difference between the inflow and outflow values specified.

The high, medium, and low flow values were determined by statistical analysis of the flows since the expansion of the Canal in 2016. Medium flow is the median flow from the period analyzed, while the low and high are the 25% and 75% percentile flows.

A fourth circulation pattern is used to simulate wind driven flow in the lake: one pattern from NW winds and another from NE winds. These two patterns are scaled to the user supplied winds to produce a net current simulating the wind-drive circulation in the lake.

All current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.


References
==========================================


**Oceanography**

Información sobre Estudios de Corrientes en las Entradas del Canal, AUTORIDAD DEL CANAL DE PANAMÁ, Reporte HID-2013-06, 2013

|panama_canal_link|

Panama Canal Meteorology and Hydrology.


**Wind and Weather**

|accu_weather_link|

Weather products for Colón, Panama.


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |accu_weather_link| raw:: html

   <a href="https://www.accuweather.com/en/pa/gatun/1541703/weather-forecast/1541703" target="_blank">AccuWeather - Colón, Panama</a>

.. |panama_canal_link| raw:: html

   <a href="https://panama.aquaticinformatics.net/AQWebPortal/Data/Dashboard/11" target="_blank">Panama Canal Meteorology and Hydrology</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>
