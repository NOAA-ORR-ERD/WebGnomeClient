
:orphan:

.. _sabine_examples:

Sabine Example Problems
=======================


Try out these examples to learn the basics of modeling oil spills in the
Port Arthur and Sabine Lake region of southeastern Texas. In these
examples, you will see how different tides, winds, and spill products
can affect the trajectories of oil slicks. In addition, you'll see how
model and observation limitations can be overcome by considering both
the "Best Guess" and the "Minimum Regret" (Uncertainty) solutions. This
knowledge will help you in designing your own GNOME model runs.

The following conditions hold for each of the examples:

Date: As specified in each example.

Model and Spill Start Time: As specified in each example.

Model duration: 2 days.

Uncertainty: Not included, unless specified.

Wind: None, unless specified.

Pollutant type: As specified in each example.

Spill size: 1000 barrels.

Spill Location: As specified.

**Use GNOME's Standard Mode and the Sabine Lake Location File to answer
the following questions. Be sure to carefully read and enter all the
information in each problem.**

Example 1.
----------

Wind can have a significant effect on a spill because it both
moves the oil along the water's surface and drives currents. To compare
the effects of different winds, you will simulate a spill that occurs on
August 25, 2003, at approximately 1300, with a duration of 2 days. Leave
the river flow rates for both the Sabine and Neches Rivers at “low”.
Your scenario should include winds of 10 knots in each of the cardinal
directions, changing hourly, moving first clockwise, then
counterclockwise. Set a spill of 1000 gallons of fuel oil #6 in the
middle of Sabine Lake, at approximately 29° 53.57'N, 93° 49.8'W.

(a) How does the trajectory change? How do the beach impacts differ with
the different wind conditions?

    **Hints:** The quickest way to enter the hourly winds is to use the
    Target on the right side of the Variable Winds window. First,
    because you are entering hourly winds, you should change the
    Auto-Increment Time to 1 hour. Next, click within the Target on the
    point representing the wind speed and direction you want to enter,
    then continue to hold down your mouse button. For example, to enter
    the first wind for this scenario, click on the intersection of the
    North axis and 10-knot circle. If necessary, with your mouse button
    still held down, drag to adjust the wind speed and direction to the
    combination you want. Then release the mouse button. You can add the
    remaining winds (10-knot NE, 10-knot E, etc.) in the same way.

    To easily set a spill at a particular location, simply click
    *anywhere* in the water area of the map. In the Spill Information
    window that opens, you can then enter the *exact* latitude and
    longitude of the spill. (This method is much easier than moving your
    mouse around the map and watching its location in the lower left
    corner of the window!)

    **Note:** You will need to use the spill settings from this example
    in later examples. Before moving on, save your settings as a
    Location File Save (LFS) by choosing **Save** from the GNOME
    **File** menu.

    **Answer:** The changing winds (even light, 10-knot winds) cause the
    oil to move about the lake. The final wind condition (from N) causes
    the spill to oil the southern shore of the lake (Blue Buck Point
    area). Some oil also enters Sabine Pass.

    Refloating of oil is a possibility after oil has beached. In this
    scenario, you can see some of the beached oil (represented by tiny
    x’s on the shore) refloat (changing to tiny dots on the water) and
    continue to move further away from the initial point of beach
    contact. Refloating can also occur when a spill of very heavy oil
    (having a density of 1.01 g/cc) moves through freshwater partly
    submerged, then resurfaces once it reaches the denser ocean water.

(b) Approximately how much of the lake’s shoreline on Blue Buck Point is
oiled?

    **Hints:** The quickest way to measure a distance on the map is to
    “zoom in,” then use the ruler button in the GNOME toolbar. Click the
    ruler button, then click and drag on the map to measure the oiled
    shoreline. Continue to hold down the mouse button to read the
    distance, shown in kilometers (km), miles (mi), and nautical miles
    (nm) in the lower left corner of the window.

    **Answer:** The impacts on Blue Buck Point involve approximately 5
    miles of shoreline.

Example 2.
----------

In Example 1, most of the pollutant (fuel oil #6) had beached
after 2 days. In the table below, record the mass balance details from
your Example 1 scenario. Next, change the pollutant type to a light
product, such as gasoline, and re-run the scenario. Record the new mass
balance in the table.

**Compare the shoreline impacts and review the Mass Balance to see how
the "weathering" of the pollutants affects the spill impacts.**

    **Hints:** To view the mass balance for the scenario, click the
    right-pointing triangle next to the spill description (“Fuel Oil #6:
    1000 barrels”) under **Spills** in the Summary List (the left
    section of the Map Window). Then click the right-pointing triangle
    next to “Splot Mass Balance” to view the mass balance for the “Best
    Guess” trajectory.

    To quickly change the pollutant type, double-click the spill
    description ("Fuel Oil #6: 1000 barrels") under **Spills** in the
    Summary List. In the Spill Information window, choose "gasoline"
    from the Pollutant pull-down menu.

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Gasoline    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   |                 |               |
+----------------------------+-----------------+---------------+
| Beached                    |                 |               |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   |                 |               |
+----------------------------+-----------------+---------------+
| Off map                    |                 |               |
+----------------------------+-----------------+---------------+

    **Answer:** Heavier oils remain in the environment longer than
    lighter, refined products. (Your mass balance numbers may differ
    slightly from those shown below.)

+----------------------------+-----------------+---------------+
|                            | **Fuel Oil #6   | **Gasoline    |
|                            | (barrels)**     | (barrels)**   |
+----------------------------+-----------------+---------------+
| Released                   | 1,000           | 1,000         |
+----------------------------+-----------------+---------------+
| Floating                   | 13              | 0             |
+----------------------------+-----------------+---------------+
| Beached                    | 725             | 2             |
+----------------------------+-----------------+---------------+
| Evaporated and Dispersed   | 262             | 998           |
+----------------------------+-----------------+---------------+
| Off map                    | 0               | 0             |
+----------------------------+-----------------+---------------+

    After 48 hours, beach impacts from the fuel oil #6 spill are much
    more extensive than for the gasoline spill. With the medium crude
    spill, about 72% of the spill beached on lake shorelines, about 26%
    had evaporated or dispersed, and only about 1% was still in the
    water. With the gasoline spill, beaching was negligible, and none of
    the spill was still floating. Almost 100% of the gasoline had
    evaporated or dispersed.

Example 3.
----------

We’ve seen the behavior of two different pollutants under varying
wind conditions. Next we’ll see how the gasoline spill would behave if
there was no wind. Change the wind conditions to no wind and rerun the
gasoline spill.

**How does the trajectory change with the still wind condition? How do
the beach impacts differ? After 48 hours, has any gasoline contacted the
shore?**

    **Hint:** To change the wind conditions, double-click **Wind** in
    the Summary List. In the Variable Winds window, click “Delete All”
    to remove all the winds, enter a zero-knot wind, then click “Add New
    Record”.

    **Answer:** With the winds, the oil first reaches shoreline (the
    south shore of the lake) about 27 hours after the spill occurs.
    Without the winds, the oil tends to move down the center of the
    lake, and doesn’t impact any shorelines within the 48 hours
    post-spill.

Example 4.
----------

The flow rate of the Sabine and Neches Rivers play an important
part in the circulation of the Sabine Lake region. Increase the river
flow of both rivers to high values, and examine the effects of the spill
in the lake and the gulf.

**How does the trajectory change with the higher river flow? Does oil
reach the shoreline? Is the movement of the spill faster or slower? Does
oil go off the map?**

    **Hint:** To change the river flow rates, double-click the name of
    your Location File, "Sabine Lake”, under **Location File** in the
    Summary List. In the windows that follow, you can change any of the
    conditions that you set earlier. In this case, you only want to
    change the river flow rates. In the Setting River Flow window,
    change the flow rate to "High 200 kcfs." Click "Next" to bypass
    windows that don't need to be changed.

    **Answer:** With the high river flows, the spill moves rapidly down
    the lake and through Sabine Pass, oiling sections of shoreline
    there. Within 10 hours of the spill, the spill is entering the gulf.
    Within about 43 hours, it is completely evaporated/ dispersed or off
    the map.

Example 5.
----------

Tides are an important part of the circulation in this region. In
this example, you will examine the effects of tides by starting a spill
at two different times in the tidal cycle, once at the beginning of a
flood tide and once at the beginning of an ebb tide.

**(a)** First, simulate a spill that occurs on August 27, 2003 at 2:56
am (0256) (the beginning of a flood tide), with a duration of 2 days.
River flow rates for both rivers are “low”, and there are no winds. Set
a 1000-barrel spill of non-weathering pollutant in the northern section
of Sabine Pass (29° 45.41’N, 93° 53.71’W). To view the effect of the
tide changes, click the box labeled "Show Currents" under **Model
Settings** in the Summary List.

**Note the effects of the flood tide on the spill trajectory and beach
impacts.**

    **Hints:**

    When you change the start time of a spill, you will want to change
    both the *spill* start time and the *model* start time\ **.** To do
    this, double-click the description of the spill ("Gasoline: 1000
    barrels") under **Spills** in the Summary List. In the Spill
    Information window, change the necessary details. GNOME will then
    prompt you to change the model start time to match the spill start
    time\ **.** Click "Change"**.** Because GNOME is set up to adjust
    the *model* start time to the *spill* start time, you should always
    change the spill start time first.

    Don’t forget to change the river flow rates to low.

    **Note:** In order to compare the spill trajectories, save your
    settings as a Location File Save (LFS) by choosing **Save** from the
    GNOME **File** menu.

    **Answer:** When the spill starts with the relatively weak flood
    tide, the spill moves slowly through Sabine Pass, oiling shoreline
    throughout the pass, then flowing into the gulf and off the map.

**(b)** Next, change the spill start time to 6:14 pm (1814) on the
27\ :sup:`th` (the beginning of an ebb tide).

**Compare the effects of the ebb tide with the previous example.**

    **Answer:** When the spill starts on the ebb tide, the spill doesn’t
    spread out as readily, and it moves more quickly out to the gulf.
    (If we’re lucky, from there it will move away from shore and not
    cause any further impacts.) You can see that a lot of oil refloating
    occurs in this scenario, in which oil beaches then is swept back
    into the water. After 48 hours in this scenario, the mass balance
    shows that less oil has beached in Sabine Pass (about 5%), compared
    with about 13% beaching in the flood tide scenario.

Example 6.
----------

How much impact does wind have on a spill? Using the saved flood
tide scenario from example 5 (spill 5a), try adding a west wind to see
how much wind is needed to make the oil move to the eastern shore of
Sabine Pass.

    **Answer:** A wind of 2 knots from the west causes much (about 66%)
    of the oil to beach on the eastern shore within 48 hours. A 3-knot
    wind causes about 87% of the oil to beach on eastern shorelines, and
    a 4-knot wind causes 95% of the oil to beach there. A small wind can
    have a big impact!

Example 7.
----------

Forecasts of environmental parameters are inherently uncertain.
For example, wind and weather forecasts can be "off" in the speed,
direction, or timing of the winds. GNOME supports a "Minimum Regret"
solution in addition to the "Best Guess" solution that you have been
running. The Minimum Regret solution takes into account our uncertainty
in wind, horizontal mixing, and currents.

Add the “Minimum Regret" (Uncertainty) solution to your flood tide
scenario (spill 5a) to observe the effects of this feature. You may want
to turn off the “Currents” feature.

Briefly discuss the difference between the "Best Guess" (black) and
"Minimum Regret" (red) trajectories. Why do you think this type of
information would be useful?

    **Hints:** To include the Minimum Regret (Uncertainty) solution,
    click the box labeled "Include the Minimum Regret solution" under
    **Model Settings** in the Summary List.

    **Answer:** The Minimum Regret solution (red spill particles) shows
    more extensive impacts in all directions. It shows the spill
    traveling farther and reaching shorelines over a larger area.
    Responders use the Minimum Regret trajectory to make decisions about
    how they will allocate response resources. Sometimes a highly valued
    environmental resource (e.g. an endangered species) may be important
    enough to protect, even if it has a low probability of being oiled.
