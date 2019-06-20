

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

Begin on the home page by clicking "Oil Fate Wizard" under "Weathering Only". Or, if you have a previous setup of the model, click the "New" menu and select "Oil Fate Wizard"

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

10,000 gal. over five hours.

  * Click "Spill" to set the spill properties

WebGNOME supports an instantaneous release (release of less than an hour or so) or a "continuous release" - for a leak over time.


Instantaneous Release
.....................

  #. Click "Instantaneous Release"
  #. Set Amount Released the desired quantity
  #. Make sure to set the units appropriately.
     WebGNOME supports both volume (bbl, gal) and mass (metric ton, kg) units. The density of the oil will be used to convert between them.
  #. The "Confidence in Spill Amount" slider lets you set how confident you are in the
     amount spilled. If it is left at "Certain", then the model will be run once with
     the amount you set. If set toward "Uncertain", the model will be run multiple times, using a range of values. In the final output, you will be able to see a range of results.
  #. You can examine or change the Oil selected from this dialog as well.
  #. Click **Save** when you are happy with the settings.

Continuous Release
..................

  #. Click "Continuous Release"

  #. Set the duration of the release. For this example, it should be set to 5 hours.
     The default is the duration of the model run -- make sure to reset that if you
     don't want such a long release.

  #. You can now either:

     * Set the Amount Released the desired quantity -- and the release rate will be computed.

     or

     * Set the Release Rate -- and the Amount Released will be computed.

  #. Make sure to set the units appropriately.
     WebGNOME supports both volume (bbl, gal) and mass (metric ton, kg) units. The density of the oil will be used to convert between them.

  #. The "Confidence in Spill Amount" slider lets you set how confident you are in the
     amount spilled. If it is left at "Certain", then the model will be run once with
     the amount you set. If set toward "Uncertain", the model will be run multiple times, using a range of values. In the final output, you will be able to see a range of results.

  #. You can examine or change the Oil selected from this dialog as well.

  #. For this example, set:

     * The Release Duration to 5 hours
     * The Amount Released to 10000 gal.

     You will see the Release Rate gets set to 2000 gal/hr

  #. Click **Save** when you are happy with the settings.


Water:
------

The Water setting allow you to set the conditions of the water body the spill is on. This includes water temperature, salinity, sediment load, and wave conditions.

Temperature
...........

Water temperature has significant effects on evaporation rates.

Ideally, you would find field data for water temp in the region -- see above.

Or you can use an appropriate estimate for the time of year -- there are some hints provided on the dialog.

 * For this example, set the temperature to 77.4 °F. Be sure to set the appropriate units!


Salinity and Sediment load
..........................

Salinity and Sediment Load effect the rate of OIl Sediment Aggregate formation. IN most cases, you can select an appropriate value from the pick list for fresh, brackish or salt water. If you do know more precise values, they can be set by selecting "other value" and typing in the value.

For this example, leave the defaults -- suitable for open ocean.


Wave Height
...........

Wave Energy has a strong effect on the dispersion of the oil. If you know the wave height in the region at the time of the spill, you can set it directly. It should be the height of the "Seas" as swell does not drive dispersion very much.

As dispersion is driven primarily by locally generated waves (white capping!) you usually want to us the default setting of "Compute from Wind (unlimited fetch)". However, if the spill is in a fetch-limited region (such as a small bay) then you may want to use "Compute from Wind and Fetch", and then set the fetch.

* For this example, the default of "Compute from Wind (unlimited fetch)" is most appropriate.

* Click **Save** when the settings are complete.


Wind:
-----

The wind conditions have a large effect on the fate of an oil spill. Stronger winds result in faster evaporation, and increase the wave energy resulting in faster dispersion.

* Click **Wind** to set the wind conditions

There are a number of ways to set the wind

Constant Wind:
..............

If the wind conditions are expected to be fairly steady throughout the duration of the event, a single wind speed and direction can be used. In this case, the direction does not effect the results, so you can set the speed, and leave 0 degrees (N) in place.

Make sure to set the correct units.

The speed and direction of the wind can be set by typing the values in or clicking on the compass rose -- you will see the values change to match where the rose is clicked.

The Speed Uncertainty slider can be set to indicate how certain you are of the wind speed --  how good you think the forecast is. If it is set to "Certain", then the model will run with the value you set. If it is set to uncertain, then the model will be run multiple times, using values higher and lower than what was set, the the results will indicate a range of possible results.

.. _variable_wind_form:

Variable Wind:
..............

If the Winds are expected to vary considerably over the duration of the spill, then you can set a variable wind record:

 * Select "Variable Wind"

The variable wind form allows you to set the wind speed an direction at any number of times for the duration of the model run. The model will interpolate in between the specific times you specify.

The "Inc.(hrs):" setting allows you to set the timestep between each input. If you have a forecast that is for every 6 hours, for example, you can set "Inc.(hrs):" to 6.

For the forecast above, every 12 hours is appropriate. You can re-set the specific time if you like, the data do not have to be in even intervals.

    #. Set "Inc.(hrs):" to 12

    #. Set the unit to knots: all input needs to be in the same units.

    To set the records:

    #. Move your mouse over the first time in the list, and click the "pencil" icon to edit it: In this case, the forecast give a range -- "5 to 10 knots". This is typical in a forecast. It is usually best to select a value in the middle of that range.

       #. Type in 7 for the Speed, and SE for direction ( or 135 -- wind from the SE is from 135 degrees from North)

       #. Click the check mark to save the record, or the "Plus Sign" to add a new record.

       #. The time will have been increased by the value you set: 12 hours in this case.

       #. The forecast in this case calls for the same speed and direction, so you can just click the check mark to save or the plus sign to add a new record.


    #. Repeat the procedure above, to match the forecast.

       * Be sure to provide enough wind data to cover the full model run length.


    #. The Speed Uncertainty slider can be set to indicate how certain you are of the wind speed --  how good you think the forecast is. If it is set to "Certain", then the model will run with the value you set. If it is set to uncertain, then the model will be run multiple times, using values higher and lower than what was set, the the results will indicate a range of possible results.

    #. Click Save


Run the model
-------------

Click "Solve"
