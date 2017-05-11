###################
Simulating Oil Fate
###################

WebGNOME includes a front end to oil fate (weathering) simulation codes in the GNOME suite, including updated algorithms from NOAA's ADIOS2 software. Oil fate can be simulated as part of full fate and transport simulation, or on its own in a Fate Only mode.


ADIOS Oil Library
=================

In order to simulate the fate of oil spilled in the environment, a fairly detailed description of the chemistry of the oil in question needs to be provided. WebGNOME provides the ADIOS Oil Library and an integrated component of the system. The library consists of 1000s of crude oils and refined products that span a range of oils that are typically transported.

The Library also includes a set of "generic" oils -- these represent "typical" oils of various types. These are good choice if you don't know which specific oil was (or will be) spilled, and want something that will behave appropriately, rather than arbitrarily selecting an oil that may be unusual.

Each record in the library provides the data necessary to run the model as well as a few informative and health and safety properties of interest, such as flash point.

Some oil records are more complete than others. They each hold enough information to run the model, but may be missing important components. If anything is missing, the values are estimated from the known values using industry-standard algorithms. If an value is estimated is it displayed in red, so the user is aware of possible uncertainties. In addition, a "Quality Score" is provided, based on how much data associated with a record are measured, rather than estimated. If you are not sure which record to choose, a recored with a higher quality score will give more precise results in the fate model.

The library comes with a Selection interface that allows you to search for oils in a number of way, and see all the data associated with particular records. To learn how to use the interface, see the procedure here:
:ref:`Selecting an Oil <selecting_an_oil>`


Oil Fate Wizard
===============

WebGNOME comes with an Oil Fate Wizard to help guide you through running the model in fate only mode.
Fate only mode provides and easy to set up way to explore the fate of an oil spilled in the open ocean, relatively far from shore. It models the spill as though it were in an infinite ocean with no land anywhere.

This can be suitable for exploring the time scale of a spill -- how long will visible surface expression be present? As well as issues such as windows of opportunity for response -- how likely is this oil to be dispersible two days after the release?

The Oil Fate Wizard makes it easy to set up the model to address these sorts of questions without needing to locate sources of currents, shoreline maps, or the like.



Oil Fate Exercises
==================

.. toctree::
   :maxdepth: 2

   fate_exercises/kronosaurus_exercise
   fate_exercises/full_run_through
   fate_exercises/dispersant_exercise
   fate_exercises/uncertainty_exercise
   fate_exercises/continuous_exercise
   fate_exercises/instantaneous_exercise
   fate_exercises/ics_209_exercise.rst


