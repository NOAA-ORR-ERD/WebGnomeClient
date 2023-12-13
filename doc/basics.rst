.. include:: links.rst

###################
Navigating WebGNOME
###################

Startup Modes
-------------

There are a number of ways to start using WebGNOME, depending on your use case.

Beginner Modes
..............

These modes require minimal setup and external data, and are good for getting started with WebGNOME.

Location Files
  A location file is the WebGNOME model set up to model scenarios in a particular location. These exist for many coastal United States waterways and contain pre-configured shoreline and current data. For more information see: :doc:`location_files`

Weathering Only Mode
  Weathering only mode lets you model how an oil weathers in the open ocean, not specific to a particular location. This mode is useful to quickly estimate an oil budget without having to enter the details on the incident location or currents. 

Advanced Modes
..............

These modes require some expertise and may require gathering data and information from other sources.

Operational Forecast Mode
   This mode presents the user with a selection of operational oceanographic and meteorological forecast models that can be used to drive GNOME (mostly US-centric models operated by NOAA or global models). From the available choices, winds, currents, and maps can used to set up a GNOME model entirely within WebGNOME.

Manual Setup
  Manual set up starts from scratch with an empty model -- users need to set up everything for a simulation: winds, currents, shorelines, etc. Each of these data files needs to be available and in the proper format. For more information about file formats, etc, see:
  |file_formats_doc|. Note, the inputs available through the Operational Forecast Mode can also be accessed in manual setup.


The Menu Bar
------------

No matter which way users begin setting up the scenario the Menu Bar will be
visible at the top of the page. From the "Menu Bar" choose the  *New* option to create a new model scenario in any of the modes described above. The *Views* option is used to switch between model Views (see next section). Select *Save* to save the
existing scenario or the results of a model run. Select *Help* to access documentation.

.. image:: images/menubar.png
    :alt: Screenshot of menubar
    :align: left

Once the model scenario is set up, the output can be Run as a spill animation or exported in
various formats with the *Save* item in the menu bar.


Switching between Views
-----------------------
The WebGNOME application has various "Views" for setting up and viewing the spill scenario.
To switch between Views in the model, the icons
pictured below are always found on the top right of the Menu Bar.

 - To make modifications to the model setup, switch to Setup View.
 - To view the oil budget, switch to Fate View.
 - To view the oil trajectory, switch to Map View.

.. image:: images/view_icons.png
    :align: left

Getting Help
------------

For detailed help information when entering information in forms or interacting with the various "Views", look for the embedded help icons (:fa:`question-circle`) on the upper right of the form or View. This will give information specific to the individual form or View.
