

A Complete Annotated Example
############################


Incident
========

We use a simple example to start:

 * A leak developed in an offshore platform off the coast of Louisiana.

 * The operators estimate that they lost 10,000 gal. of a medium crude oil over a five hour period beginning at 05:00 this morning.

 * The weather forecast for the next few hours is::

    Marine Zone Forecast:

    Synopsis: HIGH PRESSURE WILL BEGIN TO MOVE EAST THURSDAY. A COLD FRONT WILL PUSH
    THROUGH THE COASTAL WATERS SATURDAY MORNING ALLOWING HIGH PRESSURE TO SETTLE
    OVER THE NORTHERN GULF AGAIN THROUGH THE FIRST PART OF NEXT WEEK.

    Tonight: Southeast winds 5 to 10 knots. Seas 1 foot or less.

    Wednesday: Southeast winds 5 to 10 knots. Seas 1 to 2 feet.

    Wednesday Night:  South winds 5 to 10 knots. Seas 1 to 2 feet.

    Thursday: South winds 5 to 10 knots. Seas 1 to 2 feet.

    Thursday Night: South winds 10 to 15 knots. Seas 1 to 3 feet.

    Friday: Southwest winds 10 to 15 knots. Seas 2 to 4 feet.
            Slight chance of showers and thunderstorms.

* Water temperature is a key control on evaporation rates -- you can find the actual ocean temperature from many in-situ instruments, such as those found on the `NOAA National Data Buoy Center web site  <http://www.ndbc.noaa.gov/>`_.  

For example, at the time of this writing, `Station FRWL1 <http://www.ndbc.noaa.gov/station_page.php?station=FRWL1>`_ is indicating a water temperature of 77.4 °F.

If there is no in-situ data available, you can use reanalysis portals like |Copernicus| as a reference for ocean temperature.


Model Input
===========

Begin on the |Landing Page| by clicking "Oil Weathering" or in |Manual Setup Start-up Mode| by selecting "Weathering Only Setup" from the **+New** dropdown menu.

Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident any name you like
  #. Set the start time.  This is only important if you are going to use data from a specific time and want the output to be in relation to that time; otherwise, you can use any time to start.  The default start time is to today. Note that WebGNOME is not time zone aware.  All input needs to be in the same time zone.
  #. Set the model duration.  There is usually no need to run the model longer than 5 days or so.
  #. Set the time step interval between weathering calculations.  The default is 15 minutes. 
  #. Click Save

Selecting an Oil:
-----------------

The ADIOS Oil Database provides a database of many oils with extensive properties required to run an oil weathering model. You can use the Web Interface to search this database to find an appropriate oil for the simulation.

"Medium Crude" in this case.

  * Click the link to |adios_db| to open the database in a new tab.

This will show a complete list of the database oils. Click the "GNOME Compatible" checkbox. Specify Type as "Crude Oil NOS" and Labels as "Medium Crude."  Clicking on an oil name in the list will select that oil. 
To select the oil to use in GNOME click the "Download" button.  Return to the Weathering Only Setup to load this .json file.

There are multiple ways to find an appropriate oil in the database. To learn how to use the interface, see the procedure here:
:ref:`Selecting an Oil <selecting_an_oil>`.


Setting the Spill conditions:
-----------------------------

10,000 gal. over five hours.

  * Click "Spill" to set the spill properties

WebGNOME supports instantaneous or continuous release.


Instantaneous Release
.....................

  #. Click "Instantaneous Release"
  #. Set Amount Released to the desired quantity
  #. Make sure to set the units appropriately.
     WebGNOME accepts units in both volume (cubic meters, gallons, barrels) and mass (tons, metric tons, kilograms). The density of the oil will be used to convert between them.
  #. You can examine or change the oil selected in the previous step from this dialog as well.
  #. Click **Save** when you are happy with the settings.

Continuous Release
..................

  #. Click "Continuous Release"

  #. Set the duration of the release. For this example, it should be set to 5 hours.
     The default is the duration of the model run.  Make sure to change this duration if you don't want unweathered oil released at the end of the model run.  Most weathering occurs in the first day.

  #. You can now either:

     * Set the Amount Released (from which Release Rate will be computed).

     or

     * Set the Release Rate (from which Amount Released will be computed).

  #. Make sure to set the units appropriately. WebGNOME accepts units in both volume (cubic meters, gallons, barrels) and mass (tons, metric tons, kilograms). The density of the oil will be used to convert between them.

  #. You can examine or change the oil selected in the previous step from this dialog as well.

  #. For this example, set:

     * The Release Duration to 5 hours
     * The Amount Released to 10,000 gal.

     You will see the Release Rate gets set to 2,000 gal/hr

  #. Click **Save** when you are happy with the settings.


Seeing the Gnome Oil Properties
...............................

If you click on the oil name it brings up the oil's properties page.

There are three tabs on the page:

 * **General Info:**  ADIOS Oil Database ID
 * **Properties:** The physical properties of the oil.
 * **Components:** This shows how the oil is broken down into pseudo components by mass fraction, boiling point, molecular weight, and density. 

**NOTE:** Most oil records are not complete. Any properties that are not included in the record that are needed by the model are estimated.

Water:
------

The Water setting allows you to set the conditions of the water body the spill is on. This includes water temperature, salinity, sediment load, and wave height.

Temperature
...........

Water temperature has significant effects on evaporation rates.

 * For this example, set the temperature to 77.4 °F.


Salinity and Sediment load
..........................

Salinity and Sediment Load affect the rate of Oil Sediment Aggregate formation. You can select representative values for ocean, avg river/estuary, or muddy river; or, you can choose  "other value" to enter your own value. 

For this example, use the default "ocean" value.


Wave Height
...........

Wave Energy has a strong effect on the dispersion of the oil. You can specify the wave height if it's known; however, there are different kinds of waves and wave turbulence. Dispersion is driven primarily by locally generated waves (white capping), and this tool captures a simplified wind-wave and dispersion from white capping. As such, if known wave height includes swell then dispersion may be best represented by computing from wind.  To compute by wind, you usually want to use the default setting of "Compute from Wind (unlimited fetch)". However, if the spill is in a fetch-limited region (such as a small bay) then you may want to use "Compute from Wind and Fetch", and then set the fetch.

* For this example, the default of "Compute from Wind (unlimited fetch)" is most appropriate.

* Click **Save** when the settings are complete.


Wind:
-----

The wind conditions have a large affect on the fate of an oil spill. Stronger winds result in faster evaporation and increased wave energy that facilitates dispersion.

* Click **Wind** to set the wind conditions

There are a number of ways to set the wind

Constant Wind:
..............

If the wind conditions are expected to be fairly steady throughout the duration of the event, a single wind speed and direction can be used. In this case, the direction does not affect the results, so you can set the speed and leave 0 degrees (N) in place.

Make sure to set the correct units.

The speed and direction of the wind can be set by typing in the values or clicking on the compass rose.

.. _variable_wind_form:

Variable Wind:
..............

If the Winds are expected to vary considerably over the duration of the spill, then you can set a variable wind record:

 * Select "Variable Wind"

The variable wind form allows you to set the wind speed and direction at any number of times for the duration of the model run. The model will interpolate in between the specific times you specify.

The "Inc.(hrs):" setting allows you to set the time step between each input. If you have a forecast that is for every 6 hours, for example, you can set "Inc.(hrs):" to 6.

For the forecast above, every 12 hours is appropriate. You can re-set the specific time if you like, the data do not have to be in even intervals.

    #. Set "Inc.(hrs):" to 12

    #. Set the unit to knots: all input needs to be in the same units.

    To set the records:

    #. Move your mouse over the first time in the list, and click the "pencil" icon to edit it: In this case, the forecast gives a range -- "5 to 10 knots". This is typical in a forecast. It is usually best to select a value in the middle of that range.

       #. Type in 7 for the Speed, and SE for direction ( or 135 -- wind from the SE is from 135 degrees from North)

       #. Click the check mark to save the record, or the "Plus Sign" to add a new record.

       #. The time will have been increased by the value you set: 12 hours in this case.

       #. The forecast in this case calls for the same speed and direction, so you can just click the check mark to save or the plus sign to add a new record.


    #. Repeat the procedure above, to match the forecast.

       * Be sure to provide enough wind data to cover the full model run length.


    #. Click Save


Run the model
-------------

Click "Solve"
