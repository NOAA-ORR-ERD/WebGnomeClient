

A Complete Annotated Example
############################


Incident
========

You need something to model in order to try it out :-)

Using a simple example to start:

 * A leak developed in an offshore platform off the coast of Louisiana.

 * The operators estimate that they lost 10000 gal. of a medium crude oil over a five hour period beginning at 0500 this morning.

 * The weather forecast for the next few hours is::

    Marine Zone Forecast:

    Synopsis: HIGH PRESSURE WILL BEGIN TO MOVE EAST THURSDAY. A COLD FRONT WILL PUSH
    THROUGH THE COASTAL WATERS SATURDAY MORNING ALLOWING HIGH PRESSURE TO SETTLE
    OVER THE NORTHERN GULF AGAIN THROUGH THE FIRST PART OF NEXT WEEK.

    Tonight: Southeast winds 5 to 10 knots. Seas 1 foot or less.

    Wednesday: Southeast winds 5 to 10 knots. Seas 1 to 2 feet.

    Wednesday:  NightSouth winds 5 to 10 knots. Seas 1 to 2 feet.

    Thursday: South winds 5 to 10 knots. Seas 1 to 2 feet.

    Thursday: NightSouth winds 10 to 15 knots. Seas 1 to 3 feet.

    Friday: Southwest winds 10 to 15 knots. Seas 2 to 4 feet.
            Slight chance of showers and thunderstorms.

* Water temperature is a key control on evaporation rates -- you can find the actual ocean temperature from many in-situ instruments, such as those found on the `NOAA National Data Buoy Center web site  <http://www.ndbc.noaa.gov/>`_.

For example, at the time of this writing, `Station FRWL1 <http://www.ndbc.noaa.gov/station_page.php?station=FRWL1>`_ is indicating a water temperature of 77.4 °F.

If there is no in-situ data available, you can use climatology to get close.


Model Input
===========

Begin on the home page by clicking "Fate Wizard" under "Weathering Only". Or, if you have a previous setup of the model, click the "New" menu and select "Oil Fate Wizard"

Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident a name -- anything you like
  #. Set the start time: If you are going to use data from a specific time, this is important. Otherwise, you can use any time to start -- it defaults to today. Note that WebGNOME is not time-zone aware -- all input needs to be in the same timezone.
  #. Set the model duration to 3 days -- usually there is no need to run the model longer than 5 days or so.
  #. Click Save

.. _selecting_an_oil:

Selecting an Oil:
-----------------

The ADIOS Oil Library provides a database of many oils with extensive properties required to run an oil weathering model. You can use the Web Interface to search this database to find an appropriate oil for the simulation.

"Medium Crude" in this case.

  * Click Oil -- This will bring up the ADIOS Oil Library interface (it may take a moment to load the first time)

There are multiple ways to find an appropriate oil in the database.

The list view presents the records that meet the current selection criteria -- this is the full set initially. This list includes a few of the records' fields:

  - **Name:** the name of the oil
  - **Location:** the region the oil came from
  - **API:** The oil's API Gravity (density)
  - **Quality Score:** an estimate of the completeness of the record,
    records with higher quality scores have more data, and will
    result in more precise forecasts in the model


The list is sorted by default alphabetically by name, but if you click on the column headers, you can see it sorted by that field.


Generics
........

The database includes a number of "generic" oils -- these are oils that represent a particular oil type, but are not from a particular field (for crudes) or a particular refinery. If all you know is the product spilled is, e.g. a "medium crude", or "diesel fuel", then choosing a generic will result in behavior typical of that type.

The Generic oils all have a "\*GENERIC" at the start of their name so they will sort to the top in the alphabetical listing.

The Search Box
..............

If you type any text in the search box, the list will be reduced to those records that have the text in any part of the name or location or oil category. So typing in "IFO" will result in finding oils from Cal**IFO**rnia, as well as any oil with "IFO" in the name, and all oils in the "Intermediate Fuel Oil" Category.

Categories
..........

The oils in the database are all sorted into various categories of oils: crude or refined products, etc. If a category is selected, only oils that fit that category will be displayed. Some of the categories are broad an overlapping, for instance, in "Refined - Light Product", you will find both Gasoline and Kerosene.

If you are looking for a product that fits within a certain category of oil types, selecting that category will help you refine your search quickly.


API slider
..........

The API slider lets you set a range you want of the oil's API gravity. Only oils that fall within that range will be displayed.


Selecting an Oil
................

Clicking anywhere on the oil record in the list will select that oil. The final selection is recorded (and the form closed) when you click the "Select" Button


Seeing the Complete Oil Record
..............................

If you move the mouse over a record, a blue button labeled "more" will show on the right hand side. Clicking that button brings you to the Oil's properties page.

There are three tabs on the page:

 * **General Info:**  Names, categories, reference, etc.
 * **Properties:** The physical properties of the oil.
 * **Distillation:** The distillation cuts of the oil. This shows how the oil is broken down by boiling point -- important for computing the evaporation of the oil.

**NOTE:** Most oil records are not complete. Any properties that are not included in the record that are needed by the model are estimated -- estimated values are shown in red so that it is clear what has been actually measured, and what has been calculated.


Setting the Spill conditions:
-----------------------------

Instantaneous release of 315 bbls.

  #. Click "Spill" to set the spill properties
  #. Select "Instantaneous Release"
  #. Set Amount Released to 315
  #. Make sure the units are set to "bbl"
  #. Leave the Confidence in Spill Amount at "Certain"
  #. Click Save

Water:
------

Water temperature has significant effects on evaporation rates.

Ideally, you would find a field data for water temp in the region, perhaps from the NDBC web site (for the US):

``http://www.ndbc.noaa.gov/``

As of May 9, 2017, the water temp south of Mobile is 75.6 F (station 42012).

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

 * Click Viscosity (located at the top of the window).
 * Notice that after 12 hours, dispersability is restricted. The effectiveness of
   dispersants will be questionable. Ask your SSC for further guidence.

** Add discussion of uncertainty**



|image1|

Dispersibility versus viscosity.

|image2| 


--------------

`|image3|\ Top <#ADIOS>`__ `|image4|\ Back <Exercise.html>`__
`Home <Contents.html>`__


.. |image0| image:: images/dispersant_pict.gif
   :width: 149px
   :height: 104px
.. |image1| image:: images/DispToVisc.gif
   :width: 186px
   :height: 83px
.. |image2| image:: images/DisperVis.gif
   :width: 333px
   :height: 321px
