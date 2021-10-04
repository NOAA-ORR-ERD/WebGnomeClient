
:orphan:

Continuous Release Exercise
###########################

    +--------------------------------------+-----------------------------------------------+
    | |image_cont|                         | .. rubric:: Fate Exercises:                   |
    |                                      |    Continuous Release                         |
    +--------------------------------------+-----------------------------------------------+

Incident
========

On August 24, 2016 at 0800, a jet aircraft carrying 450 gallons of
JET-B crashes into a lake. The pilot and co-pilot exit the aircraft
safely and are not injured. Unfortunately, the aircraft sinks to the
bottom of the lake.

The water temperature is reported to be 69°F.

On-scene observers report a 100 yard by 10 yard sheen.

Local officials are concerned about fuel leaking from the aircraft
and would like to send a skimmer to the site. The owner of the
aircraft argues that the oil leaking from the aircraft is not
recoverable and a skimmer would be wasting both time and money.

*Local officials would like to know when the slick will dissipate
and not be observable.*

The trajectory analysis team is given the following weather
forecast:

Winds are currently from the north at less than 5 knots and are
expected to increase to 10 knots from the north later in the
afternoon.

Tomorrow, August 25, the winds are forecast to be from the northwest at 15 knots.

August 26, the winds are predicted to be from west at 5 knots or less.

The team recommends running the WebGNOME in Fate Mode, for two different scenarios:

1) Credible worst case and

2) A chronic release.


Model Input
===========

Begin on the home page by clicking "Fate Wizard" under "weathering only". Or, if you have a previous setup of the model, click the "New" menu and select "Oil Fate Wizard"

Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident a name
  #. Set the start time: 0800 on August 24, 2016
  #. Set the model duration to 2 days -- jet fuel is not very persistent.
  #. Click Save


Oil:
----

JET-B

  #. Click Oil to open the Adios Oil Database
  #. There are multiple ways to find a Jet fuel in the database. But this is probably the easiest:

     * type "jet" in the search box

  #. Select the jet fuel with the highest score. Different Jet fuels have are suited to different turbine engine types, but will behave similarly in the environment.
  #. Click the oil name to show you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.

Spill:
------

Release: 1000 gallons

Discussion
..........

*Local officials would like to know when the slick will dissipate
and not be observable.*

A credible worst case scenario might be all of the oil was released
at once.

  #. Click "Spill" to set the spill properties
  #. Select "Instantaneous Release"
  #. Set Amount Released to 1000
  #. Make sure the units are set to "gal"
  #. Load the oil file you downloaded from the ADIOS Oil Database.
  #. Click Save

Water:
------

69°F

  #. Click Water
  #. Enter 69 and choose F from the popup menu.
  #. Select 0 (Fresh Water) from the Salinity popup menu -- This is a lake.
  #. Select 5 mg/l (ocean) from the Water Sediment Load popup menu -- this low sediment load is reasonable for a lake.
  #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)". If the lake is small, you may want to limit the fetch.


Wind:
-----

Winds are currently from the north at less than 5 knots and are
expected to increase to 10 knots from the north later in the
afternoon.

Tomorrow, August 25, the winds are forecast to be from the northwest at 15 knots.

August 26, the winds are predicted to be from west at 5 knots or less.

For more detail on using the variable wind dialog, see: :ref:`Setting a Variable Wind <variable_wind_form>`

    #. Click Wind

    #. Select "Variable Wind"
    #. Set the units to knots
    #. The initial record should be set to August 24 at 0800 hours
    #. Click on the pencil to edit the first record
    #. Enter Speed as 5
    #. Enter N for North or 0 as the Direction
    #. Click the "Plus Sign" to add another record
    #. The time will be incremented by the value in the "Inc. (hrs)" setting.
    #. Repeat this process for the remainder of the weather forecast.
       10 knots from the north on the afternoon of August 24. By the
       morning of August 25, the winds will be from the northwest at 15
       knots. By the morning of August 26, the winds are forecast to be
       from west at 5 knots or less.
    #. When done, click the Check box on the last record

Click **Save** when done.

Run the model
-------------

Click "Solve"

Discussion
==========

The first view on the model run is the Oil Budget Table. This will show
that most of the oil has evaporated and dispersed within the first
8-10 hours after the release.

The trajectory analysis team recommends a chronic release scenario.
For this scenario, you could do a chronic release of 1000 gallons
over 12 hours.

#. Click the pencil icon in the upper right corner to go back to setting mode.
#. Click **Spill**
#. Click **Delete** in the lower left to delete this spill
#. Click **Spill** again to set up a new spill
#. Click "Continuous Release"
#. Select the release duration to 0 days and 12 hours.
#. Select Amount Released to 1000 gal.
#. Click **Save**
#. Click **Solve**

At this chronic release rate, the slick dissipates almost as fast as
it is leaking out. This chronic release is equivalent to spilling less than 2
gallons per minute, a rather small rate. For either the
instantaneous or continuous release, the oil will likely dissipate
in half a day. 


.. |image_cont| image:: images/contPict.gif
   :width: 71px
   :height: 86px
