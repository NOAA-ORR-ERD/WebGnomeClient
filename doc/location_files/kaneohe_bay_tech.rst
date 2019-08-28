:orphan:

.. keywords
   Kaneohe, Oahu, Hawaii, location

.. _kaneohe_bay_tech:

About Kaneohe Bay
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Kaneohe Bay is located on the windward (northeast) side of the island of Oahu, about 20 miles from Honolulu. The bay is about 13 km long by 4 km wide and has an average depth of about 8 m. Kaneohe Bay is protected from strong offshore swell by a barrier reef that marks the windward margin of the bay. This protection allows extensive coral reef development within the bay, including patch reefs and fringing reefs.


Background
===================================

Tidal currents and wind-driven currents were modeled inside Kaneohe Bay; however, both currents are weak and we would expect windage (winds blowing directly on the floating oil) to dominate oil movement within the bay. Freshwater runoff data from the small streams that enter the bay were studied, but were not used in the Location File because of their insignificant effects on surface currents within the bay. 

Extensive reef systems are found within the bay and along the outer coastline. Interactions between these reefs, breaking waves, and the coastal current lead to highly variable small-scale currents on and near the reefs. These small-scale currents were not modeled in this Location File. The model also does not take into account the extensive areas within the bay that are exposed during low tides. Current patterns and shorelines are not adjusted for variable shorelines due to tide changes.

Offshore currents outside the bay were modeled in two parts. The first part is the shelf and shelf break, and the second part is the deep waters off the shelf.

Currents on the shelf and shelf break have two components: a tidal current with an average tidal excursion of about 2 miles on the outer coast and 1/2 mile inside the bay, and a wind-driven geostrophic flow. The wind-driven geostrophic flow was scaled over time to the along-shore component of the wind.

For the deep waters off the shelf, the larger-scale North Central Pacific Flow controls this highly variable flow. Unpredictable eddies of variable sizes and speeds routinely transit the area and tend to dominate the currents.


Current Patterns
===============================================

The Kaneohe Bay Location File contains three current patterns.

No tidal current stations were available to use in scaling the tidal predictions. Instead, the tidal current pattern was scaled to the tidal current time file derived from a tide height station in the northwestern section of the bay (near 21° 30.11'N, 157° 49.17'W). The GNOME team differentiated the tide heights to get the times of the floods and ebbs, and then scaled the magnitudes of the floods and ebbs to measurements presented by Neimeyer (1977). At times, uncertainties in the tidal currents may be as large as 0.1–0.2 knots locally.

The offshore, along-shelf currents are weak next to the coast, and strong seaward off the shelf break. These currents are unpredictable and may even reverse directions at times. This variability is taken into account through a high uncertainty in the strength of the current.

Wind-driven currents play an important role in circulation near the Hawaiian Islands. The wind-driven currents in the Kaneohe Bay Location File are estimated from a geostrophic adjustment to SE winds. These currents are scaled to an offshore current value of 1/3-knot for a 20-knot SE wind at an offshore reference point (21° 32.06'N, 157° 44.26'W).

All current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.

The Kaneohe Bay Trajectory Analysis Planner (|tap_link| ™) is available free of charge from the Emergency Response Division (ERD) of NOAA OR&R. This program and its documentation can be used for oil spill planning and risk analysis. More information is available at |url_link|.

.. |tap_link| raw:: html

   <a href="http://response.restoration.noaa.gov/tap" target="_blank">TAP II</a>

.. |url_link| raw:: html

   <a href="http://response.restoration.noaa.gov/tap" target="_blank">http://response.restoration.noaa.gov/tap</a>




References
===============================================

**Oceanography**

Bathen, Karl H. 1968. *A Descriptive Study of the Physical Oceanography of Kaneohe Bay, Oahu, Hawaii*. Honolulu: Department of Oceanography, University of Hawaii.

Bathen, Karl H. 1978. *Circulation Atlas for Oahu, Hawaii*. Honolulu: University of Hawaii Sea Grant College Program.

Laevastu, Taivo, Don E. Avery, and Doak C. Cox, 1964. *Coastal Currents and Sewage Disposal in the Hawaiian Islands*. Honolulu: University of Hawaii.

Neimeyer, Gary C. 1977. *Numerical Methods for the Simulation of Hydrodynamic and Ecological Processes, with Application to Kaneohe Bay, Oahu, Hawaii*. Ph.D. Thesis. Honolulu: Department of Oceanography, University of Hawaii.

National Oceanic and Atmospheric Administration. 2000. Trajectory Analysis Planner (TAP II™): Kaneohe Bay Technical Documentation, 46 pp.


|oceanwatch_link|

A holding of oceanographic satellite remote sensing datasets, as well as some of the near-real time satellite-based products available for the Pacific region. The NOAA OceanWatch - Central Pacific website provides access to their Live Access Server, THREDDS/OPeNDAP server, and data catalog.


**Weather and Weather**


National Weather Service Forecast Office: |nws_link|

Current conditions and forecasts for the Hawaiian Islands.


National Data Buoy Center: |ndbc_marine_link|

Click a station on the map to view marine data from moored buoy and C-MAN stations in Hawaiian coastal waters.

National Data Buoy Center: |ndbc_nws_link|

Coastal waters forecast, synopsis for Hawaiian coastal waters.


The Weather Underground, Inc. - |weather_underground_link|

The Weather Underground, Inc. - |weather_underground_marine_link|


**General Information**


|himb_link|

A world-renowned research institute situated on Coconut Island in Kaneohe Bay. Ongoing research at HIMB covers many disciplines of tropical marine science.


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |oceanwatch_link| raw:: html

   <a href="http://oceanwatch.pifsc.noaa.gov" target="_blank">NOAA OceanWatch - Central Pacific</a>

.. |nws_link| raw:: html

   <a href="http://www.prh.noaa.gov/pr/hnl" target="_blank">Honolulu, HI</a>

.. |ndbc_marine_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/maps/Hawaii.shtml" target="_blank">Hawaiian Islands Recent Marine Data</a>

.. |ndbc_nws_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/data/Forecasts/FZHW50.PHFO.html" target="_blank">NWS Forecast</a>

.. |weather_underground_link| raw:: html

   <a href="http://www.wunderground.com/US/HI/Kaneohe.html" target="_blank">Current conditions and forecast at Kaneohe MCBH, Hawaii</a>

.. |weather_underground_marine_link| raw:: html

   <a href="http://www.wunderground.com/MAR/PH/150.html" target="_blank">Marine forecast for Hawaiian waters</a>

.. |himb_link| raw:: html

   <a href="http://www.hawaii.edu/HIMB" target="_blank">Hawaii Institute of Marine Biology (HIMB) at Coconut Island</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>


