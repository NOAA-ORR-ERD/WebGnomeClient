##################################
Example Scenario with Manual Setup
##################################

Sample Files
============

This example will use the following files. These files were all obtained through the
GNOME Data Server :doc:`GOODS <../goods>` at http://gnome.orr.noaa.gov/goods

* Map :download:`LA_shoreline.bna <LA_shoreline.bna>`
* Winds (Point Wind) :download:`Winds.nws <Winds.nws>`
* Currents :download:`LA_currents.nc <LA_currents.nc>`

Incident
========

On May 10, 2017 at approximately 3 PM, a platform west of the Mississippi River Delta at:

29° 6.5' N, 89° 40.1' W

experienced a crude oil discharge from a production pipeline. Pipeline pressure at the
time was 70 psi. The maximum potential for this leak is 460 barrels of LA medium crude oil. Sheen was observed and the pipeline was shut in. USCG is requesting a 48-hour fate and trajectory analysis.


Get Started
===========

Since we're starting from *scratch* in this example, we'll begin in WebGNOME's "Setup View".
If you are on the WebGNOME landing page click on "Manual Setup". If you have already started
WebGNOME, you can select Manual Setup from the "New" pull down menu on the menubar.

Once you are in Setup View, you will see a number of panels which are used to interact with
various model components.
For example, these panels can be used to change basic model parameters (the model start time
or run duration within the "Model Settings" panel) or to load or create movers (e.g.
the "Wind" and "Current" panels).

Begin by entering data in the Model Settings panel. You can give the incident a name and set the model start time and duration. Leave the "Include uncertainy in particle transport" box unchecked for now.


Load a Map
==========

Next, create a map in WebGNOME. The default map is an "infinite ocean" - a water world. This is useful for
idealized scenarios or cases where you only want to consider oil weathering. But in most cases, you'll upload
shoreline data to create a map.

On the Map panel, click on the **+** sign on the upper right hand corner to add a map. (WebGNOME only supports the
use of one map at a time, so adding a map will replace the current map.) Navigate to your saved sample file
or drag it onto the form to create a map.


Add Wind Data and Current Data
==============================

The wind file provided is a NOAA marine point forecast. This is loaded as a "Point Wind" in WebGNOME ("Gridded Wind" is used for loading model wind products in NetCDF format). In the Point Wind panel, clicking on the **+** sign will allow you to upload the wind data. You'll see various options that
are available, e.g. manually entering data or automatically retrieving the most recent NWS forecast.
But in this case, use the provided sample file by choosing Upload File.

Follow the same procedure to add the current data, in this case choose Load NetCDF Surface Currents from the
form. It may take a little longer to load the currents as it is a much bigger file.

WebGNOME allows you to upload or create multiple wind and current movers. This is handy if you have more than
one data source for a region and you want to see how they differ. Each mover will appear in a list at the bottom
of the panel. In this case, you should only have one wind and one current in your list.


Add Horizontal Mixing (Diffusion)
=================================

Small scale turbulent wind and currents act to spread oil on the water surface and result in an increasingly
patchy oil distribution. To simulate this, the model uses a random walk based on a specified diffusion coefficient.
To create a horizontal diffusion mover in WebGNOME, click the **+** icon on the Horizontal Diffusion panel. The
default value is 100,000 cm\ :sup:`2`\ s\ :sup:`-1`


Add the Spill
=============

To add the spill, once again you will click on the **+** icon, this time in the spill panel. Assume
the spill happened very quickly (in less than an hour) and choose "Instantaneous Spill". If you set
the model start time earlier, the spill should already be initialized to the correct time. If not,
you can set it here, and when you hit Save, you'll automatically be prompted to change the
model start time to match. Enter the amount released and the spill location. For now, leave the
substance as non-weathering (we will consider transport only for this example).

Run the Model
=============

Once everything is setup, it's time to run the model. To switch to Map View, select Map View under
Views or use the globe icon on the upper right of the menu bar. Use the controls on the upper left part of the map to play, pause, rewind, or step through
the model. The icons on the upper right of the menu bar can be used to switch back to the Setup View,
or go to Fate View (note, since the scenario used a non-weathering substance, output in Fate View
will be unavailable).


Explore
=======

There are many other WebGNOME features to explore. For instance:

* Use the Layers menu on the right hand side of Map View to change background imagery.
* Use the Layers menu on the right hand side of Map View to visualize currents (you'll need to rerun the model)
* Export the output as a KMZ for Google Earth or shapefile for GIS applications
* Change the substance from non-weathering to an oil from the ADIOS oil database and explore Fate View -- note, you'll also need to add data in the Water panel to compute weathering

