:orphan:

.. IOSC 2017 Spill modeling class

.. Exercise 1_Fate_uncertainty:

Introductory Exercise
#####################

Incident
========

Kronosaurus, an ancient Atlantic sea monster, damages a tanker vessel, causing an instantaneous (one hour or less) spill of 1000-4000 bbl of Abu Safah medium crude. Wind is 10 knots (+/-5 knots) from North. Water is 25 C in open ocean (fetch unlimited) and the seas are fully developed.

Purpose
=======

The purpose of this exercise is to gain familiarity with WebGNOME's Fate Mode and how it handles uncertainties in spill amount and wind speed. The weathering/fate sub-model handles uncertainty differently than how transport uncertainty is handled.

For simplicity, this exercise does not include any cleanup options.

Getting Started
===============

To start up the model for Fate Mode, click on "Fate Wizard" under "Weathering Only".  This will allow you to run the model without putting in a map or currents or other region-specific data. In Weathering Only mode, an infinite ocean is assumed.

*What if I am not at the home page?* : Choose the "New" menu and select "Oil Fate Wizard".


The model requires that you provide information for the five categories listed. When you have provided sufficient information for a particular category, the red x will change into a green check-box.


Doing the Exercise
==================

 #. You can put any name you want for the "scenario". The default model run is 5 days but you can do shorter or longer model runs. Most weathering for non-continuous spills happens within a 5 day period.

 #. Clicking the "oil" button brings up the oil database (WARNING: still in draft form) You can type "Abu Safah" in the search box or simply scroll down and select the oil.

      *You might want to take a few minutes to play around with the database.
      For those of you familiar with ADIOS2, you will notice many new features
      such as selection by oil property, grouping the oils into product types,
      and scoring the quality of the available data.* For more information about 
      oil selection form, see:
      :ref:`Selecting an Oil <selecting_an_oil>`

 #. Next, hit the spill button. This will bring up the screen to enter the spill data.

      *Currently, the model only supports "instantaneous" releases (releases that happen in an hour or less), and "continuous" spills. However, soon the model will support well-blowouts, pipeline ruptures and sunken vessels. If you run the model in trajectory mode, it will also support spatially varying releases.*

    For this exercise, choose a 2500 bbl instantaneous release. Then load in the oil file you downloaded from the ADIOS oil database.

 #. Selecting the "water" button allows input of the properties of the water environment. Spilled oil fate varies depending on water temperature, salinity, and wave height. For this exercise, use 25 C for water temperature and leave the rest at default, but look at other options that are available.

 #. The model allows the user to enter the wind in many different ways but will leave discussion on that to the trajectory scenarios and the continuous release exercise. Enter 10 knots for wind speed and set speed uncertainty to maximum. Fate Mode mode does not use wind direction so leave it at the default north wind value.

Run the model
=============

Click **Solve** to run the model.

The default output screen is the oil budget table. This will calculate oil mass balance assuming no uncertainty. However, choose "oil budget graph" and note the three circles. These represent the uncertainty in the amount of remaining floating oil. Also, look at the uncertainty graphs for particular oil characteristics.


