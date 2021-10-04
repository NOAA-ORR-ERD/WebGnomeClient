###################
Simulating Oil Fate
###################

WebGNOME includes a front end to oil fate (weathering) simulation codes in the GNOME suite, including updated algorithms from NOAA's ADIOS2 software. Oil fate can be simulated as part of full fate and transport simulation, or on its own in a Fate Only mode.


Oil Fate Wizard
===============

WebGNOME comes with an Oil Fate Wizard to help guide you through running the model in fate only mode.
Fate only mode provides and easy to set up way to explore the fate of an oil spilled in the open ocean, relatively far from shore. It models the spill as though it were in an infinite ocean with no land anywhere.

This can be suitable for exploring the time scale of a spill -- how long will visible surface expression be present? As well as issues such as windows of opportunity for response -- how likely is this oil to be dispersible two days after the release?

The Oil Fate Wizard makes it easy to set up the model to address these sorts of questions without needing to locate sources of currents, shoreline maps, or the like.


ADIOS Oil Database
=================

In order to simulate the fate of oil spilled in the environment, a fairly detailed description of the chemistry of the oil in question needs to be provided. WebGNOME provides a link to the ADIOS Oil Database. The database consists of 1000s of crude oils and refined products that span a range of oils that are typically transported.

Most records in the database provide the data necessary to run the model as well as a few informative and health and safety properties of interest, such as flash point.

Some of these oil records are more complete than others. They each hold enough information to run the model, but may be missing important components. If anything is missing, the values are estimated from the known values using industry-standard algorithms. A "Quality Score" is provided, based on how much data associated with a record are measured, rather than estimated. If you are not sure which record to choose, a recored with a higher quality score will give more precise results in the fate model.

The database comes with a Selection interface that allows you to search for oils in a number of ways, and see all the data associated with particular records. To learn how to use the interface, see the procedure here:
:ref:`Selecting an Oil <selecting_an_oil>`


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

