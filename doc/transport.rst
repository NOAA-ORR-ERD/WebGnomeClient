##################
Transport Modeling
##################

WebGNOME is not limited to use for oil spills but can be used as a stand-alone transport model
for all types of floating objects or substances. In this case, rather than select an oil from the
ADIOS database, simply
leave the substance as "non-weathering". If an oil is selected, weathering algorithms will automatically
be applied and the mass balance and other physical properties output graphs will be shown in Fate View
(see :doc:`fate`).

Although the web interface does not yet support 3D simulations, that functionality is available
using the pyGNOME scripting environment. See https://github.com/NOAA-ORR-ERD/PyGnome for more.

Setting up the Model
====================

Setting up a transport simulation in WebGNOME requires adding various objects to the model. To add these objects in Setup View, click on the "plus" icon in the upper right of each panel to view a form with the various options for loading information. For more information on any of the options, click the help (question mark) icon in the form header.

Below is more detail on the most common objects that need to be added to the model to simulate transport processes.

Map
---

A map is necessary to determine when particles interact with the shoreline (e.g. oil beaching). Clicking on the *Create Map* button on the Map Panel will yield sevaral options -- you can choose to upload a file, see:
`Supported file formats <http://response.restoration.noaa.gov/oil-and-chemical-spills/oil-spills/response-tools/gnome-references.html#dataformats>`_ for more information. Alternatively, there is an option to download shoreline data for a specified region (*Custom Shoreline*). In idealized cases, you can also opt for an *Infinite Ocean* with no shorelines.

Winds
-----

Wind is also a required element for modeling surface transport. Options include loading output from a meteorological model (*Load NetCDF winds*) and creating or loading a *Point Wind* (time series at a point which is applied constantly over the domain.

When entering values use the convention adopted by meteorologists who define wind direction
as the direction *from* which the wind is blowing. Also, wind speeds are assumed to be at a 10 meter
reference height above the water surface.

There are multiple options for adding Point Winds:

* It can be entered manually as a constant wind value or as a time-series.
* The latest point forecast can be automatically imported from the National Weather Service (NWS) for a specified location.
* An existing file can be uploaded (`Supported file formats`_).

Finally, the *Select Wind for Specified Region* option provides a direct connection to retrieve wind forecasts from 


Surface Currents
----------------

Surface currents are also important to consider when modeling surface transport. Although WebGNOME can be
run with wind driven transport only, realistic simulations generally need to also include surface currents.
Ocean current data on a regular, curvilinear, or triangular grid (e.g. output from a hydrodynamic model)
can be imported into WebGNOME. At present, only specific file formats are supported (eventually any CF-compliant
file should be compatible). Details on the supported file formats
can be found in the `Supported file formats`_.


Horizontal Diffusion
--------------------

Random spreading, i.e. diffusion, is included by a simple random walk algorithm.
The random walk is based on the diffusion coefficient which represents the horizontal
eddy diffusivity in the water. The model default is 100,000 cm2 s-1. That value is appropriate for "typical" coast ocean. You may want to adjust it to suit your scenario.


Using Location Files
====================

Location Files were created to guide users through the model setup for a specific region. They come
pre-packaged with a map, horizontal diffusion, and surface currents already created. Learn more in
the :doc:`Location Files <location_files>` section of the User Guide.


Oil Transport Exercises
=======================

.. toctree::
   :maxdepth: 1

   transport_exercises/location_file_exercise
   transport_exercises/manual_exercise

