
:orphan:

ICS 209 Exercise
################



Incident
========

An offshore platform crew,  watching 4 seasons of a popular cable TV show  rather than their gages, cause a three-day leak of 15 bbl/hr of a light Louisiana crude

Wind is 10 knots the first day, strengthens to 20 knots for the next two days and then returns to 10 knots, always from the north.

Water temp is 68 F under open ocean conditions.

Limited skimming equipment is employed and recovers 5/bbl hour for eight hours during the first day.

On the second day, dispersants are proposed on 20% of the surface slick with an estimated efficiency of 40%.

The on-scene command wants an ICS 209 form prepared for day 2 of the spill.

Use WebGNOME's Fate Mode to provide the data for the ICS 209 form.


Model Input
===========



Scenario Settings
-----------------

  #. Click Scenario Settings
  #. Give the incident a name
  #. Set the start time: you can use today
  #. Set the model duration to 2 days
  #. Click Save

Oil:
----

  #. Click Oil to open the ADIOS Oil Database
  #. Type "louis" in the search box
  #. Select "LIGHT LOUISIANNA SWEET, BP". This will show you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.

Spill:
------

15 bbl/hr continuous release for 3 days.

  #. Click "Spill" to set the spill properties
  #. Select "Continuous Release"
  #. Set the Spill Duration to 3 days
  #. Set the Spill Rate to 15 and the units to bbl/hr
  #. Load the oil file that you downloaded from the ADIOS Oil Database
  #. Click Save

Water:
------

Water temperature 68°F

    #. Click Water
    #. Enter 68 and choose F from the popup menu.
    #. Select 32 (avg. oceanic) from the Salinity popup menu
    #. Select 5 mg/l (ocean) from the Water Sediment Load popup menu
    #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)"

Wind:
-----

Wind is 10 knots the first day, strengthens to 20 knots for the next two days and then returns to 10 knots, always from the north.

    #. Click Wind

    #. Select the Variable Wind Tab

    #. Set "Inc.(hrs):" to 12

    #. Set the unit to knots

    #. Move your mouse over the first time in the list, and click the "pencil" icon to edit:

       * Type in 10 for the Speed, and 0 for direction (wind from the North is 0 degrees)

    #. Move your mouse over the item again, and click the "Plus sign" to add a new record. Click "below" to add one below the existing record

       * The time will have been increased by 12 hours

       * The speed an direction should be at 10 and 0 again

       * Click the check mark to save.

    #. Repeat the procedure above, but changing the speed to 20 for the next two days (4 records), then back to 10

    #. Click Save

Response Options:
-----------------

Limited skimming equipment is employed and recovers 5/bbl hour for eight hours during the first day.

On the second day, dispersants are proposed on 20% of the surface slick with an estimated efficiency of 40%.

Skimming
........

  #. Click "Response Options"
  #. Click "ADIOS Skimming"
  #. Optionally set a name for this skimmer
  #. Leave the "Time of Skim" at the model start time
  #. Set the "Duration of Skim" to 8 hours
  #. Use the slider to set the Skimmer Efficiency to 100%
  #. Set the "Recovery Rate" to 5 bbl/hr
     The Recovery Amount will be Calculated
  #. Click Save

Dispersants
...........

  #. Click "Response Options" again

  #. Click "ADIOS Dispersing"

  #. Optionally set a name for this dispersant operation

  #. Set the "Time of Dispersant Application" to 1200 the next day.

  #. Set the Duration to 2 hours

  #. Click Save



Run the model
-------------

Click "Solve"

The on-scene command wants an ICS 209 form prepared for day 2 of the spill.

  #. When the model is done running, click the "ICS209" tab.

  #. Set the operational period by clicking and dragging on the the oil budget graph.

     or

  #. Set the Start time and End Time of the Operational Period Directly

The resulting Table should have everything you need for the ICS 209 form.

