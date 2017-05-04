:orphan:

.. _st_johns_river_tech:

About St. Johns River, Florida
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

At 310 miles [499 kilometers] long, the St. Johns River is the longest river in Florida, and the longest river in the United States that flows *northward*. The St. Johns is also one of the "laziest" rivers in the world because its total drop, from its source in marshes south of Melbourne to its mouth in the Atlantic near Jacksonville, is less than 30 feet [9.1 meters]! This slow flow makes it difficult for the river current to flush pollutants. 

The Lower St. Johns River (LSJR) extends from where the Ocklawaha River joins the St. Johns River to the sea, and includes slightly more than a third of the total length of the St. Johns River. This Location File does not simulate the entire LSJR, but does extend slightly beyond the dredged channels where vessels transit and beyond historical spill locations.


Background
================================

The St. Johns River circulation is controlled by the moderate tides. Although the St. Johns River is the longest river in Florida, it is only fifth largest in terms of discharge volume. Freshwater runoff does not significantly affect the circulation. The freshwater output makes up about 1/7th of the average tidal flow (Anderson and Goolsby 1973). 

The two jetties at the entrance to the St. Johns River are built of rip-rap, which is permeable to spilled oil. We have simulated these jetties as solid structures in this Location File, for ease of implementation. If you have any trajectories that bring oil near the jetties, you should consider that oil could go through the jetties, in addition to the results of your trajectory.

Within this Location File, the extensive marsh areas are simulated as solid shoreline. Thus, GNOME will show that oil has beached on the shoreline and will not show any penetration into marsh regions. When running your scenarios, you should consider that any oil at the edge of a marsh could potentially move into the marsh.
Current Patterns
==========================================

Two current patterns are used in this Location File: one for tides and one for the nearshore circulation outside of the St. Johns River entrance. Both of these currents were created using the NOAA Circulation Analysis for Trajectory Simulations (CATS) hydrodynamic model. The tidal circulation is keyed to the main tide station at the St. Johns River entrance, which is located between the jetties. 

In this region, the alongshore flow can reverse, but most commonly flows to the north. We have scaled the offshore circulation to be approximately 10 centimeters/second (cm/s). 
References
=========================================


**Oceanographic**

National Oceanic and Atmospheric Administration, National Ocean Service. 2001. Tidal Current Tables 2002: Atlantic Coast of North America. Camden, ME: International Marine. 219 pp.

U.S. Department of Commerce, National Oceanic and Atmospheric Administration (NOAA), National Ocean Service (NOS). 2001. United States Coast Pilot 4, Atlantic Coast: Cape Henry to Key West, 33rd Edition. Washington, DC: NOS. 358 pp.


**Hydrographic**

Anderson, W. and D.A. Goolsby. 1973. Flow and Chemical Characteristics of the St. Johns River at Jacksonville, Florida. Information Circular 82. Tallahassee, FL: U.S. Geological Survey.

Morris, F.W., IV. 1995. Volume 3 of the Lower St. Johns River Basin Reconnaissance: Hydrodynamics and Salinity of Surface Water. Technical Publication SJ95-9. Palatka, FL: St. Johns River Water Management District. 362 pp.


.. _Streamflow: http://waterdata.usgs.gov/fl/nwis/current/?type=flow

USGS Real-Time Data for Florida: `Streamflow`_

This U.S. Geological Survey (USGS) site provides discharge and gage height data for many St. Johns River stations.


.. _St. Johns River Water Management District: http://www.sjrwmd.com/

`St. Johns River Water Management District`_

As one of five regional districts responsible for the protection and management of Florida's water resources, the St. Johns River Water Management District's responsibilities emphasize water quality, water supply, flood protection, and ecosystem management.


.. _Florida Department of Environmental Protection: http://www.dep.state.fl.us

`Florida Department of Environmental Protection`_

The Florida Department of Environmental Protection is the lead State agency for environmental management and stewardship. Its Division of Water Resource Management is responsible for protecting the quality of Florida's drinking water, as well as its rivers, lakes, wetlands, and beaches, and for reclaiming lands after they've been mined for minerals.


**Wind and Weather**


.. _National Weather Service - Southern Region Headquarters: http://forecast.weather.gov/MapClick.php?zoneid=FLZ025

`National Weather Service - Southern Region Headquarters`_

Current conditions and forecast for Duval County, FL.


.. _Interactive Weather Information Network (IWIN) (Text version): http://iwin.nws.noaa.gov/iwin/textversion/state/fl.html

`Interactive Weather Information Network (IWIN) (Text version)`_

Click "Zone Forecast," then scroll to view the forecast for Duval county (FLZ025).


.. _Florida State Information: http://iwin.nws.noaa.gov/iwin/fl/fl.html

Interactive Weather Information Network (IWIN): `Florida State Information`_

Click "Jacksonville" on the map to view current weather conditions at Jacksonville International Airport.


**Oil Spill Response**

.. _NOAA's Emergency Response Division: http://response.restoration.noaa.gov

`NOAA's Emergency Response Division`_

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.
