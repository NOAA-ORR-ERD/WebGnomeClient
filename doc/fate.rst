###################
Simulating Oil Fate
###################

WebGNOME includes a front end to oil fate (weathering) simulation codes in the GNOME suite, including updated algorithms from NOAA's ADIOS2 software. Oil fate can be simulated as part of full fate and transport simulation, or on its own in a Fate Only mode.


Oil Fate Wizard
===============

WebGNOME comes with an Oil Fate Wizard to help guide you through running the model in fate only mode.
Fate only mode provides a simple interface to quickly set up and explore the fate of an oil spilled in the open ocean, relatively far from shore. It models the spill as though it were in an infinite ocean with no land anywhere.

This can be suitable for exploring the time scale of a spill -- how long will visible surface expression be present? As well as issues such as windows of opportunity for response -- how likely is this oil to be dispersible two days after the release?

The Oil Fate Wizard makes it easy to set up the model to address these sorts of questions without needing to locate sources of currents, shoreline maps, or the like.


ADIOS Oil Database
==================

In order to simulate the fate of oil spilled in the environment, a fairly detailed description of the chemistry of the oil in question needs to be provided. WebGNOME provides a link to the ADIOS Oil Database. The database consists of 1000s of crude oils and refined products that span a range of oils that are typically transported.

Most records in the database provide the data necessary to run the model as well as a few informative and health and safety properties of interest, such as flash point.

Some of these oil records are more complete than others. They each hold enough information to run the model, but may be missing important components. If anything is missing, the values are estimated from the known values using industry-standard algorithms. A "Quality Score" is provided, based on how much data associated with a record are measured, rather than estimated. If you are not sure which record to choose, a record with a higher quality score will give more accurate results in the fate model.

.. _selecting_an_oil:

Selecting an Oil:
-----------------

The database comes with a Selection interface that allows you to search for oils in a number of ways, and see all the data associated with particular records.

The list view presents the records that meet the current selection criteria -- this is the full set initially. This list includes a few of the records' fields:

  - **Name:** the name of the oil
  - **Location:** the region the oil came from
  - **API:** The oil's API Gravity (density)
  - **Score:** an estimate of the completeness of the record,
    records with higher quality scores have more data, and will
    result in more accurate forecasts in the model


The list is sorted by default alphabetically by name, but if you click on the column headers, you can see it sorted by that field.


The Search Box
..............

If you type any text in the search box, the list will be reduced to those records that have the text in any part of the name or location or oil product type. So typing in "IFO" will result in finding oils from Cal**IFO**rnia, as well as any oil with "IFO" in the name, and all oils in the "Intermediate Fuel Oil" Category.

Product Type
............

The oils in the database are all sorted into various types of oils: crude or refined products, etc. If a type is selected, only oils that fit that type will be displayed. Some of the types are broad and overlapping, for instance, in "Distillate Fuel Oil", you will find both Gasoline and Kerosene.

If you are looking for a product that fits within a certain type of oil, selecting that type will help you refine your search quickly.


API slider
..........

The API slider lets you set a range you want of the oil's API gravity. Only oils that fall within that range will be displayed.


Seeing the Complete Oil Record
..............................

Clicking on the oil name in the list brings you to the oil's Physical properties tab for a Fresh Oil Sample.



Oil Fate Exercises
==================

.. toctree::
   :maxdepth: 1

   fate_exercises/full_run_through
   fate_exercises/dispersant_exercise
   fate_exercises/continuous_exercise
   fate_exercises/ics_209_exercise.rst

..   fate_exercises/instantaneous_exercise
..   fate_exercises/uncertainty_exercise

