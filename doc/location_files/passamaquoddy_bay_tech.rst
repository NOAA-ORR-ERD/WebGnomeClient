:orphan:

.. keywords
   Passamaquoddy, Maine, New Brunswick, Fundy, location

.. _passamaquoddy_bay_tech:

About Passamaquoddy Bay, Maine
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Passamaquoddy Bay straddles the United States-Canada border between the province of New Brunswick in eastern Canada and the northeastern state of Maine. Passamaquoddy Bay is an inlet of the Bay of Fundy at the mouth of the St. Croix River. Most of the bay lies within New Brunswick; however, this Location File covers the U.S. portion of the bay.

Passamaquoddy Bay is home to the largest tidal whirlpool in the western hemisphere. The Old Sow whirlpool is located off the southwestern shore of Deer Island, New Brunswick between the island and Eastport, Maine. The whirlpool is caused by variations in local bathymetry combined with the extreme tidal range of the Western Passage where waters exchange between Passamaquoddy Bay and the Bay of Fundy. It has been measured with a diameter of approximately 75 meters (250 feet). Old Sow generally creates tremendous water turbulence locally, but it does not usually constitute a navigation hazard for larger vessels; small craft are warned to avoid these waters when the tide is running. This feature is too small to simulate in this larger scale Location File.


Background
==============================

The tidal range (>20 feet with extremes nearing 30 feet) in Passamaquoddy Bay can present a challenge to navigation and piloting. The tidal range increases as you sail from west to east along the coast of Maine and New Brunswick, Canada. Starting with a range of 9 feet or so in Kittery, it reaches about 19 feet in Eastport, and 25 feet in Saint John, New Brunswick. The Bay of Fundy is known for having the world's largest tidal range at over 45 feet (The Hopewell Rocks).


Current Patterns
====================================

The Passamaquoddy Location File contains tidal circulation patterns developed at the Bedford Institute of Oceanography in Dartmouth, Nova Scotia, Canada. The model is an implementation of the QUODDY 3-dimensional finite element circulation model. The model was expanded to allow for the flooding and drying of intertidal areas (Greenberg et al 2005). This bay has an extensive network of intertidal flats, tidal pools and channels that become blocked at low tide, and simulating dry areas improves the circulation throughout the domain. The region supports many aquaculture sites which require accurate knowledge of the local circulation and water properties.


GNOME Implementation
==============================================

Typically, tidal current simulations in GNOME Location Files use a single current pattern driven by tidal harmonics. In order to capture the large tidal variation in Passamaquoddy Bay and allow for wetting and drying of the shoreline, twelve representative tide patterns covering a tidal cycle were selected and driven by the tide station at Estes Head. These patterns consist of maximum flood, minimum before ebb, maximum ebb, and minimum before flood, with two patterns in between each. The Lunar Semidiurnal or M2 tidal constituents were used to get a picture of the phase changes of the typical circulation over a tidal cycle (roughly 12 hours) with the tide station used to calibrate the amplitude. When the model is run, GNOME determines where in the tide cycle the flow is at a given time, then selects the appropriate two patterns to use and interpolates as necessary. Each pattern identifies any dry grid points so GNOME is able to simulate the shoreline edge movement from the rising and falling tide.


References
=====================================


General Information
^^^^^^^^^^^^^^^^^^^^^^^^^


|sow_encounters_link|

An article, from Smithsonian Magazine, about people who have been sucked into the Old Sow whirlpool.


|sow_whirlpool_link|

An overview of the Old Sow whirlpool. 


Wikipedia, the free encyclopedia: |old_sow_link|

An encyclopedia entry that provides an overview of the Old Sow whirlpool.


Wikipedia, the free encyclopedia: |passamaquoddy_link|

An encyclopedia entry that provides an overview of the Passamaquoddy people.


Wikipedia, the free encyclopedia: |passamaquoddy_bay_link|

An encyclopedia entry that provides an overview of Passamaquoddy Bay.


Oceanography
^^^^^^^^^^^^^^^^^

Greenberg, D.A., J.A. Shore, F.H. Page, and M. Dowd. 2005. A finite element circulation model for embayments with drying intertidal areas and its application to the Quoddy region of the Bay of Fundy. Ocean Modeling 10: 211-231.


National Data Buoy Center: |ndbc_cobscook_link|

Observations and marine forecast for a 2-meter discus buoy (J0201), which is owned and maintained by the Gulf of Maine Ocean Observing System.


National Data Buoy Center: |ndbc_eastport_link|

Tide/water level data, tide predictions, and meteorological observations for Water Level Observation Network station 8410410, which is owned and maintained by NOAA's National Ocean Service.


NOAA Tides & Currents - |tides_currents_link|

Meteorological observations for station 8410140 at Eastport, Maine.


NOAA Tides & Currents: |tide_data_link|

Tide data for station 8410140 at Eastport, Maine.


Wind and Weather
^^^^^^^^^^^^^^^^^^^^^^^^^^^^


Environment Canada: |ec_weather_link|

Current conditions and forecast for St. Andrews, New Brunswick.


National Data Buoy Center: |ndbc_nws_link|

Forecast for Maine coastal waters from Eastport to Stonington (out 25 nautical miles).


National Weather Service Forecast: |nws_eastport_link|

Current conditions and forecasts for Eastport, Maine.


Oil Spill Response
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.


.. |sow_encounters_link| raw:: html

   <a href="http://www.smithsonianmag.com/travel/close-encounters-with-the-old-sow-48091759" target="_blank">Close Encounters with the Old Sow</a>

.. |sow_whirlpool_link| raw:: html

   <a href="http://www.oldsowwhirlpool.com" target="_blank">Old Sow Whirlpool</a>

.. |old_sow_link| raw:: html

   <a href="http://en.wikipedia.org/wiki/Old_Sow" target="_blank">Old Sow</a>

.. |passamaquoddy_link| raw:: html

   <a href="http://en.wikipedia.org/wiki/Passamaquoddy" target="_blank">Passamaquoddy</a>

.. |passamaquoddy_bay_link| raw:: html

   <a href="http://en.wikipedia.org/wiki/Passamaquoddy_Bay" target="_blank">Passamaquoddy Bay</a>

.. |ndbc_cobscook_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/station_page.php?station=44035" target="_blank">Station 44035 - Buoy J0201 - Cobscook Bay</a>

.. |ndbc_eastport_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/station_page.php?station=psbm1" target="_blank">Station PSBM1 - 8410140 - Eastport, ME</a>

.. |tides_currents_link| raw:: html

   <a href="http://tidesandcurrents.noaa.gov/met.html?id=8410140" target="_blank">Meteorological Observations for Eastport, ME</a>

.. |tide_data_link| raw:: html

   <a href="http://tidesandcurrents.noaa.gov/noaatidepredictions/NOAATidesFacade.jsp?Stationid=8410140" target="_blank">Tide Data for Eastport, ME</a>

.. |ec_weather_link| raw:: html

   <a href="https://weather.gc.ca/city/pages/nb-18_metric_e.html" target="_blank">St. Andrews</a>

.. |ndbc_nws_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/data/Forecasts/FZUS51.KCAR.html" target="_blank">National Weather Service Forecast</a>

.. |nws_eastport_link| raw:: html

   <a href="http://forecast.weather.gov/MapClick.php?lat=44.90618742200047&lon=-66.98997651399964" target="_blank">Eastport, ME</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>

