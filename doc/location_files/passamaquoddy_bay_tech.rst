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


.. _Close Encounters with the Old Sow: http://www.smithsonianmag.com/travel/close-encounters-with-the-old-sow-48091759/

`Close Encounters with the Old Sow`_

An article, from Smithsonian Magazine, about people who have been sucked into the Old Sow whirlpool.


.. _Old Sow Whirlpool: http://www.oldsowwhirlpool.com/ 

`Old Sow Whirlpool`_

An overview of the Old Sow whirlpool. 


.. _Old Sow: http://en.wikipedia.org/wiki/Old_Sow

Wikipedia, the free encyclopedia: `Old Sow`_

An encyclopedia entry that provides an overview of the Old Sow whirlpool.


.. _Passamaquoddy: http://en.wikipedia.org/wiki/Passamaquoddy

Wikipedia, the free encyclopedia: `Passamaquoddy`_

An encyclopedia entry that provides an overview of the Passamaquoddy people.


.. _Passamaquoddy Bay: http://en.wikipedia.org/wiki/Passamaquoddy_Bay

Wikipedia, the free encyclopedia: `Passamaquoddy Bay`_

An encyclopedia entry that provides an overview of Passamaquoddy Bay.


Oceanography
^^^^^^^^^^^^^^^^^

Greenberg, D.A., J.A. Shore, F.H. Page, and M. Dowd. 2005. A finite element circulation model for embayments with drying intertidal areas and its application to the Quoddy region of the Bay of Fundy. Ocean Modeling 10: 211-231.


.. _Station 44035 - Buoy J0201 - Cobscook Bay: http://www.ndbc.noaa.gov/station_page.php?station=44035

National Data Buoy Center: `Station 44035 - Buoy J0201 - Cobscook Bay`_

Observations and marine forecast for a 2-meter discus buoy (J0201), which is owned and maintained by the Gulf of Maine Ocean Observing System.


.. _Station PSBM1 - 8410140 - Eastport, ME: http://www.ndbc.noaa.gov/station_page.php?station=psbm1

National Data Buoy Center: `Station PSBM1 - 8410140 - Eastport, ME`_

Tide/water level data, tide predictions, and meteorological observations for Water Level Observation Network station 8410410, which is owned and maintained by NOAA's National Ocean Service.


.. _NOAA Tides & Currents - Meteorological Observations for Eastport, ME: http://tidesandcurrents.noaa.gov/met.html?id=8410140

`NOAA Tides & Currents - Meteorological Observations for Eastport, ME`_

Meteorological observations for station 8410140 at Eastport, Maine.


.. _Tide Data for Eastport, ME: http://tidesandcurrents.noaa.gov/noaatidepredictions/NOAATidesFacade.jsp?Stationid=8410140

NOAA Tides & Currents: `Tide Data for Eastport, ME`_

Tide data for station 8410140 at Eastport, Maine.


Wind and Weather
^^^^^^^^^^^^^^^^^^^^^^^^^^^^


.. _St. Andrews: http://text.weatheroffice.ec.gc.ca/forecast/city_e.html?nb-18

Environment Canada: `St. Andrews`_

Current conditions and forecast for St. Andrews, New Brunswick.


.. _National Weather Service Forecast: http://www.ndbc.noaa.gov/data/Forecasts/FZUS51.KCAR.html

National Data Buoy Center: `National Weather Service Forecast`_

Forecast for Maine coastal waters from Eastport to Stonington (out 25 nautical miles).


.. _Eastport, ME: http://forecast.weather.gov/MapClick.php?lat=44.90618742200047&lon=-66.98997651399964

National Weather Service Forecast: `Eastport, ME`_

Current conditions and forecasts for Eastport, Maine.


Oil Spill Response
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. _NOAA's Emergency Response Division (ERD): http://response.restoration.noaa.gov

`NOAA's Emergency Response Division (ERD)`_

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.
