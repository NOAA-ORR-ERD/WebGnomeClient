:orphan:

.. _strait_of_juan_de_fuca_examples:

Strait of Juan de Fuca Example Problems
=======================================


Try out these examples to learn the basics of modeling oil spills in the
Strait of Juan de Fuca. Explore how winds, current reversals, and
changing tides can affect the trajectories of oil slicks. In addition,
you'll see how model and observation limitations can be overcome by
considering both the “Best Guess” and the “Minimum Regret” (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

Example 1.
----------

On July 13, 2001, a vessel traveling the inbound lane of the
Strait of Juan de Fuca begins to leak medium crude while transiting from
48° 20'N, 124° 20'W to 48° 14'N, 124°W. The release occurs at 0930 and
the oil continues to leak over a two-hour period.

Try the following conditions to see how the current reversal and wind
can affect the trajectory:

**(a)** Conditions at the entrance to the strait: normal; no wind.

**(b)** Current reversal (mild to strong); no wind.

**(c)** A 10-knot east wind with either of the above cases.

Begin by selecting the Strait of Juan de Fuca Location File which will launch
the Wizard to guide you through setting up the scenario. Use the information 
in the following table to set up the intial scenario as you advance through the Wizard.

===========================   =================================================
Start time:                   July 13, 2001 at 0930.
Model duration:               2 days.
Uncertainty:                  Not included.
Strait entrance conditions:   Normal
Wind:                         No wind (constant at 0 knots).
Spill type:                   Continuous.
Time of Release:              Same as model start time.
Spill Duration:               2 hours.
Amount released:              1000 barrels.
Pollutant type:               Non-weathering.
Start Position:               48° 20’N, 124° 20’W.
End Position                  48° 14’N, 124°W.
===========================   =================================================

Once you have run the model for all three cases examine the differences in 
beach impacts between the two spills. To more easily 
visualize the difference between the spill impacts, you could take
a screenshot of the map at the end of each model run.

How do the beach impacts differ in each case? How does the trajectory
change?

**Hints:** 

1. To change the current reversal conditions, but keep all other
model settings the same **is not yet possible**. :(

2. If you only want to change one spill parameter, like the wind in Case (b),
there is no need to reload the Location File 
and step through the Wizard. Instead, use the buttons on the Menu Bar to 
switch from Map View to Setup View. In Setup View are various panels which 
allow you to edit the model setup. In the **Wind** panel, click on the edit 
(pencil) icon next to the wind entry (named "Wind #1 unless you specified 
a different name in the Wizard). Here you can change the wind direction 
and speed. (For a constant wind, the Date & Time Field is not important as the 
same values will be applied at all model times.) You may want to read the 
help available about conventions for entering wind data - these are 
available by clicking on the question mark icon at the top of the form.


Answer: 
.......

**(a)** Conditions at the entrance to the strait: normal; no wind.

The spill travels west along the strait; very little of the oil
beaches.

**(b)** Current reversal (mild to strong); no wind.

As the current reversal increases, the spill is carried further
east. Beach impacts are minimal.

**(c)** A 10-knot east wind with any of the previous cases.

The wind causes the oil in each scenario to beach more quickly and
more extensively on the north coast of Washington.


Example 2
---------

Set a spill at the mouth of Admiralty Inlet (48° 11.35'N, 122°
48.87'W) at 0200 on July 22, 2001, with a light (10-knot) wind from the
east. Choose normal conditions at the entrance to the strait. Run
trajectories with the "minimum regret" solution for a 2-day spill
simulation first with a light product (gasoline), then with a heavy
product (e.g. IFO).

Compare the differences in risk to Dungeness Spit (approximately 48°
10'N, 123° 8'W) from the two different products.

**Hints:**

1. To start over and relaunch the Wizard, select **Load Save File**
from the **New** pulldown menu.

2.To include the Minimum Regret (Uncertainty) solution, click the box
box in the **Model Settings** form.

3. Choose the Instantaneous Spill option this time. The **Select
Oil** button in the Spill form will open the ADIOS oil library.
From this interface you can select an oil that corresponds to a
gasoline. It doesn't matter which exact oil you select, as long 
as it falls into one of these broad categories.

3. To change the oil type without "starting over", switch to the Setup
View page.





    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. Beach impacts from the fuel oil spill are
    much more extensive around Dungeness Spit than for the gasoline
    spill, most of which evaporated and dispersed. (To view the mass
    balance for a scenario, click the right-pointing triangle next to
    the spill description (“Fuel Oil #6: 1000 barrels”) under **Spills**
    in the Summary List. Then click the right-pointing triangle next to
    “Splot Mass Balance” to view the mass balance for the “Best Guess”
    trajectory.)

**2(b)** Can you change the wind to make the beach impacts more
extensive?

    **Answer:** Any wind with a southerly component will certainly
    increase beach impacts. You just need one strong enough to beach the
    gasoline spill *quickly*.

**2(c)** Try starting the fuel oil spill (your saved file) at a
different part of the tide cycle. Move the start time to 1130. Change
the wind conditions back to a 10-knot wind from the east.

**How do beach impacts change? Where is the uncertainty?**

    **Hint:** When you change the start time of a spill, you will want
    to change both the *spill* start time and the *model* start
    time\ **.** To do this, double-click the description of the spill
    ("Fuel Oil #6: 1000 barrels") under **Spills** in the Summary
    List\ **.** In the Spill Information window, change the Release
    Start Time to 1200\ **.** GNOME will then prompt you to change the
    model start time to match the spill start time\ **.** Click
    "Change"**.** Because GNOME is set up to adjust the *model* start
    time to the *spill* start time, you should always change the spill
    start time first.

    **Answer:** More oil beaches in the spill that occurs at 1130 than
    in the 0200 spill (about 31% compared with about 14%, respectively).
    GNOME's "Minimum Regret" solution takes into account uncertainty in
    wind, horizontal mixing, and currents. Areas that are uncertain
    after this spill include regions of Dungeness Spit, the western
    shoreline of Sequim Bay, Protection Island, and Port Townsend.
