##################################
Example Scenario with Manual Setup
##################################

Sample Files
============

This example will use the following files. These files were all obtained through the 
GNOME Data Server :doc:`GOODS <../goods>` at http://gnome.orr.noaa.gov/goods

* Map :download:`text <LA_shoreline.bna>`
* Winds :download:`test <winds.nws>`
* Currents :download:`netcdf <LA_currents.nc>`

Incident
========

On May 10, 2017 at approximately 10 AM, a platform west of the Mississippi River Delat at 
xx N, xx W experienced a crude oil discharge from a production pipeline. Pipeline pressure at the 
time was 70 psi. The maximum potential for this leak is 460 barrels of LA medium crude oil. Sheen was observed and 
the pipeline was shut in. USCG is requesting a 48-hour fate and trajectory analysis.

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

Begin by entering data in the Model Settings panel. You can give the incident a name and set the 
model start time and duration. Leave the "Include the Minimum Regret (Uncertainty) Solution" unchecked
for now.

Load a Map
==========

Next, create a map in WebGNOME. The default map is an "infinite ocean" - a water world. This is useful for
idealized scenarios or cases where you only want to consider oil weathering. But in most cases, you'll upload 
shoreline data to create a map.

On the Map panel, click on the + sign on the upper right hand corner to add a map. (WebGNOME only supports the 
use of one map at a time, so adding a map will replace the current map.) Navigate to your saved sample file 
or drag it onto the form to create a map.

Add Wind Data and Current Data
==============================

The wind file provided is a NOAA marine point forecast. This is loaded as a "Point Wind" in WebGNOME. Once 
again clicking on the + sign will allow you to upload the wind data. You'll see various options that 
are available, e.g. manually entering data or automatically retrieving the most recent NWS forecast. 
But in this case, use the provided sample file by choosing Upload File.

Follow the same procedure to add the current data, in this case choosing Load Surface Currents from the 
form.

WebGNOME allows you to upload or create multiple wind and current movers. This is handy if you have more than 
one data source for a region and you want to see how they differ. Each mover will appear in a list at the bottom 
of the panel. In this case, you should only have one wind and one current in your list.

Add the Spill
=============



