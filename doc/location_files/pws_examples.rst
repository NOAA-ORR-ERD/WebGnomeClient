
:orphan:

.. _pws_examples:

Pws Example Problems
====================


Try out these examples to learn the basics of modeling oil spills in
Prince William Sound, Alaska. Explore how wind can move an oil spill in
a direction different from the currents, and how model and observation
limitations can be overcome by considering both the "Best Guess" and the
"Minimum Regret" (Uncertainty) solutions. This knowledge will help you
in designing your own GNOME model runs.

Note that the Location File for Prince William Sound includes an area
larger than most of the Location Files, so the model may run rather
slowly. If you don't want to wait for the model to run, you can review
the results when it is finished by slowly dragging the carat under the
Run Bar to see the hourly trajectory pictures, or you can create a movie
of the results to view as needed.

Two sets of example problems are provided. Use GNOME's Standard Mode and
the Prince William Sound Location File to complete them.

**Example Set I**

**The following conditions hold for these examples:**

Date: February 24, 1999

Model and Spill Start Time: 12:00 noon (1200)

Run duration: 2 days

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind, unless specified in a particular example.

Pollutant type: Non-weathering, unless specified.

**Initial Report:**

A crude oil spill of 1,000 barrels is reported to have occurred at 1200
February 24, 1999, located at 60° 25.44' N, 146° 49.62' W. Winds at this
time are from the NW at 15 knots and are forecast to remain the same for
the next 48 hours.

1. What is the difference in beach impacts between the "Best Guess" and
   Uncertainty model runs for 2 days?

    **Hint:** To set a spill at a particular location, double-click the
    Spill Tool. In the Spill Information window that opens, you can
    enter the exact location of the spill.

    **Answer:** The "Best Guess" trajectory shows primarily the
    northwestern part of Hinchinbrook Island with oiling. The
    Uncertainty results show potential oiling of Montague Island and
    increased oiling of Hinchinbrook Island.

Example 2.
----------

If this spill were gasoline in the same amount, what would your
trajectory show?

    **Hint:** To quickly change the pollutant type, double-click "Medium
    Crude: 1000 barrels" under "Spills" in the left section of the Map
    Window (the Summary List). In the Spill Information window that
    opens, choose gasoline from the Pollutant menu.

    **Procedure:** Turn off the "Minimum Regret" (Uncertainty) solution
    (find the appropriate box under "Model Settings" in the Summary
    List) to make the model run faster. Run a "Best Guess" gasoline
    spill, then examine the Mass Balance by clicking the carat to the
    left of the spill, "Gasoline: 1000 barrels," in the Summary List.

    **Answer:** By the end of two days, almost all of the gasoline has
    evaporated and dispersed (less than 5 splots are left). (For the
    crude oil spill, only about a third of the spill had evaporated and
    dispersed in two days.) Much less shoreline is oiled because the
    gasoline isn’t around long enough to travel very far.

Example 3.
----------

If the wind shifts to 15 knots from the north at 11:00 pm (2300)
on the first day (Feb. 24), how will your trajectory change? (Change the
pollutant type back to "medium crude.")

    **Procedure:** Be sure to choose Variable Winds in the "Choosing
    Wind Type" section. (If you have chosen a constant wind, you can
    change it to variable winds by double-clicking the name of your
    Location File, "Prince William Sound," in the Summary List. The
    Location File Welcome window will appear with all the settings you
    had previously chosen. You only have to enter information that you
    are changing, so in the "Choosing Wind Type" window, choose
    "Variable" from the pull-down menu.)

    **Answer:** Now the beach impacts of the "Best Guess" trajectory
    affect both Hinchinbrook and Montague Islands. In problem 1, the
    “Best Guess” trajectory impacted only Hinchinbrook Island, while the
    Uncertainty trajectory showed that Montague Island could possibly be
    affected as well. In this problem, you can see how a small shift in
    the wind has a dramatic effect on the spill’s trajectory.

Example Set II**

This set of examples is designed to show you differences in the
circulation patterns within Prince William Sound and how they affect oil
trajectories. You will also explore how wind and different oil types
affect spill trajectories and see how modeling the uncertainty in wind,
currents and other model inputs leads to a more complete picture of
potential oil impacts.

**The following conditions hold for this example set:**

Date: November 10, 1999

Model and Spill Start Time: 9:00 AM (0900)

Run duration: 1 day

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind, unless specified in a particular example.

Pollutant type: Non-weathering, unless specified.

Example 1.
----------

Two spills, each 1000 bbl of Fuel Oil #6, have occurred in Prince
William Sound at the following locations:

**Spill #1:** the north-central portion of the sound at 60° 40' N, 147°
0' W

**Spill #2:** between Green Island and Knight Island at 60° 20' N, 147°
32' W

**How do the trajectories of these spills differ after 24 hours? What is
the mass balance of each spill?**

    **Hint:** To quickly set the spill location, double-click the Spill
    Tool. In the Spill Information window that opens, you can enter the
    exact location of the spill.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   |                |                |
+----------------------------+----------------+----------------+

    **Answer**: The currents within the central sound are much weaker
    than in the western passages, so the northern spill spreads out more
    uniformly with some net movement to the north. The more southern
    spill spreads out in the direction of the current and travels much
    further. The mass balances for your trajectories should be similar
    to these results:

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   | 837            | 777            |
+----------------------------+----------------+----------------+
| Beached                    | 0              | 52             |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   | 163            | 171            |
+----------------------------+----------------+----------------+

Example 2.
----------

Rerun the above spills with the following change: Add a 15-knot
wind from the east.

**How does the wind affect the trajectories? Note the changes in the
mass balances.**

    **Hint:** To add the wind condition to your model, double-click
    "Wind" in the left section of the Map Window (the Summary List).
    Enter the speed and direction of the wind in the Constant Wind
    window that opens.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   |                |                |
+----------------------------+----------------+----------------+

    **Answer:** The wind makes the spills move in an easterly direction.
    Both spills have significantly more beach impacts with the wind
    blowing the oil onshore.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   | 599            | 117            |
+----------------------------+----------------+----------------+
| Beached                    | 238            | 712            |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   | 163            | 171            |
+----------------------------+----------------+----------------+

Example 3.
----------

Rerun the same spills with the following addition: Turn on the
Minimum Regret (Uncertainty) solution (red splots).

**How does this information change your forecast for potential beach
impact areas?**

    **Hint:** To quickly turn on the Minimum Regret solution, click the
    box labeled "Include the Minimum Regret solution" in the Summary
    List.

    **Answer:** Spill #1 could impact more beaches on Naked Island and
    other islands in the vicinity. Spill #2 shows impacts on more
    beaches of Knight Island, and now Evans Island and Latouche Island
    show some oiling and/or significant threat of oiling.

Example 4.
----------

Rerun the same spills once more with the following change: Make
both spills gasoline spills (keep the wind from the east at 15 knots).

**Note the trajectories and the mass balances.**

    **Hint:** To change the pollutant type of a spill, double-click its
    description under "Spills" in the Summary List. (In this case, your
    two spills are described as "Fuel Oil #6: 1000 barrels.") In the
    Spill Information window that opens, choose gasoline from the
    Pollutant menu.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   |                |                |
+----------------------------+----------------+----------------+

    **Answer:** Lighter products evaporate more quickly than heavier
    products. These gasoline spills have few beach impacts because the
    product is evaporating so quickly.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   | 15             | 19             |
+----------------------------+----------------+----------------+
| Beached                    | 0              | 3              |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   | 985            | 978            |
+----------------------------+----------------+----------------+
