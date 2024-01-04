.. include:: links.rst

##################
Transport Modeling
##################

WebGNOME can be used to develop trajectory simulations that incorporates both the transport and fate of an oil spill. If oil information is addded to the spill, weathering algorithms will automatically be applied and the mass balance and other physical properties will be shown in Fate View (see :doc:`fate`). The display in Map View will also account for the changes that occur to the properties of the particles as they are transported over time.  

WebGNOME is not limited to use for oil spills but can also be used as a stand-alone transport model
for all types of floating objects or substances. In this case, the substance is left as "non-weathering" - implying its properties will not change with time. 

Although the web interface does not yet support 3D simulations, that functionality is available using the PyGNOME scripting environment.

See `<https://github.com/NOAA-ORR-ERD/PyGnome>`_ for more.

Many of the start up modes described earlier (e.g., Location Files and Operational Forecast modes) can be used to set up the scenario. But regardless of the start up mode, various components are required to set up a realistic scenario. The following sections details setting up the model in Manual Setup mode. 

Setting up the Model
====================

Setting up a transport simulation in WebGNOME requires adding various objects to the model. To add these objects in Setup View, click on the Create icon (:fa:`plus`) in the upper right of each panel to view a form with the various options for loading information. For more information on any of the options, click the help icon (:fa:`question-circle`) in the form header.

Below is more detail on the most common objects that need to be added to the model to simulate transport processes.

.. note:: Supported File Formats

	Creating many of the objects described below involves uploading files to WebGNOME. Ocean and meteorological model output is typically in a binary format called NetCDF. If these files are "CF-compliant" they should be compatible with WebGNOME. For information on specialized file formats used by GNOME, see: `GNOME File Formats <https://gnome.orr.noaa.gov/doc/pygnome/file_formats/index.html>`_ In the PyGNOME documentation.

Spill
-----

WebGNOME has various options for initializing spills either as a point source, a line source or over an area (polygons). Spills can also be instantaneous (particles are released all at once) or continuous over a specified duration. Clicking on the *Create Spill* (:fa:`plus`) button will bring up a menu with selections for different spill options. See the specific help in the form for more information on spill types and file formats.


Map
---

A map is necessary to determine when particles interact with the shoreline (e.g. oil beaching). Clicking on the *Create Map* (:fa:`plus`) button on the Map Panel will yield several options -- you can choose to upload a file (see the help in the load form for more information on supported file formats). Alternatively, there is an option to download shoreline data for a specified region (*Custom Shoreline*). In idealized cases, you can also opt for an *Infinite Ocean* with no shorelines.

Winds
-----

Wind is also a required element for modeling surface transport. Options include loading output from a meteorological model (*Load NetCDF winds*) and creating or loading a *Point Wind* (a time series at a point which is applied constantly over the domain).

There are multiple options for adding Point Winds:

* It can be entered manually as a constant wind value or as a time-series.
* The latest point forecast can be automatically imported from the National Weather Service (NWS) for a specified location.
* An existing file can be uploaded.

Finally, the *Select Wind for Specified Region* option provides a direct connection to retrieve wind forecasts directly from supported operational models. 

.. admonition:: A Note on Meteorological Conventions

	When entering values use the convention adopted by meteorologists who define wind direction
	as the direction *from* which the wind is blowing. Also, wind speeds are assumed to be at a 10 meter
	reference height above the water surface.

Surface Currents
----------------

Surface currents are also important to consider when modeling surface transport. Although WebGNOME can be
run with wind driven transport only, realistic simulations generally need to also include surface currents.
Ocean current data on a regular, curvilinear, or triangular grid (e.g. output from a hydrodynamic model)
can be imported into WebGNOME. 

Currents can be added to be model either by uploading a file (*Load NetCDF Surface Currents*) or making a custom selection via the *Select Currents for Specified Region* option. This option provides direct access to download model output from numerous operationally available ocean models.


Horizontal Diffusion
--------------------

Spreading, i.e. diffusion, is included by a simple random walk algorithm.
The random walk is based on the diffusion coefficient which represents the horizontal
eddy diffusivity in the water. The model default is 100,000 cm^2/s. That value is appropriate for "typical" coastal ocean. You may want to adjust it to suit your scenario.


Using Location Files
====================

Location Files were created to guide users through the model setup for a specific region.
They come pre-packaged with a map, horizontal diffusion, and surface currents already created.
Learn more in the :doc:`Location Files <location_files>` section of the User Guide.


Oil Transport Exercises
=======================

.. toctree::
   :maxdepth: 1

   transport_exercises/location_file_exercise
   transport_exercises/manual_exercise

