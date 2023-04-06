:orphan:


.. keywords
   Galveston, trinity, west, east, bay, Mexico, gulf, Texas, location

.. _galveston_bay_tech:

About Galveston Bay
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Galveston Bay is an inlet of the Gulf of Mexico, on the southeastern shore of Texas, U.S.A. Galveston Bay's 600 square miles of surface area is commonly divided into four major sub-bays: Galveston Bay, Trinity Bay, West Bay and East Bay. Galveston Bay receives freshwater from three main tributaries (the Trinity and San Jacinto rivers and Buffalo Bayou), and receives saltwater from the Gulf of Mexico.


Background
==================================

Galveston Bay is broad and very shallow (typically only 6-12 feet deep), except for dredged channels. Winds and tides dominate the circulation in the bay. However, meteorological tides (storm surge) can significantly raise or lower sea level, causing extensive flooding and currents that can overcome the tides. Even modest storms can affect sea level more than the astronomical tides when there is a persistent onshore or offshore wind.




Current Patterns
==========================================

The Location File for Galveston Bay contains six current patterns. All current patterns were created with the NOAA Current Analysis for Trajectory Simulations (CATS) hydrodynamic model.

**1. Tidal Flow**

Tides dominate the circulation within Galveston Bay and are represented in the Location File with a current pattern driven by the tide station at Bolivar Roads, 0.5 miles north of Ft. Point (28° 20.80'N, 94° 46.10'W).

**2. River Flows**

During high runoff periods, river input is also important in driving the Galveston Bay circulation. Three main tributaries of the bay are simulated in this Location File: the Trinity River, the San Jacinto River, and Buffalo Bayou. The Trinity River is simulated as a single current pattern, while the San Jacinto River and Buffalo Bayou inputs are combined into one current pattern. Each of the river flow rates is calculated from the transport rates or stage heights that the GNOME user enters. Stage height is converted to flow rate through rating curves provided by the U.S. Geological Survey (USGS). Formulae for the conversions are detailed below. All flow calculation results are calculated in cubic feet/second (cfs) and all stage height data are assumed to be in feet.

**(a) Trinity River**
A 9th order polynomial fit to the rating curve yielded the following equation relating Trinity River flow rate, *flow_Tr*, to stage height near Liberty, Texas (station 08067000), *Tr*.

*flow_Tr* = (−3.237200497277822*10\ :sup:`−4` Tr\ :sup:`9` + 5.730374402263*10\ :sup:`−2` Tr\ :sup:`8` −4.39356026997217* Tr\ :sup:`7` +1.903947923307952*10\ :sup:`2` Tr\ :sup:`6` −5.091414135633288*10\ :sup:`3` Tr\ :sup:`5` +8.570693130551324*10\ :sup:`4` Tr\ :sup:`4` −8.785856324310122*10\ :sup:`5` Tr\ :sup:`3` +4.860075540379636*10\ :sup:`6` Tr\ :sup:`2` −9.059453584957751*10\ :sup:`6` Tr − 1.746415386161943*10\ :sup:`7`)

The calculated flow rate is used to scale the Trinity River current pattern.

**(b) San Jacinto River and Buffalo Bayou**
A 7th order polynomial fit to the rating curve yielded the following equation relating San Jacinto River flow rate, *flow_SJ*, to stage height near Sheldon, Texas (station 08072050), *SJ*.

*flow_SJ* = (−8.962534216177780*10\ :sup:`−4` SJ\ :sup:`7` + 8.090710430776*10\ :sup:`−2` SJ\ :sup:`6` −2.87704742826949*SJ\ :sup:`5` +52.01494119132756*SJ\ :sup:`4` −497.7695044340068*SJ\ :sup:`3`
+2598.874761983057* SJ\ :sup:`2` − 2873.610938411168* SJ + 2078.345299841351)

A 7th order polynomial fit to the rating curve yielded the following equation relating Buffalo Bayou flow rate, *flow_BB*, to stage height at Houston, Texas (station 08074000), *BB*.

*flow_BB* =102 (−1.67309*10\ :sup:`−9` BB\ :sup:`7` + 2.1083008*10\ :sup:`−7` BB\ :sup:`6` −1.113042545*10\ :sup:`−5` BB\ :sup:`5` +3.5192710537*10\ :sup:`−4` BB\ :sup:`4` −8.35199297309*10\ :sup:`−3` BB\ :sup:`3` +0.19852883938503* BB\ :sup:`2`
+0.59674875618414* BB − 2.70649020121096)

The flow rates for the San Jacinto River and Buffalo Bayou are combined and then converted to a scaling coefficient.

**3. Wind Driven Currents (2 current patterns)**

Wind driven currents are simulated by a linear combination of two current patterns scaled by the wind stress. One pattern was calculated with a NW wind and the other with a NE wind. 

**4. P.H. Robinson Power Plant Circulation**

The small circulation driven by the P.H. Robinson power plant flow-through circulation at San Leon is simulated by a current pattern in the Location File. Flow data were provided by Reliant Energy, which operates the P.H. Robinson facility. Permitted flow from the plant is 75.7 m3/s. For 1998 and 1999, the maximum flow was 74.6 m3/s, with an average flow of 57.4 m3/s. The average flow rate (57.4 m3/s) was used to scale the current pattern.

**5. Offshore Circulation**

An offshore circulation pattern was derived assuming a barotropic setup. The offshore circulation pattern is scaled by the alongshore (55° True) component of the offshore velocity entered by the GNOME user.


References
=========================================


**Oceanographic**

Chuang, W.-S. and W. J. Wiseman. 1983. Coastal Sea Level Response to Frontal Passages on the Louisiana-Texas Shelf. *JGR 88 (C4)*: 2625-2620.

Texas Department of Water Resources. 1981. Trinity-San Jacinto Estuary: A Study of the Influence of Freshwater Inflows. LP-113. Austin: Texas Department of Water Resources. 

Texas Department of Water Resources. 1982. Trinity-San Jacinto Estuary: An Analysis of Bay Segment Boundaries, Physical Characteristics, and Nutrient Processes. LP-86. Austin: Texas Department of Water Resources. 77 pp.

U.S. Department of Commerce. 1988. *Galveston Bay: Issues, Resources, Status, and Management*. Proceedings of a NOAA Estuary-of-the-Month Seminar held March 14, 1988, Washington, D.C., 114 pp.

Wang, K.-H. 1994. Characterization of Circulation and Salinity Change in Galveston Bay. *Journal of Engineering Mechanics 120(3)*: 557-579.

Ward, G. H. 1993. Galveston Bay Hydrography and Transport Model Validation. Technical Memorandum 93-1. Austin: Center for Research in Water Resources, Bureau of Engineering Research, College of Engineering, The University of Texas at Austin. 86 pp.

**Weather and Online Information**

.. _NOAA National Weather Service Internet Weather Source: http://weather.noaa.gov/

`NOAA National Weather Service Internet Weather Source`_

A summary of current conditions, weather forecasts, and wind data from local airports over the previous 24 hours.


.. _NOAA National Weather Service (NWS) Marine Forecasts: http://www.nws.noaa.gov

`NOAA National Weather Service (NWS) Marine Forecasts`_

Coastal marine forecasts for the U.S., subdivided by zone.


.. _Galveston, TX: http://www.wunderground.com/US/TX/Galveston.html

The Weather Underground, Inc.: `Galveston, TX`_

Weather conditions and forecasts for Galveston, TX.


**General Information**

.. _Galveston Bay Bibliography (the Bay Bib): http://repositories.tdl.org/tamug-ir/handle/1969.3/10190

`Galveston Bay Bibliography (the Bay Bib)`_

A bibliography of more than 6000 Galveston Bay references, including published and unpublished reports, books, videos, photographs, charts and maps, computer files, journal articles, press releases, manuscripts, etc. The Bay Bib is a component of Galveston Bay Information Center at Texas A&M University at Galveston.

.. _The State of the Bay: http://repositories.tdl.org/tamug-ir/handle/1969.3/26314

`The State of the Bay`_: A Characterization of the Galveston Bay Ecosystem

A comprehensive overview of Galveston Bay, published with permission of the Galveston Bay National Estuary Program.


.. _Galveston Bay Estuary Program: http://www.gbep.state.tx.us/

`Galveston Bay Estuary Program`_

A program of the Texas Natural Resource Conservation Commission, the Galveston Bay Estuary Program is a continuation of the National Estuary Program (NEP) established for Galveston Bay in 1989. This site describes the program, its projects and activities, the state of the bay, etc.


**Oil Spill Response**

.. _NOAA's Emergency Response Division (ERD): http://response.restoration.noaa.gov

`NOAA's Emergency Response Division (ERD)`_

Tools and information for emergency responders and planners, and others concerned about the effects of oil and hazardous chemicals in our waters and along our coasts.

.. _Hydrodynamic & Oil Spill Modeling - Galveston Bay: http://midgewater.twdb.state.tx.us/bays_estuaries/framegalvwind.html

`Hydrodynamic & Oil Spill Modeling - Galveston Bay`_

An animated computer model of currents in Galveston Bay provided by the Texas Water Development Board and the Texas General Land Office.


Acknowledgements
=================================

NOAA ERD would like to thank the representatives of the NOAA West Gulf River Forecast Center, U.S. Geological Survey (USGS), and Reliant Energy for their assistance in compiling data used in this Location File.
