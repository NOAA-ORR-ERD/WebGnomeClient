##########################
Frequently Asked Questions
##########################

General Questions
=================

What does the term "particle" refer to in this document?
--------------------------------------------------------

WebGNOME is based on a "Lagrangian Element" or "particle tracking" computational model. This means that the substance that is being modeled (e.g, an oil slick) is represented in the model as a number of individual particles representing some portion of the total spill. Each particle can move and change individually based on the environmental conditions it experiences (winds, currents, water temperature etc.) which may differ as the particles spread away from each other. Sometimes the term "element" is used, to avoid confusion with physical particles, such as sediment.


Configuration
=============

How do I choose the model timestep?
-----------------------------------

Choosing an appropriate model timestep is a bit of an art.
It primarily depends on the resolution of your forcing functions (e.g. the grid size of an ocean current model), and the velocity of the currents. As a rule, the currents are the limiting factor: winds move things slower, and are usually on larger grid sizes. You will need a small timestep if there are fast currents with a small grid size -- like in rivers and narrow tidal channels: with too large a timestep, particles can "jump over" an entire grid cell in one timestep.

15 minutes is a reasonable default for many situations.

If you are not sure, try making the timestep smaller, and see if it changes the results appreciably -- if it does, keep making it smaller until there is no noticeable change.

For weathering analysis -- evaporation can be quite fast for some products -- in that case, you may need a shorter timestep to capture that process. However, the end result should be similar in any case.


What is an appropriate value for the diffusion coefficient?
-----------------------------------------------------------

This is a technical question about the underlying model (PyGNOME). A discussion can be found in the PyGNOME documentation |diffusion|.

.. |diffusion| raw:: html

   <a href="https://gnome.orr.noaa.gov/doc/pygnome/tech_notes.html#diffusion" target="_blank">
   here</a>

Why does the model tell me a release site is on land, when it doesn't look like on the map?
-------------------------------------------------------------------------------------------

Related: why do the particles "beach" a little bit away from (or on top of) the shoreline?
------------------------------------------------------------------------------------------

While you provide a shoreline definition (map) in a "vector" format that can be very high resolution, GNOME simplifies the shoreline to a "raster" with a defined resolution.
Unfortunately, the visualization of the raster map is a bit broken, but you can get see where the internal shoreline is by making a spill (and winds) that puts the particles on the shoreline. You will then see exactly where the internal shoreline is.
Note that it will be a "blocky" shoreline that only approximates the actual shoreline provided.

If the shoreline is not high enough resolution for your application, you can
get better resolution by:

 * Making your map smaller -- if you provide a map that's only a little larger than the region you need, you will get better resolution. GNOME uses a defined number of pixels for the map, the larger your map, the larger each pixel has to be.

 * Increase the resolution of the map. For the most part, you don't generally need a high resolution map if you are modeling a wide region, but if you want both, you can increase the resolution in the "advanced settings" for the map. The number is the total number of pixels used -- the maximum is 128 MB (134,217,728).

Why does the "model shoreline" not match another map's shoreline?
-----------------------------------------------------------------

Sometimes the shoreline that is used by GNOME to do the element beaching, etc. (The model map) does not line up with a base map, such as the Open Street Map map.
There are two potential reasons for this:

 1) Some shorelines are highly mobile, such as the shorelines of the Mississippi River delta.
    In that case, the shoreline location can change a lot after even a few years, or after a storm event.
    If the model shoreline was derived from older (or newer) shoreline data than the other map, they will not align.

 2) Some older shoreline data can by recorded in a different |datum| than the current standard,
    known as WGS-84.
    This can make the shoreline appear to be in a different location.
    This is a particular problem with non-US shorelines obtained from the global shoreline database via WebGNOME.

.. |datum| raw:: html

   <a href="https://en.wikipedia.org/wiki/Geodetic_datum" target="_blank">
   horizontal datum</a>


NOAA WebGNOME Server
====================

How can I change the display options -- for example, to color the particles based on an oil property like viscosity?
--------------------------------------------------------------------------------------------------------------------

Customizing the display is done through the Layers panel in the Map View. The layers panel has options for selecting map background layers, customizing the display settings for the particles and displaying  environmental information like surface currents.

See: :doc:`layers`


How can I do a large scale simulation?
--------------------------------------

If you try to do a very large simulation on the WebGNOME system run by NOAA, it may block uploads, cause errors, or never complete when run.

The WebGNOME server run by NOAA is not designed for very large scale simulations.

There are two ways to address this limitation:

Run GNOME locally:
..................

Usually we recommend running the code locally on your own machine for large scale simulations.

You can run large simulations directly without the user interface with "PyGNOME", a Python package that does all the "work" behind WebGNOME. It is a bit tricky to install and get working if you are not very familiar with Python, but is quite manageable.

It is available on gitHub here:

https://github.com/NOAA-ORR-ERD/PyGnome

and its documentation is here:

https://gnome.orr.noaa.gov/doc/pygnome/index.html

If you do want the WebGNOME interface, you can run all of that locally as well, with code on gitHub here:

https://github.com/NOAA-ORR-ERD/WebGnomeAPI

and

https://github.com/NOAA-ORR-ERD/WebGnomeClient

The process is described here:

https://github.com/NOAA-ORR-ERD/WebGnomeClient/blob/main/WebGNOMEStack.rst

However, it's a bit tricky to get it all set up if you are not familiar with web application deployment.

Reduce the size of your simulation
..................................

You can reduce the size of your simulation so that it can be run on WebGNOME:

There are a number of parameters that affect the size of the simulation:

* Duration of the Simulation: The longer the duration of the simulation, the longer it takes to run, and the more resources it requires. WebGNOME caches the results of the run as it runs, and stores that locally in the browser for faster playback -- but if a run duration is too long, it can overload teh system.

* Number of elements: Both the computation time and the amount of data in the results scale with how many elements are used. a few thousand works fine, but much larger than that, and you can have issues.

* Size of your wind and current input files: Very large grids and very long durations can result in very large data files. Once on the server, large files aren't much of an issue, but uploading the files (or a save file with them included) can be very challenging over a web interface.

* The model timestep: for a long duration run and a small timestep will result in a very long simulation and a large amount of results data.

  - In addition to requiring more computation and output data -- GNOME won't allow less than one element per timestep in a continuous release -- so a long duration release combined with a small timestep can make the computation grow substantially.

  - With a long simulation, if the wind and current files are fairly coarse,
    a larger timestep can be used. 1 hour is often acceptable, and sometimes up to 3 hours can be reasonable.
    You can test by doing some short-duration simulations while increasing the timestep to see if it changes the result.
    To be more accurate, you can calculate the fastest velocity in the currents, and see how long it would take for an element to "skip over" a grid cell.
  - see above for more information about the time step.

* Uncertainty mode: When the uncertainty mode is turned on, GNOME will use twice as many elements, essentially doubling the size of the simulation.

  - Simply turning off uncertainty solves the problem. If you don't need the uncertainty results.

* Oil weathering: computing the weathering of oil during the run can substantially slow down the model -- it is more computationally intensive than the transport.

  - Use the Non-weathering substance if transport is the main concern.
  - You can run the weathering separately, with many fewer elements, or even without the shoreline and currents.

Finally, if these tactics are not enough, you can break the full simulation down into smaller simulations: If you have a long duration release, rather than one long simulation, you could do a series of simulations, e.g. of 10 days duration, and then put the results together after the run.

If you have a short release duration, but many elements, you can run a fraction of teh elements at once, and then put the results together after the run(s).

 The elements are independent, so the results should be the same regardless if they are not run together.


