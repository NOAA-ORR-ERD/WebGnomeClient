
:orphan:

Continuous Release Exercise
###########################

    +--------------------------------------+-----------------------------------------------+
    | |image_cont|                         | .. rubric:: Fate Exercises:                   |
    |                                      |    Continuous Release                         |
    +--------------------------------------+-----------------------------------------------+

Incident
========

On August 24, 2016 at 08:00, a jet aircraft carrying 450 gallons of
JET-B crashes into a lake. The pilot and co-pilot exit the aircraft
safely and are not injured. Unfortunately, the aircraft sinks to the
bottom of the lake.

The water temperature is reported to be 69°F.

On-scene observers report a 100 yard by 10 yard sheen.

Local officials are concerned about fuel leaking from the aircraft
and would like to send a skimmer to the site. The owner of the
aircraft argues that the oil leaking from the aircraft is not
recoverable and a skimmer would waste time and money.

**Local officials would like to know when the slick will dissipate
and not be observable.**

The trajectory analysis team is given the following weather
forecast:

Winds are currently from the north at less than 5 knots and are
expected to increase to 10 knots from the north later in the
afternoon.

Tomorrow, August 25, the winds are forecast to be from the northwest at 15 knots.

August 26, the winds are predicted to be from west at 5 knots or less.

The team recommends running WebGNOME in Fate Mode, for two different scenarios:

1) Credible worst case and

2) A chronic release.


Model Input
===========

Begin on the |Landing Page| by clicking "Oil Weathering" or in |Manual Setup Start-up Mode| by selecting "Weathering Only Setup" from the **+New** dropdown menu.

Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident a name
  #. Set the start time: 08:00 on August 24, 2016
  #. Set the model duration to 2 days
  #. Click Save


Oil:
----

JET-B

  #. Click Oil to open the ADIOS Oil Database
  #. There are multiple ways to find a jet fuel in the database, but this is probably the easiest:

     * type "jet" in the search box

  #. Select the jet fuel with the highest score. Different jet 
     fuels are suited to different turbine engine types, but will 
     behave similarly in the environment.
  #. Click the oil name to show you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.
  #. Return to the WebGNOME Oil Weathering Mode and upload the 
     file in the Oil selection window (this file can also be 
     uploaded in the Spill selection window). 

Spill:
------

1000 gallons

A credible worst case scenario is that the fuel tank was compromised 
and all of the oil was released at once.  To explore this scenario:

  #. Click "Spill" to set the spill properties.
  #. Select "Point/Line Instantaneous Release."
  #. Set Amount Released to 1000.
  #. Make sure the units are set to "gallons."
  #. Click Save.

Water:
------

69°F

  #. Click Water.
  #. Enter 69 and choose F from the popup menu.
  #. Select 0 (Fresh Water) from the Salinity popup menu.
  #. Select 5 mg/l (ocean) from the Water Sediment Load popup menu, as
     this low sediment load is also reasonable for a lake.
  #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)." 
     If the lake is small, you may want to limit the fetch.


Wind:
-----

Variable

Winds are currently from the north at less than 5 knots and are
expected to increase to 10 knots from the north later in the
afternoon.

Tomorrow, August 25, the winds are forecast to be from the northwest at 15 knots.

August 26, the winds are predicted to be from west at 5 knots or less.

For more detail on using the variable wind dialog, see: :ref:`Setting a Variable Wind <variable_wind_form>`

    #. Click Wind.
    #. Select "Variable Wind."
    #. Set the units to knots.
    #. The initial record should be set to August 24 at 08:00 hours.
    #. Click on the pencil to edit the first record.
    #. Enter Speed as 5.
    #. Enter N for North or 0 as the Direction.
    #. Click the "Plus Sign" to add another record.
    #. The time will be incremented by the value in the "Inc. (hrs)" setting.
    #. Repeat this process for the remainder of the weather forecast.
       10 knots from the north on the afternoon of August 24. By the
       morning of August 25, the winds will be from the northwest at 15
       knots. By the morning of August 26, the winds are forecast to be
       from west at 5 knots or less.
    #. When done, click the Check box on the last record.

Click **Save** when done.

Run the model
-------------

Click "Solve."

Discussion
==========

**Local officials would like to know when the slick will dissipate
and not be observable.**

The first view on the model run is the Oil Budget Table. This will show
that most of the oil has evaporated and dispersed within the first
8-10 hours after the release.  Oil can be observed at low thresholds, so this information doesn't answer the question of when the oil will not be observable; but we can share an approximation of how much oil will remain on the surface after 12 - 24 hours. 

A chronic release will have a different outcome.  For this scenario, 
we will explore the release of 1000 gallons over 12 hours.

#. Click the pencil icon in the upper right corner to go back to setting mode.
#. Click **Spill**
#. Click **Delete** in the lower left to delete this spill.
#. Click **Spill** again to set up a new spill.
#. Click "Point/Line Continuous Release."
#. Select the release duration to 0 days and 12 hours.
#. Select Amount Released to 1000 gallons.
#. Click **Save**.
#. Click **Solve**.

At this chronic release rate, the slick dissipates almost as fast as
it is leaking out. This chronic release is equivalent to spilling less 
than 2 gallons per minute, a rather small rate. For either the
instantaneous or continuous release, most of the oil will not be on the surface within half a day.


.. |image_cont| image:: images/contPict.png
   :width: 71px
   :height: 86px
