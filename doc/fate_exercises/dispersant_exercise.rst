
:orphan:

Chemical Dispersant Exercise
############################


    +--------------------------------------+--------------------------------------+
    | |image0|                             | .. rubric:: Fate Exercises:          |
    |                                      |    Chemical Dispersant               |
    +--------------------------------------+--------------------------------------+


Incident
========

At 0700 on April 4th, 2017, a collision occurred between a shrimp
boat and a freighter about 30 miles southeast of Galveston, Texas at
28° 55.9'N, 94° 21.5'W. Initial reports indicate 315 bbls of IFO 180
were lost. The National Weather Service marine forecast indicates
that the winds will be from the southwest at 10-20 knots for the
next 36 hours.

Approval has been given for the application of dispersants. Corexit
9500 has been loaded onto a DC-4, and the aircraft is on standby in
Houma, Louisiana. Unfortunately, the aircraft has a mechanical
problem with the dispersant equipment. The contractor indicates that
they will be able to disperse the next day.

**Commander Jones would like to know if the oil will emulsify to the extent that dispersants will not work.**


Model Input
===========

Begin on the home page by clicking "Fate Wizard" under "weathering only". Or, if you have a previous setup of the model, click the "New" menu and select "Oil Fate Wizard"

Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident a name
  #. Set the start time: 0700 on April 4th, 2017
  #. Set the model duration to 2 days
  #. Click Save

Oil:
----

IFO 180.

  #. Click Oil to open the ADIOS Oil Database
  #. There are multiple ways to find an IFO-180 in the database. Here are a few options:

     * type "IFO" in the search box

     * type "180" in the search box

     * select Residual Fuel Oil in the "Type" selection

  #. You probably want to select the oil with the highest score unless you know it's a more specific oil.
  #. Click the oil name to show you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.

Spill:
------
Instantaneous release of 315 bbls.

  #. Click "Spill" to set the spill properties
  #. Select "Instantaneous Release"
  #. Set Amount Released to 315
  #. Make sure the units are set to "bbl"
  #. Load the oil file that you downloaded from the ADIOS Oil Database
  #. Click Save

Water:
------

Water temperature has significant effects on evaporation rates.

Ideally, you would find a field data for water temp in the region, perhaps from the NDBC web site (for the US):

``http://www.ndbc.noaa.gov/``

As of April 4, 2017, the water temp south of Mobile is 75.6 F (station 42012).

Or use an approximation for the season

    #. Click Water
    #. Enter 75.6 and choose F from the popup menu.
    #. Select 32 (avg. oceanic) from the Salinity popup menu
    #. Select 5 mg/l (ocean) from the Water Sediment Load popup menu
    #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)"


Wind:
-----

Winds will be from the southwest at 10-20 knots for the
next 36 hours

    #. Click Wind

    #. Select the Constant Wind Tab

    #. Set the direction to "SW"

    #. Set the speed to 15 knots

    #. Adjust the "Speed Uncertainty" slider until you get "9.3 - 19.6"

    #. Click Save

Run the model
-------------

Click "Solve"


Discussion
==========

**Commander Jones would like to know if the oil will emulsify to the
extent that dispersants will not work.**

IFO-180's do not normally emulsify, however, the oil may weather and
become very viscous so that dispersant may be less effective. You
can address this issue by using the Oil Viscosity Graph.

 #. Click the Weathering tab to see the oil properties graphs.
 #. Click the Viscosity tab to see how the viscosity of the oil is changing with time.
 #. Notice that after about 8 hours, dispersability is restricted. The effectiveness of
    dispersants will be questionable. Ask your SSC for further guidance.


.. |image0| image:: images/dispersant_pict.gif
   :width: 149px
   :height: 104px
