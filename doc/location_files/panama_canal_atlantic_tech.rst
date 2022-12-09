:orphan:

.. keywords
   Panama Canal, Panama, Atlantic, location

.. _panama_canal_atlantic_tech:

About Panama Canal Atlantic
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The Panama Canal - Atlantic location file covers the area outside the Panama Canal entrances on the Atlantic side of the canal system (on the northern coast of Panama). The area covered is from the ocean sides of the Agua Clara and Gatun locks on the south, Limon Bay and the dock areas of Colón, and the area of the Caribbean just outside the entrance to the Bay.

This location file is one of three location files covering Panama - the others model the Pacific entrance and approach, and Lake Gatun and the passages inside the canals.


Background
=============================================

The location file is designed to simulate oil spills in the area. Oil spill risk is mainly from the large amount of vessel traffic navigating through the Panama Canal, making this location important for oil spill response and response planning. 

The location file will predict transport using two current patterns designed to represent observed currents in the area.  The first pattern represents flow inside Limon Bay set up by wind forcing. The second is an offshore pattern driven by the predominantly west to east currents offshore of Colón in the Caribbean Sea.
The Panama - Atlantic location file does not include a tidal current pattern due to the low tidal forcing. Resultant tidal velocities would not result in significant transport of oil during a spill.


Current Patterns
======================================

Wind-driven circulation patterns within Limon Bay are represented by a combination of two wind patterns, one from northeast winds and another from northwest winds (90 degrees apart). These two patterns are combined linearly to produce a current pattern appropriate for the user-defined wind field. Current velocity is scaled linearly with wind stress calculated from the user's wind field.

The current pattern for offshore of Limon Bay and Colón is defined to represent the predominant west to east currents in this region of the Caribbean Sea. The velocity magnitudes of the current pattern are scaled to data collected by the Panama Canal Authority (ACP) offshore of the breakwater entrance to Limon Bay (ACP Report HID-2013-06, 2013). 

Global circulation models do not have high enough resolution to predict the needed detail for transport outside of Limon Bay, but they do capture the general flow in the Caribbean Sea and can be used to scale the more local current pattern. One source of results from global circulation model is the NOAA IOOS EDS (https://eds.ioos.us/map/). There are currently two global models accessible through that system: The US Navy Global Ocean Forecast System (GOFS), and the NOAA Real Time Ocean Forecast System (RTOFS). The results from these models can be selected in the IOOS EDS Viewer, and the predicted velocities at a specified point can be determined. Then the GNOME coastal current scale should be set to the approximate value near the location: 9.39°N--79.93°W.

The current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.


References
==========================================


**Oceanography**

Información sobre Estudios de Corrientes en las Entradas del Canal, AUTORIDAD DEL CANAL DE PANAMÁ, Reporte HID-2013-06, 2013

|panama_canal_link|


**Wind and Weather**

|accu_weather_link|

Weather products for Colón, Panama.


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |accu_weather_link| raw:: html

   <a href="https://www.accuweather.com/en/pa/panama-canal/93868_poi/weather-forecast/93868_poi" target="_blank">AccuWeather - Colón, Panama</a>

.. |panama_canal_link| raw:: html

   <a href="https://panama.aquaticinformatics.net/AQWebPortal/Data/Dashboard/11" target="_blank">Panama Canal Meteorology and Hydrology</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>
