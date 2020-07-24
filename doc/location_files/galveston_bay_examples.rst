
:orphan:

.. _galveston_examples:

Galveston Example Problems
==========================


Try out these examples to learn the basics of modeling oil spills in
Galveston Bay\ **.** Explore how changing tides, winds, river flow, and
offshore currents can affect the trajectories of oil slicks\ **.** You
will also see how model and observation limitations can be overcome by
considering both the "Best Guess" and the "Minimum Regret" (Uncertainty)
solutions\ **.** This knowledge will help you in designing your own
GNOME model runs.

**The following conditions hold for each of the examples:**

Model duration: 1 day, otherwise specified in a particular example.

Uncertainty: Not included, unless specified.

River flow: Low, unless specified.

Offshore current: 5 cm/s at 55°T, unless specified.

Wind: Constant at 0 knot, unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: 1000 barrels.

Use GNOME's Standard Mode and the Galveston Bay Location File to answer
the following questions:

Example 1.
----------

Tides are an important part of the circulation in Galveston
Bay\ **.** In this example, you will examine the effects of tides by
starting spills at two different times in the tidal cycle. You will run
these spill in GNOME twice, once at the beginning of an ebb tide and
once at the beginning of a flood tide.

**(a)** First, set up GNOME for a spill that occurs on October 18, 2000
at 0540 (the beginning of an ebb tide). Place a spill in the shipping
channel at 29° 30.43' N, 94° 52.49' W. Then set a second spill outside
of the channel at 29° 31.48' N, 94° 50.59' W.

**Describe the differences in the trajectory and beach impacts between
the two spills.**

    **Hint:** To easily set a spill at a particular location, simply
    click *anywhere* on the water area of the map\ **.** In the Spill
    Information window that opens, you can then enter the *exact*
    latitude and longitude of the spill\ **.** (This method is much
    easier than moving your mouse around the map and watching its
    location in the lower left corner of the window!)

    **Answer:** The spill location has a significant effect on the
    trajectory of these spills\ **.** The spill that occurred in the
    channel, where currents are slightly faster, moved more quickly and
    had greater shoreline impacts than the one outside the
    channel\ **.** The channel spill reached all the way to Bolivar
    Roads, beaching on Pelican Island and the northern tip of Galveston
    Island.

**Note:** You will need to use these spills in Example 2 below. Save
your settings as a Location File Save (LFS) by choosing Save from the
GNOME File menu.

**(b)** Next, change the spill start times to October 18, 2000 at 1845
(the beginning of a flood tide).

    **Hint:** When you change the start time of a spill, you will want
    to change both the *spill* start time and the *model* start
    time\ **.** To do this, double-click the description of the spill
    ("Non-Weathering: 1000 barrels") under **Spills** in the Summary
    List (the left section of the Map Window)\ **.** In the Spill
    Information window, change the Release Start Time to 1845\ **.**
    GNOME will then prompt you to change the model start time to match
    the spill start time\ **.** Click "Change"**.** Because GNOME is set
    up to adjust the *model* start time to the *spill* start time, you
    should always change the spill start time first.

    **Answer:** Now, both the spill location and the different phase of
    the tides affect the trajectory of these spills\ **.** When the
    spill starts at the beginning of the flood tide, the oil first moves
    northward with the tide, then the channel spill follows the channel
    out of the bay\ **.** The channel spill is again the faster moving
    spill, having greater shoreline impacts.

It is not necessary to save the results of the flood tide spills.

Example 2.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents\ **.** Open
the saved file for the ebb tide spills, which do not have the wind
blowing. Rerun only the spill that occurred outside the channel (29°
31.48' N, 94° 50.59' W), adding first a **5-knot ENE wind**, then adding
a **20-knot ENE wind** to the scenario.

**How do the oil's trajectory and shoreline impacts change from the
scenario without any wind?**

    **Hints: (1)** To delete a spill from GNOME, select the spill
    description ("Non-Weathering: 1000 barrels") in the Summary List,
    then choose Delete from the GNOME Item menu. **(2)** To change the
    wind conditions in GNOME, double-click **Wind** in the Summary List,
    then enter the wind speed and direction in the Constant Wind window.

    **Answer:** Even a very light wind dramatically changes the oil's
    trajectory; winds cause floating oil to beach. With the 5-knot wind,
    the spill beaches in the southwestern regions of bay from Red Fish
    Island near San Leon southward to the Texas City Dike and Pelican
    Island. With the stronger 20-knot wind, the oil quickly beaches on
    shoreline from Dickinson Bay, to Dollar Point, and almost to the
    Texas City Dike, but does not impact shoreline as close to Bolivar
    Roads.

3. Different types of pollutants weather differently. In the previous
   examples, the pollutant that spilled did not change with time (it was
   "non-weathering"). Now you will compare the effects of different
   types of pollutants by changing the pollutant type of each of these
   spills. Open your saved file for the ebb tide spills again, then
   change the pollutant type of the channel spill (at 29° 30.43' N, 94°
   52.49' W) to **gasoline** and the other spill (at 29° 31.48' N, 94°
   50.59' W) to **fuel oil #6**.

**How does the "weathering" of these pollutants affect the spill
impacts?**

    **Hint:** To view the mass balance for a spill, click the
    right-pointing arrow next to the spill description, "Gasoline: 1000
    barrels," in the Summary List. Then click the arrow next to "Splot
    Mass Balance."

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. At the end of your 24-hour prediction,
    very little of the gasoline spill remains in the bay. (If you check
    the mass balance, you'll see that about 98% of it has evaporated and
    dispersed!)

3. Forecasts of environmental parameters are inherently uncertain. For
   example, wind and weather forecasts can be "off" in the speed,
   direction, or timing of winds. GNOME supports a "Minimum Regret"
   solution in addition to the "Best Guess" solution that you have been
   running. The "Minimum Regret" solution takes into account our
   uncertainty in wind, horizontal mixing, and currents.

Rerun the previous **fuel oil #6** scenario, increasing the wind to 10
knots from the NE. This time, run GNOME with the "Minimum Regret"
solution turned on to see where the spill is expected to go, and where
else the spill *might* go.

**Briefly discuss the difference between the "Best Guess" (black) and
"Minimum Regret" (red) trajectories. Why do you think this type of
information would be useful?**

    **Hint:** To include the Minimum Regret (Uncertainty) solution,
    click the box labeled "Include the Minimum Regret solution" under
    **Model Settings** in the Summary List.

    **Answer:** The "Minimum Regret" solution shows where else the spill
    could go if the currents, winds, or other model inputs were a little
    bit different\ **.** In this case, the "Minimum Regret" solution
    shows that the spill could be more extensive than the "Best Guess"
    in all directions, with the spill rounding the tip of the Texas City
    Dyke in the south.

    Responders use both the "Best Guess" and "Minimum Regret"
    trajectories to make decisions about how they will allocate response
    resources\ **.** Sometimes a highly valued environmental resource
    (e.g. an endangered species) may be important enough to protect,
    even if it has a low probability of being oiled.

Example 5.
----------

In this example, you will examine the effects of the discharge of
the San Jacinto River and Buffalo Bayou by comparing spills that occur
with "low" and "high" flow. Set a new, non-weathering spill near
Atkinson Island at 29° 36.75' N, 94° 57.57' W. This spill occurs on
October 19, 2000 at 8:00 a.m. (0800). There is no wind when this spill
occurs. Run the spill for 2 days with (a) the San Jacinto River and
Buffalo Bayou flow "low" and (b) the San Jacinto River and Buffalo Bayou
flow "high." For these examples, you can turn off the "Minimum Regret"
solution.

**How does the oil's trajectory change when the river flow changes from
low to high?**

    **Hints: (1)** To change the model settings, double-click the
    Location File name ("Galveston Bay") under **Location File** in the
    Summary List. In the windows that follow, you can change any of the
    conditions that you set earlier\ **.** Make the necessary changes to
    the Location File settings, and the flow rate of the tributaries.
    Click "Next" to bypass windows that don't need to be changed\ **.
    (2)** To change the spill conditions, double-click the spill
    description, "Fuel Oil #6: 1000 barrels," and change the pollutant
    type, release start date and time, and release location.

    **Answer:** You should see a big difference when the tributaries'
    flow rates change to high. After 2 days, high river discharge starts
    to overcome the tides, so that the spill moves out of Galveston Bay
    through Bolivar Roads.

Example 6.
----------

This example will demonstrate how the offshore scaling can affect
the trajectory of a spill. First, set a new spill that occurs on October
19, 2000 at 0630 (the beginning of an ebb tide) at Bolivar Roads (29°
20.71' N, 94° 43.82' W). All river flows are low, and there are no winds
at this time. Then run the spill for 1 day with each of these scalings:
**15 cm/s 55°T**, **15 cm/s 235°T**, and **15 cm/s 145°T.**

**How does the offshore scaling impact the oil's trajectory?**

    **Hint:** Make the necessary changes to the spill details, model run
    duration, river flows, and offshore scaling. To change the offshore
    scaling to 15 cm/s 235°T, double-click "Offshore flow speed: 0.15
    m/s" under **Location File** in the Summary List. Click "Next" to
    bypass windows that don't need to be changed\ **.** In the Setting
    Offshore Current window, enter the given flow speed and direction.

    **Answer:** When the scaling is set to 15 cm/s 55°T, the spill moves
    upcoast (toward New Orleans). When the scaling is set to 15 cm/s
    235°T, the spill moves downcoast (toward Brownsville). At a scaling
    of 15 cm/s 145°T, the velocity is perpendicular to the coast, so
    there is no alongshore component. The resulting offshore current is
    zero. In this case, the spill moves out of Bolivar Roads on the ebb
    tide and stays there. (The distance that it travels on the tide is
    sometimes called the "exhale distance." As the water that the spill
    is floating on flows through Bolivar Roads, it spreads out from
    between the jetties. The water's depth increases and its
    tidally-driven velocity slows. Eventually, this current is
    negligible, and the spill stops moving.) On the flood tide, the
    spill moves back into the bay.

    By now, you probably know that even a light, offshore or onshore
    wind in any of these cases would result in *very* different
    shoreline impacts!
