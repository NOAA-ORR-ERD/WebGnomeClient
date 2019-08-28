:orphan:

.. keywords
   Mobile, Alabama, gulf, Mexico, Tennessee, Georgia, Mississippi, location

.. _mobile_bay_tech:

About Mobile Bay
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Mobile Bay is a broad, shallow bay on the Alabama coast that connects with the Gulf of Mexico. The bay serves as the drainage area for the sixth largest river system in the U.S. The drainage basin of Mobile Bay encompasses more than two-thirds of the state of Alabama and parts of Tennessee, Georgia, and Mississippi (about 43,000 square miles, or 69,202 square kilometers). The average depth of the bay is about 10 feet (3 meters), relatively shallow for a body of water that averages about 11 miles (17.7 kilometers) across and 31 miles (49.9 kilometers) long. In 1995, Mobile Bay entered the National Estuary Program of the U.S. Environmental Protection Agency. The bay has become significant on a local, regional, and national level because its abundant natural resources provide many ecological, recreational, and commercial uses.


Background
================================

Mobile Bay is a drowned river estuary that is relatively broad and shallow. The bay has a mean depth of about 10 feet (3 meters). Mobile Bay is the terminus for the Mobile River, the Tombigbee-Black Warrior River, and the Alabama-Coosa-Tallapoosa River. Man-made channels, drainage areas, and oyster reefs have significantly altered the circulation of the bay. Most (about 85%) of the water exchange between Mobile Bay and the Gulf of Mexico is through Main Pass Sound. The remainder of the water flows through Pass aux Herons into Mississippi Sound.

Ships entering the bay travel along the Main Ship Channel (40 feet, or 12 meters, deep) and the Theodore Ship Channel (27 feet, or 8 meters, deep).


Current Patterns
===================================

The Mobile Bay Location File contains four current patterns. The tidal current pattern is scaled to the tidal predictions at the entrance to Mobile Bay off Mobile Point.

Two wind-driven circulation patterns, one from north winds and another from east winds, are used to simulate wind-driven flow. These two patterns are combined linearly to produce a current pattern appropriate for the user-defined wind field. Current velocity is scaled linearly with wind stress calculated from the user's wind field. Wind-driven currents are important at low- to moderate-river flow rates; at high-river flow rates, surface current patterns become dominated by the freshwater input, and winds play a lesser role. Wind-driven current patterns are thus also scaled by river flow rates as outlined below.

The fourth current pattern represents Mobile River flow. The current pattern is referenced to the river entrance near Little Sand Island and scaled according to the flow rate information given by the user.

All current patterns were created with the NOAA Current Analysis for Trajectory Simulation (CATS) hydrodynamic application.

**River Flow Estimation**

There are four fresh water entrances to Mobile Bay. Relative flow rates for each entrance are estimated from the cross-sectional areas of each entrance and the relative velocities at each entrance.

Ftotal = FLSI + FT + FA + FB

where	
	
* Ftotal = total flow rate
* FLSI = flow rate of Mobile River at Little Sand Island
* FT = flow rate of Tensaw-Raft River entrance
* FA = flow rate of Apalachee River entrance
* FB = flow rate of Blakeley River entrance

The relative flow rate at each entrance is calculated by dividing the entrance flow rate (e.g. FLSI) by the total flow rate (Ftotal).

The currents are then scaled to the largest of these entrances near Little Sand Island. The currents are calculated by multiplying the relative flow rate of the "Mobile River at Little Sand Island" entrance by the absolute flow rate (entered by the user), then dividing by the cross-sectional area of the river entrance there:

CLSI = FLSI / Ftotal * Fabsolute) / CrossSectionalAreaLSI

The user can either select a flow rate (high, medium or low), or enter a stage height at the Barry Steam Plant. Mobile River Flow rate, *transport*, is calculated from the Barry Steam Plant stage height, *h*, using a 7th order polynomial fit to the rating curve provided by Mr. Steve Lloyd of the U.S. Army Corps of Engineers:

*transport* = 0.130783535h\ :sup:`7` − 9.30220603h\ :sup:`6` + 277.541373h\ :sup:`5` − 4487.28702h\ :sup:`4` +42196.7977h\ :sup:`3` − 228915.462h\ :sup:`2` + 687589.384h − 824448.766

**Scaling Wind-Driven Currents**

During periods of high river runoff into Mobile Bay, there are few to no correlations between surface currents and wind stress (Noble et al. 1997). Wind-driven surface currents are thus scaled to river flow such that they are larger at low river flow and decrease to zero at high river flow. The scaling factor is modeled after results presented in Noble et al. (1997), fading out wind-driven currents as river flow approaches 4000 m3/s (141 cfs):

| WindScaleFactor = 1
| RiverTransport < 106 cfs (3000 m3/s)
| WindScaleFactor = (141 - RiverTransport) / 35
| 106 cfs < RiverTransport < 141 cfs
| WindScaleFactor = 0.0
| RiverTransport > 141 cfs (4000 m3/s)
|

Wind-driven current velocities are multiplied by the WindScaleFactor to scale them with 
fresh water input.


References
====================================================

**Oceanographic**

Noble, M. A., W. W. Schroeder, W. J. Wiseman Jr., H. F. Ryan, and G. Gelfenbaum (1996). Subtidal circulation patterns in a shallow, highly stratified estuary: Mobile Bay, Alabama. *Journal of Geophysical Research*, Vol. 101 (C11), pp. 25,689-25,703.

Orlando, S. P. Jr., L. P. Rozas, G. H. Ward, and C. J. Klein (1993). **Salinity Characteristics of Gulf of Mexico Estuaries**. Silver Spring, MD: National Oceanic and Atmospheric Administration, Office of Ocean Resources Conservation and Assessment. 209 pp.

Ryan, H. F., M. A. Noble, E. A. Williams, W. W. Schroeder, J. R. Pennock, and G. Gelfenbaum (1997). Tidal current shear in a broad, shallow, river-dominated estuary. *Continental Shelf Research*, Vol. 17 (6), pp. 665-689.

Schroeder, W. W. and W. R. Lysinger (1979). **Hydrography and Circulation of Mobile Bay. Symposium on the Natural Resources of the Mobile Bay Estuary, Alabama**, H. A. Loyacano and J. P. Smith, eds., U.S. Army Corps of Engineers, pp. 75-94.

Wiseman, W. J. Jr., W. W. Schroeder, and S. P. Dinnel (1988). Shelf-Estuarine Water Exchanges between the Gulf of Mexico and Mobile Bay, Alabama. *American Fisheries Society Symposium* 3, pp. 1-8.

**Weather and On-Line Information**

|usgs_link|

Streamflow conditions for the major river systems in Alabama, including the Lower Alabama, Mobile, and Tombigbee Rivers.

|ndbc_link|

Marine weather forecast for the Pascagoula to Atchafalaya River region (out 60 nm).

The Weather Underground, Inc.: |weather_underground_link|

Weather forecast for Mobile, AL.


**Oil Spill Response**

|erd_link|

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. |usgs_link| raw:: html

   <a href="http://waterdata.usgs.gov/al/nwis/rt" target="_blank">U.S. Geological Survey (USGS) Alabama Current Streamflow Conditions</a>

.. |ndbc_link| raw:: html

   <a href="http://www.ndbc.noaa.gov/data/Forecasts/FZUS54.KLIX.html" target="_blank">National Data Buoy Center Station Information, NWS Forecast</a>

.. |weather_underground_link| raw:: html

   <a href="http://www.wunderground.com/US/AL/Mobile.html" target="_blank">Mobile, Alabama</a>

.. |erd_link| raw:: html

   <a href="http://response.restoration.noaa.gov" target="_blank">NOAA's Emergency Response Division (ERD)</a>

