##########################
Frequently Asked Questions
##########################


.. rubric::  What does the term "particle" refer to in this document?

WebGNOME is based on a "Lagrangian Element" or "particle tracking" computational model. This means that the substance that is being modeled (e.g, an oil slick) is represented in the model as a number of individual particles representing some portion of the total spill. Each particle can move and change individually based on the environmental conditions it experiences (winds, currents, water temperature etc.) which may differ as the particles spread away from each other. Sometimes the term "element" is used, to avoid with confusion with physical particles, such as sediment.

.. rubric:: How can I change the display options -- for example, to color the particles based on an oil property like viscosity?

Customizing the display is done through the Layers panel in the Map View. The layers panel has options for selecting map background layers, customizing the display settings for the particles and displaying  environmental information like surface currents.

See: :doc:`layers`

.. rubric:: How do I choose the model timestep?

Choosing an appropriate model timestep is a bit of an art.
It primarily depends on the resolution of your forcing functions (e.g. the grid size of an ocean current model), and the velocity of the currents. As a rule, the currents are the limiting factor: winds move things slower, and are usually on larger grid sizes. You will need a small timestep if there are fast current with a small grid size -- like in rivers and narrow tidal channels: with two large a timestep, particles can "jump over" an entire grid cell in one timestep.

15 minutes is reasonable default for many situations.

If you are not sure, try making the timestep smaller, and see if it changes the results appreciably -- if it does, keep making it smaller until there is no noticeable change.

For weathering analysis -- evaporation can be quite fast for some products -- in that case, you may need a shorter timestep to capture that process. However, the end result should be similar in any case.


.. rubric:: What is an appropriate value for the diffusion coefficient?

This is a technical question about the underlying model (PyGNOME). A discussion can be found in the PyGNOME documentation |diffusion|.

.. |diffusion| raw:: html

   <a href="https://gnome.orr.noaa.gov/doc/pygnome/tech_notes.html#diffusion" target="_blank">
   here</a>

.. rubric:: Why does the model tell me a release site is on land, when it doesn't look like on the map?

.. rubric:: Related: why do the particles "beach" a liitle bit away from (or on top of) the shoreline?

While you provide a shoreline definition (map) in a "vector" format that can be very high resolution, GNOME simplifies the shoreline to a "raster" with a defined resolution.
Unfortunately, the visualization of the raster map is a bit broken, but you can get see where the internal shoreline is by making a spill (and winds) that put the particles on the shoreline. You will then see exactly where the internal shoreline is.
Note that it will a "blocky" shoreline that only approximates the actual shoreline provided.

If the shoreline is not high enough resolution for your application, you can
you can get better resolution by:

 * Making your map smaller -- if you provide a map that's only a little larger than the region you need, you will get better resolution. GNOME uses a defined number of pixels for the map, the larger your map, the larger each pixel has to be.

 * Increase the resolution of the map. For the most part, you don't generally need a high resolution map if you are modeling a wide region, but if you want both, you can increase the resolution in the "advanced settings" for the map. The number is the total number of pixels used -- the maximum is 128 MB (134,217,728).
