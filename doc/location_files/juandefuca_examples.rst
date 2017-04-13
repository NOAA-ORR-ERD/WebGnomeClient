
:orphan:

.. _juandefuca_examples:

Juandefuca Example Problems
===========================


Try out these examples to learn the basics of modeling oil spills in the
Strait of Juan de Fuca. Explore how winds, current reversals, and
changing tides can affect the trajectories of oil slicks. In addition,
you'll see how model and observation limitations can be overcome by
considering both the “Best Guess” and the “Minimum Regret” (Uncertainty)
solutions. This knowledge will help you in designing your own GNOME
model runs.

**The following conditions hold for each of the examples:**

Date: As specified in each example.

Model and Spill Start Time: As specified in each example.

Model duration: 2 days.

Uncertainty: Not included, unless specified in a particular example.

Conditions at the entrance to the strait: Normal, unless specified.

Wind: No wind (constant at 0 knots), unless specified.

Pollutant type: Non-weathering, unless specified.

Spill size: 1000 barrels.

Spill: As specified in each example.

Use GNOME's Standard Mode and the Strait of Juan de Fuca Location File
to answer the following questions:

Example 1.
----------

On July 13, 2001, a vessel traveling the inbound lane of the
Strait of Juan de Fuca begins to leak medium crude while transiting from
48° 20'N, 124° 20'W to 48° 14'N, 124° W. The release occurs at 0930 and
the oil continues to leak over a two-hour period.

Try the following conditions to see how the current reversal and wind
can affect the trajectory:

**(a)** Conditions at the entrance to the strait: normal; no wind.

**(b)** Current reversal (mild to strong); no wind.

**(c)** A 10-knot east wind with any of the previous cases.

**How do the beach impacts differ in each case? How does the trajectory
change?**

    **Hints:** To easily set a line spill, click and drag the spill tool
    from the *any* starting point on the water area of the map to the
    *any* endpoint. In the Spill Information window that opens, you can
    then enter the exact latitude and longitude of the starting point
    and endpoint. (This method is much easier than moving your mouse
    around the map and watching its location in the lower left corner of
    the window!) To simulate a leak that occurs over time, check the
    "Different end release time" box, then enter the End Time (1130).

    To change the current reversal conditions, but keep all other
    Location File settings the same, double-click the name of your
    Location File, "Strait of Juan de Fuca," under **Location File** in
    the left section of the Map Window (the Summary List). The Location
    File Welcome window will appear, followed by windows with all the
    settings you had previously chosen. You only have to enter
    information that you would like to change. You can then rerun the
    model with the same spill, under the same conditions, but with a new
    current reversal condition.

    To add wind to your model, double-click **Wind** in the Summary
    List, and then enter the wind speed and direction in the Constant or
    Variable Wind window.

    **Answer: **

    **(a)** Conditions at the entrance to the strait: normal; no wind.

    The spill travels west along the strait; very little of the oil
    beaches.

    **(b)** Current reversal (mild to strong); no wind.

    As the current reversal increases, the spill is carried further
    east. Beach impacts are minimal.

    **(c)** A 10-knot east wind with any of the previous cases.

    The wind causes the oil in each scenario to beach more quickly and
    more extensively on the north coast of Washington.

**2(a)** Set a spill at the mouth of Admiralty Inlet (48° 11.35'N, 122°
48.87'W) at 0200 on July 22, 2001, with a light (10-knot) wind from the
east. Choose normal conditions at the entrance to the strait. Run
trajectories with the "minimum regret" solution for a 2-day spill
simulation first with a light product (gasoline), then with a heavy
product (fuel oil #6).

**Compare the differences in risk to Dungeness Spit (approximately 48°
10'N, 123° 8'W) from the two different products.**

    **Hints:** To remove the spill from Example 1, select the spill's
    description ("Medium Crude: 1000 barrels") under **Spills** in the
    Summary List. Under the GNOME **Item** menu, select Delete.

    To quickly set a spill at a new location, simply double-click the
    Spill Tool on the GNOME toolbar. You can then enter the *exact*
    latitude and longitude of the spill in the Spill Information window.

    To include the Minimum Regret (Uncertainty) solution, click the box
    labeled “Include the Minimum Regret solution” under **Model
    Settings** in the Summary List.

    **Note:** You will need to use the spill settings from this example
    in Example 2(c) below. Before moving on, save your settings as a
    Location File Save (LFS) by choosing **Save** from the GNOME
    **File** menu.

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
