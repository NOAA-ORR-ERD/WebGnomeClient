##########################
Frequently Asked Questions
##########################

**What does the term "particle" refer to in this document?**

WebGNOME is based on a "Lagrangian Element" or "particle tracking" computational model. This means that the substance that is being modeled (e.g, an oil slick) is represented in the model as a number of individual particles representing some portion of the total spill. Each particle can move and change individually based on the environmental conditions it experiences (winds, currents, water temperature etc.) which may differ as the particles spread away from each other. Sometimes the term "element" is used, to avoid with confusion with physical particles, such as sediment.

**How can I change the display options -- for example, to color the particles based on an oil property like viscosity?**

Customizing the display is done through the Layers panel in the Map View. The layers panel has options for selecting map background layers, customizing the display settings for the particles and displaying  environmental information like surface currents.

See: :doc:`layers`

**How do I choose the model timestep?**

**What is an appropriate value for the diffusion coefficient?**

This is a technical question about the underlying model (PyGNOME). A discussion can be found in the PyGNOME documentation |diffusion|.

.. |diffusion| raw:: html

   <a href="https://gnome.orr.noaa.gov/doc/pygnome/tech_notes.html#diffusion" target="_blank">
   here</a> 