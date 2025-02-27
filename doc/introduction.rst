############
Introduction
############

WebGNOME is the web-based interface to GNOME, a publicly available oil spill
trajectory and fate model that simulates oil movement and weathering due to
winds and currents.  GNOME was developed by the NOAA Office of Response
and Restoration (OR&R) Emergency Response Division for use in oil spill response.

More information about the GNOME suite can be found on |ORR_website|.

.. Done as raw html to get it to open a new browser tab. Move to links.rst?

.. |ORR_website| raw:: html

	<a href="https://response.restoration.noaa.gov/oil-and-chemical-spills/oil-spills/response-tools/gnome-suite-oil-spill-modeling.html" target="_blank">OR&R's  Web Site</a>

WebGNOME can be used to:

- Predict how winds, currents, and other processes might move and spread oil
  spilled on the water.
- See how spilled oil is predicted to change chemically and physically
  ("weather") during the time that it remains on the water surface.



To use WebGNOME, users describe a spill scenario by entering information
into the program and potentially uploading files with ocean currents,
wind forecasts, and shoreline information.  To examine the fate of spilled oil,
a specific oil can be selected from the ADIOS Oil Database: a database
of more than a thousand different crude oils and refined products.

WebGNOME then creates and displays an oil spill animation showing the predicted
trajectory of the oil spilled in the scenario.  WebGNOME also produces graphs
containing information on the "oil budget" or partitioning of spilled oil
between the water surface, water column, and atmosphere. Physical properties
of the floating oil (e.g., viscosity, concentration) can be visualized
as the spill trajectory evolves. 

To make setting up and running WebGNOME easier, users can choose to start with
a Location File.  These exist for many United States waterways and contain
pre-packaged tide and current data.

Alternatively, users can choose to utilize shoreline data and output from
ocean and meteorological models.  Some publicly available operational models
are available for selection and download within WebGNOME.  Files can also be
uploaded to WebGNOME for use in custom scenarios.


Related Projects
================

Oil chemistry information that can be used in WebGNOME is available through
the |Adios_Oil_DB_website|:

The source code for WebGNOME and all its components can be found on |NOAA_ORR_ERD|:

In particular the |PYGNOME_GITHUB_PAGE| contains the source code for the
computational engine behind WebGNOME. It allows users to run simulations
with Python scripts, and even to add their own custom algorithms.
Here is where to find the |PYGNOME_DOCUMENTATION|

.. |Adios_Oil_DB_website| raw:: html

    <a href="https://adios.orr.noaa.gov/oils" target="_blank">ADIOS Oil Database application</a>

.. |NOAA_ORR_ERD| raw:: html

    <a href="https://github.com/NOAA-ORR-ERD" target="_blank">ERD's gitHub Page</a>

.. |PYGNOME_GITHUB_PAGE| raw:: html

    <a href="https://github.com/NOAA-ORR-ERD/PyGnome" target="_blank">PyGNOME Project</a>

.. |PYGNOME_DOCUMENTATION| raw:: html

    <a href="https://gnome.orr.noaa.gov/doc/pygnome/index.html" target="_blank">PyGNOME API Documentation</a>
