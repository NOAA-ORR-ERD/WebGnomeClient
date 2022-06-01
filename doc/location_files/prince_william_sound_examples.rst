
:orphan:

.. _prince_william_sound_examples:

Prince William Sound Example Problems
=====================================


Try out these examples to learn the basics of modeling oil spills in
Prince William Sound, Alaska. Explore how wind can move an oil spill in
a direction different from the currents, and how model and observation
limitations can be overcome by considering both the "Best Estimate" and
the "Uncertainty" solutions. This knowledge will help you
in designing your own WebGNOME model runs.

Two sets of example problems are provided. Begin by loading
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

What is the difference in beach impacts between the "Best Estimate" and
"Uncertainty" model runs for 2 days?

**Tips:**

1. Use the ADIOS Oil Database link to open the ADIOS oil database.
From the database interface select a medium crude.
It doesn't matter which exact oil you select, as long
as it falls into this category. Download the oil and
load the file into WebGNOME using the load oil drop box.
 
2. The "Uncertainty" solution is off by default (there is a checkbox
to turn it on/off in the Model Settings Wizard dialog box). Rather than stepping through 
the Wizard again you can switch to Setup View to make changes to your model settings.
Use the buttons on the Menu Bar to switch from Map View to Setup View. 
In Setup View are various panels which 
allow you to edit the model setup. In the **Model Settings** panel, you can toggle the 
"Uncertainty" solution on or off using the "Include uncertainy in particle transport"
checkbox.

Answer:
-------

The "Best Estimate" trajectory shows primarily the
northwestern part of Hinchinbrook Island with oiling. The
"Uncertainty" results show potential oiling of Montague Island and
increased oiling of Hinchinbrook Island.

Example 2
---------

If this spill were gasoline in the same amount, how would the beach impacts differ?

**Tips:** 

1. To quickly change the pollutant type, switch to Setup View and edit the 
spill by clicking on the edit (pencil) icon in the Spill panel. Use the
ADIOS Oil Database link to select a gasoline and then use the Load New Oil button
to load in your oil.

2. Turn off the "Uncertainty" solution
to make the model run faster. Run a "Best Estimate" gasoline
spill, then examine the Mass Balance by switching to Fate View.

Answer:
-------

By the end of two days, almost all of the gasoline has
evaporated and dispersed. (For the crude oil spill, only about a 
third of the spill had evaporated and dispersed in two days.) 
Much less shoreline is oiled because the
gasoline isn't around long enough to travel very far.

Example 3.
----------

If the wind shifts to 15 knots from the north at 11:00 pm (2300)
on the first day (Feb. 24), how will your trajectory change? (Change the
pollutant type back to a medium crude.)

**Tip:** 

Open the Wind settings panel by clicking on the edit (pencil) icon at the bottom.
If you entered the wind as a "Constant Wind" previously, you will need to switch to
the "Variable Wind" tab. Here you will see a list of wind values (with only one 
entry). By hovering over the first list item you will get an option to add another row
(+ icon). Choose to add another row below and then enter the additional wind
information for this example.

Answer:
-------

Now the beach impacts of the "Best Estimate" trajectory
affect both Hinchinbrook and Montague Islands. In problem 1, the
"Best Estimate" trajectory impacted only Hinchinbrook Island, while the
"Uncertainty" trajectory showed that Montague Island could possibly be
affected as well. In this problem, you can see how a small shift in
the wind has a dramatic effect on the spill's trajectory.

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

**Tips:** 

1. The Location File Wizard will only prompt for the addition of one spill. To
add the second spill, switch to Setup View and click the Create Spill (+) icon at 
the top right corner of the Spill panel.

2. To see the mass balance for individual spills you will need to run the spills 
individually. You can set them both up and then make them active/inactive by using 
the checkbox next to the spill name at the bottom of the Spill panel.


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
farther.

Example 2.
----------

Rerun the above spills with the following change: Add a 15-knot
wind from the east.

How does the wind affect the trajectories? Note the changes in the
mass balances.

**Tip:** 

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


Example 3.
----------

Rerun the same spills with the following addition: Turn on the
"Uncertainty" solution (red splots).

How does this information change your forecast for potential beach
impact areas?

**Tip:** 

To quickly turn on the "Uncertainty" solution, click the
box labeled "Include uncertainty in particle transport"
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

