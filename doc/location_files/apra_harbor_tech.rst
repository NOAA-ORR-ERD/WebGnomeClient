:orphan:

.. keywords
   Apra, Guam, location

.. _apra_harbor_tech:

About Apra Harbor, Guam
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Apra Harbor is located in the western North Pacific Ocean about three-quarters of the way between Hawaii and the Philippines. Guam is the largest and southernmost island in the Mariana archipelago and is surrounded by fringing reefs.


Background
===========================

Guam's currents are heavily influenced by the North Pacific Equatorial Current, which moves westward across the Pacific between eight degrees and fifteen degrees north. Subsurface and surface current measurements in the vicinity of Luminao Reef and outside the reef at Adelup Point (Jones and Randall 1971) showed a consistent westerly movement, at least in winter. Maas (1985) describes a convergence in the longshore currents at Orote Peninsula with weak net flow inside the harbor. 

Winds are dominated by the Trade Winds, which generally come from a direction between east and northeast. Although Guam lies southeast of the heaviest tropical cyclone activity in the western Pacific (Eldredge 1983), tropical cyclones often affect Guam weather during the wet season (July through November). This Location File does not attempt to simulate currents during a tropical cyclone.

Reef systems exist along the modeled coastline. Fine-scale surface current patterns within the reefs, and between the reefs and the shore, are complex and were not modeled because of resolution considerations and lack of sufficient observational data. Also, land-sea breeze effects on nearshore circulation were not simulated.


Current Patterns
=================================

The Apra Harbor Location File contains two current patterns, one for tidal currents within the harbor, and another to represent mean flow from the North Pacific Equatorial Current. Both current patterns were created using the NOAA Current Analysis for Trajectory Simulations (CATS) model.

The simplified tidal currents used in the Location File do not represent the eddies that Maas indicates are present in the harbor. Tidal ranges within the harbor are usually less than one meter. Tidal current records were not available, so a ten-year record of simulated current time series was constructed by differentiating the tidal height file. This record was scaled to 1-1/2 knots maximal tidal current at the entrance to the harbor.

The residual currents were modeled using the NOAA hydrodynamics model Wind Analysis of Currents (WAC), which generates current patterns in part by using wind stress as a forcing function. The steady state winds were 15 knots from the east to represent the Trade Winds. The flow convergence at Orote Peninsula was simulated by assuming a set down in water surface elevation at the northern and southern part of the island compared to mean ocean levels offshore.


References
==============================================================


**Oceanography**

Maas, E. 1985. Objective Wave Height Prediction Technique for the Outer Apra Harbor. Publication details unknown.

Jones, R.S. and R.H. Randall. 1971. An Annual Cycle Study of Biological, Chemical, and Oceanographic Phenomena Associated with the Agana Ocean Outfall. Report to the Guam Water Pollution Control Commission, 67 pp.

Eldredge, L.G. 1983. Summary of Environmental and Fishing Information on Guam and the Commonwealth of the Northern Mariana Islands: Historical Background, Description of the Islands, and Review of the Climate, Oceanography, and Submarine Topography. National Marine Fisheries report PB85-111573.


**Wind and Weather**

|nws_telecommunications_link|

Current weather conditions at Guam International Airport.

|nws_tiyan_link|

Forecasts and current conditions for Guam and the Northern Marianas Islands.


|ndbc_link|

Historical data for a disestablished buoy near Guam can be viewed by year, searched by threshold conditions, or viewed as a climatic summary table (e.g., wind speed, wind gust, etc.)


|weather_underground_link|

Marine Weather for PM 151


|guam_marine_lab_link|

Offers monthly tide predictions and lunar data for Guam.

**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |nws_telecommunications_link| raw:: html

   <a href="http://w1.weather.gov/obhistory/PGUM.html" target="_blank">National Weather Service (NWS) Telecommunications Center</a>

.. |nws_tiyan_link| raw:: html

   <a href="https://www.weather.gov/gum" target="_blank">National Weather Service (NWS) Forecast Office - Tiyan, Guam</a>

.. |ndbc_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/station_page.php?station=52009" target="_blank">National Data Buoy Center - Station 52009</a>

.. |weather_underground_link| raw:: html

   <a href="http://www.wunderground.com/MAR/PM/151.html" target="_blank">The Weather Underground, Inc.</a>

.. |guam_marine_lab_link| raw:: html

   <a href="https://www.uog.edu/ml" target="_blank">University of Guam Marine Laboratory</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>

