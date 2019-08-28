:orphan:

.. keywords
   Columbia, estuary, Oregon, Washington, location

.. _columbia_river_estuary_tech:

About Columbia River Estuary
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
The Columbia River Estuary is located along the boundary between the states of Washington and Oregon in the U.S. Pacific Northwest.


Background
==============================

The Columbia River Estuary is the second largest river in the United States and the largest river to flow into the eastern North Pacific. The drainage area is 660,480 km\ :sup:`2`, covering much of the U.S. Pacific Northwest and southwestern Canada (Simenstad et al., 1990). The Columbia River Estuary Location File covers the section of the Columbia River from the Pacific Ocean to approximately River Mile 47.


Current Patterns
=====================================

The Columbia River Estuary Location File contains two current patterns. One is scaled to the tidal predictions at Tongue Point, Oregon (46° 13.15'N, 123° 46.00'W). The other represents the river flow minus the mean river flow in the tidal predictions and is scaled according to the river flow rate(s) entered by the user. Since the tidal record contains a mean current of 0.2 m/s, the scaleable river flow represents the difference between the user transport and the transport in the tidal predictions. Both current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.


River Flow Estimation
======================================

**(a) Formulas Used**

The Columbia River Estuary Location File uses the total river transport at Astoria to scale the river flow.
To allow you to enter your own river flow values, the Columbia River Location File includes a modification 
of Jay's (1984) formula for calculating Columbia River flow at Astoria. The user enters values for river flow 
of the Columbia River at the Bonneville Dam and the Willamette River at Portland. Jay's (1984) formula for volume 
transport at Astoria can be written::

    If Bonneville Dam flow < 200 kcfs AND Willamette River flow < 90 kcfs, then   
        Astoria flow (t) = 4.139 kcfs + 1.003 (Bonneville Dam flow (t-6) kcfs) + 1.632 (Willamette River at Portland (t-6) kcfs)  

    If Bonneville Dam flow > 200 kcfs OR Willamette River flow > 90 kcfs, then   
        Astoria flow (t) = 103 kcfs + 1.084 (Bonneville Dam flow (t-6) kcfs) + 1.757 (Willamette River at Portland (t-6) kcfs)  

Since this function is undefined if both the Bonneville Dam and Willamette Rivers are at the decision flows (200 kcfs and 90 kcfs, respectively), 
the Columbia River Estuary Location File uses the lower-flow formula at the decision points. The use of this formula at the decision points results 
in a lower river flow and the oil moving down the river more slowly (more conservative estimate). 

**(b) Limitations on the Formulas**

Jay's formula does not explicitly take into account the differing seasonal inputs from the eastern and coastal portions of the Columbia River watershed.
The Cascade Range effectively divides the watershed into the smaller coastal portion (8%) and the much larger eastern portion (92%).
The smaller coastal sub-basin contributes 24% of the total Columbia River flow, due to orographically-generated rains on the western 
Cascade slopes and the mild wet winters, during which water is not stored for summer release. The Willamette, Lewis, and Cowlitz Rivers 
of the coastal areas have their peak flows during the winter months, while the eastern portion of the watershed contributes highest flows during 
the snow melting season (April to July). The overall Columbia River transport is highest during the spring snow melting season and lowest 
during autumn (Simenstad et al., 1990).

**(c) Time-Correcting River Flow Data**

If you choose to enter river flow values for the Columbia River at Bonneville Dam and the Willamette River at Portland, enter the observed river 
flows at these two locations six (6) hours earlier than your model start time. This is the approximate length of time the transport signal takes to 
travel to the estuary.

**(d) Scaling Current Patterns from User Entered Data**

The Columbia River Estuary Location File scales all current patterns relative to the currents at Tongue Point, Oregon.
To calculate the scale for the river current pattern, :code:`V_scale` (m/s), from the Location File's estimate of the river 
transport at Astoria, :code:`VolumeTransport` (m\ :sup:`3`\ /s) calculated in section (a), the following 
formula is used::

    V_scale = VolumeTransport / CrossSectionalArea - V_tidal,

where :code:`V_tidal` is the mean flow in the tidal record at Tongue Point (approximately 0.2 m/s), and 
:code:`CrossSectionalArea` (m3) is the river's cross sectional area at Tongue Point.


References
===============================================================


**Oceanography**

Giese, B.S. and D.A. Jay (1989). Modelling Tidal Energetics of the Columbia River Estuary. Estuarine, Coastal and Shelf Science 29: 549-571.

Jay, David (1984). Final Report on the Circulation Work Unit of the Columbia River Estuary Data Development Program: Circulatory Processes in the Columbia River Estuary. Geophysics Program, University of Washington, Seattle, WA. 169 pp. plus appendices.


Sherwood, C.R., D.A. Jay, R.B. Harvey, P. Hamilton, and C.A. Simenstad. Historical changes in the Columbia River Estuary. In: Small, L.F., ed. Columbia River: Estuarine System. Volume 25. Progress in Oceanography. New York: Pergamon Press; 1990: 299-352.

Simenstad, C.A., L.F. Small, C.D. McIntire, D.A. Jay, and C. Sherwood. Columbia River Estuary studies: An introduction to the estuary, a brief history and prior studies. In: Small, L.F., ed. Columbia River: Estuarine System. Volume 25. Progress in Oceanography. New York: Pergamon Press; 1990: 1-13.


|water_control_data_link|

Provides water control data for the several northwestern river basins. Select the Lower Columbia to view flow data for control points at Bonneville Dam (BON) and other locations. Provided by Columbia Basin Water Management Division, Northwestern Division, U.S. Army Corps of Engineers.


|water_data_link|

This site provides access to water-resources data collected at approximately 1.5 million sites in the U.S. The data includes real-time data, descriptive site information, and surface water, ground water, and water quality data.


|tides_currents_link|

Real-time water level and meteorological conditions at the Lower Columbia River PORTS (Physical Oceanographic Real-Time System) stations.

**Wind and Weather**


|nws_oregon_link|

Current conditions for Portland and Astoria, Oregon.


|nws_link|

Current weather observations, forecasts, and warnings for the entire U.S.

**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |water_control_data_link| raw:: html

   <a href="http://www.nwd.usace.army.mil/Missions/Water/Columbia/WaterControlData.aspx" target="_blank">U.S. Army Corps of Engineers - Water Control Data</a>

.. |water_data_link| raw:: html

   <a href="http://waterdata.usgs.gov/nwis" target="_blank">USGS Water Data for the Nation</a>

.. |tides_currents_link| raw:: html

   <a href="http://www.tidesandcurrents.noaa.gov/ports/index.html?port=cr" target="_blank">Lower Columbia River PORTS</a>

.. |nws_oregon_link| raw:: html

   <a href="http://www.weather.gov/view/states.php?state=or&map=on" target="_blank">NOAA National Weather Service (NWS) - Data from Oregon</a>

.. |nws_link| raw:: html

   <a href="http://www.weather.gov" target="_blank">NOAA National Weather Service</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>

