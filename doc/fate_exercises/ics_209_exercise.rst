
:orphan:

ICS 209 Form Information Exercise
#################################

Incident
========

An offshore platform crew was distracted and missed their regular gauge checks, causing a three-day leak of 15 barrels/hr of a light Louisiana crude.

Wind was 10 knots the first day, strengthening to 20 knots for the next two days and then returning to 10 knots, always from the north.

Water temp is 68°F under open ocean conditions.

Limited skimming equipment is deployed and recovers 5 barrels/hr for eight hours during the first day.

On the second day, dispersants are proposed on 20% of the surface slick with an estimated efficiency of 40%.

The on-scene command wants an ICS 209 form prepared for day 2 of the spill.

Use WebGNOME's Fate Mode to provide the data for the ICS 209 form.


Model Input
===========


Scenario Settings
-----------------

  #. Click Scenario Settings.
  #. Give the incident a name.
  #. Set the start time (the default of today is okay).
  #. Set the model duration to 2 days.
  #. Click Save.

Oil:
----

Light Louisianna Crude 

  #. Click Oil to open the ADIOS Oil Database.
  #. Type "louis" in the search box.
  #. Select "LIGHT LOUISIANNA SWEET, BP". This will show 
     you the details of the oil.
  #. Click "Download" to select the oil to use in GNOME.
  #. Return to the WebGNOME Oil Weathering Mode and upload
     the file in the Oil selection window (this file can 
     also be uploaded in the Spill selection window). 

Spill:
------

15 barrels/hr continuous release for 3 days

  #. Click "Spill" to set the spill properties.
  #. Select "Continuous Release."
  #. Set the Spill Duration to 3 days.
  #. Set the Spill Rate to 15 and the units to barrels/hr.
  #. Load the oil file that you downloaded from the ADIOS 
     Oil Database
  #. Click Save

Water:
------

Water temperature 68°F

    #. Click Water
    #. Enter 68 and choose °F from the popup menu.
    #. Select 32 (avg. oceanic) from the Salinity popup menu
    #. Select 5 mg/l (ocean) from the Water Sediment Load popup menu
    #. Leave Wave Height at "Compute from Wind (Unlimited Fetch)"

Wind:
-----

Wind is 10 knots the first day, strengthens to 20 knots for the next two days and then returns to 10 knots, always from the north.

    #. Click Wind
    #. Select the Variable Wind Tab
    #. Set "Inc. (hrs):" to 12
    #. Set the unit to knots
    #. Move your mouse over the first time in the list, 
       and click the "pencil" icon to edit:

       * Type in 10 for the Speed, and 0 for direction (wind from the North is 0 degrees)

    #. Move your mouse over the item again, and click the "Plus sign" to add a new record. Click "below" to add one below the existing record

       * The time will have been increased by 12 hours

       * The speed an direction should be at 10 and 0 again

       * Click the check mark to save.

    #. Repeat the procedure above, but changing the speed to 20 for the next two days (4 records), then back to 10

    #. Click Save

Response Options:
-----------------

Limited skimming equipment is deployed and recovers 5 barrels/hour for eight hours during the first day.

On the second day, dispersants are proposed on 20% of the surface slick with an estimated efficiency of 40%.

Skimming
........

  #. Click "Response Options"
  #. Click "ADIOS Skimming"
  #. Optionally set a name for this skimmer
  #. Leave the "Time of Skim" at the model start time
  #. Set the "Duration of Skim" to 8 hours
  #. Use the slider to set the Skimmer Efficiency to 100%
  #. Set the "Recovery Rate" to 5 bbl/hr.
     The Recovery Amount will be Calculated
  #. Click Save

Dispersants
...........

  #. Click "Response Options" again.

  #. Click "ADIOS Dispersing."

  #. Optionally set a name for this dispersant operation.

  #. Set the "Time of Dispersant Application" to 12:00 the next day.

  #. Set the Duration to 2 hours.

  #. Keep Dispersant Efficiency at the default value of 20%.

  #. Identify 100% of oil sprayed with dispersant.  

  #. Click Save.



Run the model
-------------

Click "Solve"

The on-scene command wants an ICS 209 form prepared for day 2 of the spill.

  #. When the model is done running, click the "ICS209" tab.

  #. Set the operational period by clicking and dragging on the the oil budget graph.

     or

  #. Set the Start time and End Time of the Operational Period Directly

The resulting Table should have everything you need for the ICS 209 form.

