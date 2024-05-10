
:orphan:

.. include:: ../links.rst

Chemical Dispersant Exercise
############################


    +--------------------------------------+--------------------------------------+
    | |image0|                             | .. rubric:: Fate Exercises:          |
    |                                      |    Chemical Dispersant               |
    +--------------------------------------+--------------------------------------+


Incident
========

At 07:00 on April 4th, 2017, a collision occurred between a shrimp
boat and a freighter about 30 miles southeast of Galveston, Texas at
28° 55.9'N, 94° 21.5'W. Initial reports indicate that 315 barrels  
of IFO 180 were lost. The National Weather Service marine forecast 
predicts that the winds will be from the southwest at 15 knots for the
next 36 hours.

Approval has been given for the application of dispersants. Corexit
9500 has been loaded onto a DC-4 aircraft, which is on standby in
Houma, Louisiana. Unfortunately, the aircraft has a mechanical
problem with the dispersant equipment. The contractor indicates that
they will be able to disperse the next day.

**Commander Jones would like to know if the oil will weather to the extent that dispersants will not work.**


Model Input
===========

Access the Weathering Only Mode through |Landing Page| by clicking "Oil Weathering" or in 
|Manual Mode| by selecting "Weathering Only Setup" from the **+New** dropdown menu.

Scenario Settings
-----------------

  #. Click Scenario Settings.
  #. Give the incident a name.
  #. Set the start time to 07:00 on April 4th, 2017.
  #. Set the model duration to 2 days.
  #. Keep default time step of 15 minutes.
  #. Click Save.

Oil:
----

IFO 180

The |adios_db| has a few entries for IFO 180.  Upload an oil specification file in the following way. 

  #. Click Oil to define the Substance/Oil.
  #. If a .json file for IFO-180 is not already saved, click the "ADIOS Oil Database" link.
  #. Within the database, click the box "GNOME Compatible."
  #. There are multiple ways to find an IFO-180 in the database. Here are a few options:

     * type "IFO" in the search box

     * type "180" in the search box

     * select Residual Fuel Oil in the "Type" selection

  #. You probably want to select the oil with the highest score (seventh column) unless you know 
     it's a more specific oil.  The columns can be sorted by highest to lowest score by clicking the up or 
     down arrows to the left of "Score."
  #. Click the oil name to show you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.
  #. Return to the WebGNOME Oil Weathering Mode and upload the file in the Oil selection window (this file 
     can also be uploaded in the Spill selection window). 

Spill:
------

315 barrels

We want to estimate the weathering from an instantaneous release of 315 barrels.

  #. Click "Spill" to set the spill properties.
  #. Select "Point/Line Instantaneous Release."
  #. Set Amount Released to 315.
  #. Make sure the units are set to barrels.
  #. Click Save.

Water:
------

75.6°F

Water temperature has significant effects on evaporation rates and evaporation influences emulsification.

Ideally, you would find a field data value for water temperature in the region, perhaps from the 
`NOAA National Data Buoy Center web site  <http://www.ndbc.noaa.gov/>`_.  Alternatively, if there is no 
in-situ data available, you can use reanalysis portals like |Copernicus| as a reference for ocean temperature.

As of April 4, 2017, the water temp south of Mobile is 75.6°F (station 42012).

Or use an approximation for the season

    #. Click Water
    #. Enter 75.6 and choose °F from the units menu.
    #. Select 32 psu (avg. oceanic) from the Salinity menu.
    #. Select 5 mg/l (ocean) from the Water Sediment Load  menu.
    #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)."


Wind:
-----

15 knots (SW)

Winds will be from the southwest at 15 knots for the
next 36 hours

    #. Click Wind.
    #. Select the Constant Wind Tab.
    #. Set the direction to 255 or click on the wind rose to select "SW."
    #. Set the speed to 15 knots.
    #. Click Save

Run the model
-------------

Click "Solve."


Discussion
==========

**Commander Jones would like to know if the oil will weather to the
extent that dispersants will not work.**

IFO-180 oil can become more viscous as it weathers to the point 
of rendering dispersants ineffective. The timescale of this change
can be evaluated using the Oil Viscosity Graph.

 #. Click the Weathering tab to see the oil properties graphs.
 #. Click the Viscosity tab to see how the viscosity of the oil is changing with time.
 #. If oil viscosity is above the lines of dispersibility then 
    dispersibility is restricted and the effectiveness of
    dispersants will be questionable. Ask your SSC for further guidance.


.. |image0| image:: images/dispersant_pict.png
   :width: 149px
   :height: 104px
