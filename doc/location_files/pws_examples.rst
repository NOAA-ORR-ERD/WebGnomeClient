
:orphan:

.. _pws_examples:

Prince William Sound Example Problems
=====================================


Try out these examples to learn the basics of modeling oil spills in
Prince William Sound, Alaska. Explore how wind can move an oil spill in
a direction different from the currents, and how model and observation
limitations can be overcome by considering both the "Best Guess" and the
"Minimum Regret" (Uncertainty) solutions. This knowledge will help you
in designing your own WebGNOME model runs.

Two sets of example problems are provided. Begin by loadidng 
the Prince William Sound Location File.

Example Set I
=============

Example 1
---------

Use the spill report below to fill in information in the Location File Wizard.

**Initial Report:**

A crude oil spill of 1,000 barrels is reported to have occurred at 1200
February 24, 1999, located at 60° 25.44' N, 146° 49.62' W. Winds at this
time are from the NW at 15 knots and are forecast to remain the same for
the next 48 hours. Water temperature is ~46°F.

What is the difference in beach impacts between the "Best Guess" and
Uncertainty model runs for 2 days?

**Hints:**

1. Choose any medium crude from the Oil Library. 
 
2. The Uncertainty or "Minimum Regret" solution is on by default (there is a checkbox 
to turn it on/off in the Model Settings Wizard dialog box). If you want to rerun the 
same scenario with or without the Uncertainty solution, it can also be accessed by 
using the buttons on the Menu Bar to switch from Map View to Setup View. In Setup View 
you can edit any of the parameters previously specified in the Wizard.


Answer:
-------

The "Best Guess" trajectory shows primarily the
northwestern part of Hinchinbrook Island with oiling. The
Uncertainty results show potential oiling of Montague Island and
increased oiling of Hinchinbrook Island.

Example 2
---------

If this spill were gasoline in the same amount, how would the beach impacts differ?

**Hints:** 

1. To quickly change the pollutant type, switch to Setup View and edit the 
spill by clicking on the edit (pencil) icon in the Spill panel. Use the
Change Oil button to reopen the Oil Library and select a gasoline.

2. Turn off the "Minimum Regret" (Uncertainty) solution
to make the model run faster. Run a "Best Guess" gasoline
spill, then examine the Mass Balance by switching to Fate View.

Answer:
-------

By the end of two days, almost all of the gasoline has
evaporated and dispersed. (For the crude oil spill, only about a 
third of the spill had evaporated and dispersed in two days.) 
Much less shoreline is oiled because the
gasoline isn’t around long enough to travel very far.

Example 3.
----------

If the wind shifts to 15 knots from the north at 11:00 pm (2300)
on the first day (Feb. 24), how will your trajectory change? (Change the
pollutant type back to a medium crude.)

**Hint:** 

Open the Wind settings panel by clicking on the edit (pencil) icon at the bottom.
If you entered the wind as a "Constant Wind" previously, you will need to switch to
the "Variable Wind" tab. Here you will see a list of wind values (with only one 
entry). By hovering over the first list item you will get an option to add another row
(+ icon). Choose to add another row below and then enter the additional wind
information for this example.

**THIS REQUIRES A FIX TO THE WIND TIME DEFAULTS!!!**

Answer:
-------

Now the beach impacts of the "Best Guess" trajectory
affect both Hinchinbrook and Montague Islands. In problem 1, the
“Best Guess” trajectory impacted only Hinchinbrook Island, while the
Uncertainty trajectory showed that Montague Island could possibly be
affected as well. In this problem, you can see how a small shift in
the wind has a dramatic effect on the spill’s trajectory.

Example Set II
==============

This set of examples is designed to show you differences in the
circulation patterns within Prince William Sound and how they affect oil
trajectories. You will also explore how wind and different oil types
affect spill trajectories and see how modeling the uncertainty in wind,
currents and other model inputs leads to a more complete picture of
potential oil impacts. Start by reloading the Prince William Sound
Location File to activate the Wizard. 

**The following conditions hold for this example set:**

Date: November 10, 1999

Model and Spill Start Time: 9:00 AM (0900)

Run duration: 1 day

Uncertainty: Not included, unless specified in a particular example.

Wind: No wind, unless specified in a particular example.


Example 1.
----------

Two spills, each 1000 bbl of Intermediate Fuel Oil (IFO), have occurred in Prince
William Sound at the following locations:

**Spill #1:** the north-central portion of the sound at 60° 40' N, 147°
0' W

**Spill #2:** between Green Island and Knight Island at 60° 20' N, 147°
32' W

How do the trajectories of these spills differ after 24 hours? What is
the mass balance of each spill?

**Hint:** 

1. The Location File Wizard will only prompt for the addition of one spill. To
add the second spill, switch to Setup View and click the Create Spill (+) icon at 
the top right corner of the Spill panel.

2. To see the mass balance for individual spills you will need to run the spills 
individually. You can set them both up and then make them active/inactive by using 
the Advanced Settings options. First, select the Edit Spill (pencil) icon for one
of the spills listed at the bottom of the Spill Panel. The Advanced Settings are 
found at the bottom of the dialog box. Find the parameter "on" which an be toggled 
true or false to make the spill active or inactive.


+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated                 |                |                |
+----------------------------+----------------+----------------+
| Dispersed                  |                |                |
+----------------------------+----------------+----------------+

Answer:
-------

The currents within the central sound are much weaker
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
| Evaporated                 | 163            | 171            |
+----------------------------+----------------+----------------+
| Dispersed                  |                |                |
+----------------------------+----------------+----------------+

Example 2.
----------

Rerun the above spills with the following change: Add a 15-knot
wind from the east.

How does the wind affect the trajectories? Note the changes in the
mass balances.

**Hint:** 

To add the wind condition to your model, in Setup View, click the 
Edit Wind icon (pencil) at the bottom of the Wind panel.

+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated                 |                |                |
+----------------------------+----------------+----------------+
| Dispersed                  |                |                |
+----------------------------+----------------+----------------+

Answer:
-------

The wind makes the spills move in an easterly direction.
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
| Evaporated                 | 163            | 171            |
+----------------------------+----------------+----------------+

Example 3.
----------

Rerun the same spills with the following addition: Turn on the
Minimum Regret (Uncertainty) solution (red splots).

How does this information change your forecast for potential beach
impact areas?

**Hint:** 

To quickly turn on the Minimum Regret solution, click the
box labeled "Include the Minimum Regret (Uncertainty) solution" 
in the Model Settings box in Setup View.

Answer:
-------

Spill #1 could impact more beaches on Naked Island and
other islands in the vicinity. Spill #2 shows impacts on more
beaches of Knight Island, and now Evans Island and Latouche Island
show some oiling and/or significant threat of oiling.

Example 4.
----------

Rerun the same spills once more with the following change: Make
both spills gasoline spills (keep the wind from the east at 15 knots).

Examine the differences in the trajectories and the mass balances.


+----------------------------+----------------+----------------+
| **                         | **Spill #1**   | **Spill #2**   |
| Mass Balance**             |                |                |
| Mass Balance**             |                |                |
|                            | **(bbl)**      | **(bbl)**      |
+----------------------------+----------------+----------------+
| Floating                   |                |                |
+----------------------------+----------------+----------------+
| Beached                    |                |                |
+----------------------------+----------------+----------------+
| Evaporated and Dispersed   |                |                |
+----------------------------+----------------+----------------+

Answer:
-------

Lighter products evaporate more quickly than heavier
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
