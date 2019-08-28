:orphan:

.. keywords
   Boston, location

.. _boston_and_vicinity_tech:

About Boston and Vicinity
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

The Boston and Vicinity Location File extends from Boston Harbor east through Massachusetts Bay (70° 32.4' W) and from Emerson Point on Cape Ann in the north (42° 38' N), to south of Scituate Harbor in the south (42° 11.1' N). The two busiest harbors in this area are Boston Harbor as the primary shipping harbor and Gloucester Harbor as an anchorage for fishing vessels.


Background
==============================

Massachusetts and Cape Cod Bays form a semi-enclosed basin open on the eastern side to the Gulf of Maine. Massachusetts Bay is relatively shallow (mean depth of 35 m) and is separated from the Gulf of Maine by Stellwagen Bank, a shallow, submarine platform about 30 m deep formed by receding glaciers about 18,000 years ago. Two channels connect Massachusetts Bay with the Gulf of Maine. The "North Channel" has a sill depth of 60 m and lies between Cape Ann and Stellwagen. The "South Channel" is about 50 m deep and lies between Race Point (the northern tip of Cape Cod) and Stellwagen. 

Boston Harbor (mean depth 4.9 m) has two channels connecting it with Massachusetts Bay: President Roads in the north and Nantasket Roads in the south. These channels are about 15 m deep (Signell et al. 2000). The coastline and bathymetry of both Massachusetts Bay and Boston Harbor are relatively complex, with many rocky outcrops and islands. Boston Harbor currents are primarily tidal. The dominant subtidal currents are wind-driven and influenced by the Gulf of Maine circulation and freshwater fluxes. Wind-driven currents are particularly important within Boston Harbor and in shallow coastal areas in Massachusetts Bay. 

There are no major rivers entering Massachusetts Bay. The single largest river entering Boston Harbor directly is the Charles River. The Charles-Mystic-Neponset river system does not input enough fresh water to drive surface currents that are significant when compared to the tides. River-driven currents are typically 1-2% as strong as tidal currents. Current patterns were therefore not included for the Charles-Mystic-Neponset river system.

Both Massachusetts Bay and Boston Harbor have a strong seasonal cycle in water properties. Well-mixed conditions prevail in the winter; during the summer, however, there is strong stratification due to both riverine input (mid through late spring and from the rivers emptying into the Gulf of Maine) and seasonal warming (Geyer et al. 1992).

Wastewater outflow from the two former treatment facilities at Nut Island and Deer Island contributed a significant portion of the annual mean freshwater flux to Boston Harbor. This input resulted in surface currents that were significant near the outflow points (Geyer et al. 1992). Because these facilities are no longer in operation, these currents are not modeled in this Location File.

The new Effluent Outfall Tunnel will discharge effluent at a depth of 30 m, at a distance of 14 km out in Massachusetts Bay. There are several diffusers along the underwater pipe. Density-driven mean currents from the new outflow are predicted to be 2-4 cm/s at the surface in the winter and at the pycnocline (15-20 m depth) in the summer. The surface current is predicted to spiral out clockwise within about 5 km from the outflow site (Signell et al. 2000). These currents generally have very little effect on oil spill trajectories. Within this Location File, currents are simulated for the outflow, and the user is given the option of including this current pattern in case he/she wants to simulate a wintertime spill directly over the outflow in no-wind conditions.


Current Patterns
=======================================

The Boston and Vicinity Location File contains six current patterns: tides, wind-driven currents (2 components), Gulf of Maine, Massachusetts coastal current, and sewage outfall. All current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.

The tidal current pattern is scaled to the tidal predictions near Point Allerton, near the mouth of Nantasket Roads (42° 19.28' N, 70° 53.25' W). There are strong asymmetries between ebb and flood tides near many outcrops and islands in Boston Harbor. The residual tidal currents that result from these asymmetries are not modeled in this Location File.

Two wind-driven circulation patterns are used to simulate wind-driven flow: one pattern from NW winds and another from SW winds. These two patterns are combined linearly to produce a current pattern appropriate for the user-defined wind field. 

Another current pattern represents the arm of the Gulf of Maine circulation that enters Massachusetts Bay and flows in a counterclockwise direction, then back out near Race Point. The current pattern is referenced to a deep point near Cape Ann (42° 33' N, 70° 40'W) and scaled to a mean flow rate of 4 cm/s. The observed variability in this current is of the same order of magnitude as the mean flow (Geyer et al. 1992). This Location File uses an along-current uncertainty of 80% and a cross-current uncertainty of 20% for the Gulf of Maine circulation to account for the high variability.

Spring runoff in rivers that enter the Gulf of Maine, particularly the Merrimack River to the north, results in an increase in the counterclockwise circulation in Massachusetts Bay (Geyer et al. 1992). This circulation, sometimes referred to as the Massachusetts Coastal Current (MCC), is represented in the Location File by a current pattern that is scaled to a maximum flow of 15 cm/s in May and slower velocities of 12 cm/s and 4 cm/s in April and June, respectively. Although there is frequently another high pulse of freshwater input from the Merrimack River in the fall, this pulse does not lead to a corresponding increase in the MCC due to low stratification during fall. The reference point for this current pattern lies just east of Gloucester (42° 35' N, 70° 39' W). Year-to-year variability in this current is represented by a 50% along-current and 20% cross-current uncertainty in the Location File.

Sewage outfall is predicted to have little, if any, effect on the surface transportation of oil in the region, with the possible exception of a wintertime scenario within 5 km of the outflow location with little or no winds. If the user chooses to simulate these effects in GNOME, the currents are scaled to 4 cm/s at the outfall exit.


References
==============================================================


**Oceanography**

Bogden, P. S., P. Malanotte-Rizzoli and R. P. Signell, 1996. Open-ocean boundary conditions from interior data: Local and remote forcing of Massachusetts Bay. *Journal of Geophysical Research*, 101 (C3), pp. 6487-6500.

Geyer, W. R., G. B. Gardner, W. S. Brown, J. Irish, B. Butman, T. Loder, and R. P. Signell, 1992. *Physical Oceanographic Investigation of Massachusetts and Cape Cod Bays. Technical Report MBP-92-03*, Massachusetts Bays Program, U.S. EPA Region I/Massachusetts Coastal Zone Management Office, Boston, Massachusetts, 497 pp.

Lynch, D. R., M. J. Holboke, and C. E. Naimie, 1997. The Maine coastal current: spring climatological circulation. *Continental Shelf Research*, 17 (6), pp. 605-634.

Signell, R. P. and B. Butman, 1992. Modeling Tidal Exchange and Dispersion in Boston Harbor. *Journal of Geophysical Research*, 97 (C10), pp. 15,591-15,606.

Signell, R. P. and J. H. List, 1997. Effect of Wave-Enhanced Bottom Friction on Storm-Driven Circulation in Massachusetts Bay. Journal of Waterway, Port, Coastal, and Ocean Engineering, September/October, pp. 233-239. 

Signell, R. P., H. L. Jenter, and A. F. Blumberg, 1996. Circulation and Effluent Dilution Modeling in Massachusetts Bay: Model Implementation, Verification and Results, U. S. Geological Survey Open File Report 96-015.

Signell, R. P., H. L. Jenter and A. F. Blumberg, 2000. Predicting the Physical Effects of Relocating Boston's Sewage Outfall. Estuarine, Coastal and Shelf Science, 50, pp. 59-72.

|usgs_link|

Links to oceanographic information about the region.


**Wind and Weather**

|ndbc_link|

Weather conditions for Massachusetts Bay east of Boston Harbor


|nws_link|

Marine forecasts, current conditions, and other weather products for the Boston area.


**Sewer System and Circulation**

|usgs_modeling_link|

Links to models and animations of USGS modeling of the Boston Harbor/Massachusetts Bay region. Includes R. P. Signell's model simulations of sewage effluent concentrations in Boston Harbor and Massachusetts Bay.


|mwra_link|

Provides an overview of how the MWRA's sewer system works and describes its major projects.

|usgs_report_link|

Online version of U.S. Geological Survey Open File Report 96-015.


|usgs_water_data_link|

Obtain real-time water data for the Charles River at Waltham, Ma (Site no. 01104500).


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |usgs_link| raw:: html

   <a href="http://woodshole.er.usgs.gov" target="_blank">USGS Woods Hole Field Center</a>

.. |ndbc_link| raw:: html

   <a href="http://seaboard.ndbc.noaa.gov/station_page.php?station=44013" target="_blank">National Data Buoy Center - Station Information for Station 44013</a>

.. |nws_link| raw:: html

   <a href="http://www.nws.noaa.gov/er/box" target="_blank">National Weather Service (NWS) - Boston, MA</a>

.. |usgs_modeling_link| raw:: html

   <a href="http://woodshole.er.usgs.gov/operations/modeling" target="_blank">Coastal Ocean Modeling at the U.S. Geological Survey (USGS) Woods Hole Field Center</a>

.. |mwra_link| raw:: html

   <a href="http://www.mwra.state.ma.us/03sewer/html/sew.htm" target="_blank">Massachusetts Water Resources Authority (MWRA) Sewer System</a>

.. |usgs_report_link| raw:: html

   <a href="http://woodshole.er.usgs.gov/operations/modeling/mbayopen/mbayopen.html" target="_blank">Circulation and Effluent Dilution Modeling in Massachusetts Bay</a>

.. |usgs_water_data_link| raw:: html

   <a href="http://waterdata.usgs.gov/ma/nwis/uv?site_no=01104500" target="_blank">USGS Real-Time Water Data for Massachusetts</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>

