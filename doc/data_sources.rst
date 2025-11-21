######################
Data Sources for GNOME
######################

GNOME requires a large number of inputs to "drive" the simulation: winds, currents, shoreline data, etc. These data can be obtained from a wide variety of sources. For the file formats supported, please see:
`GNOME File Formats <https://gnome.orr.noaa.gov/doc/pygnome/file_formats/index.html>`_ in the PyGNOME documentation.


Within WebGNOME
===============

WebGNOME includes a system for accessing various sources of information required to set up a model simulation:

- Shoreline Maps
- Currents
- Winds

In addition to the sources available within WebGNOME, other sources can provide winds, currents, etc, if they are in compatible formats. See: `GNOME File Formats <https://gnome.orr.noaa.gov/doc/pygnome/file_formats/index.html>`_ For more info on that.

Ocean Currents from Operational Forecast Systems (US)
=====================================================
NOAA's National Ocean Service develops and implements hydrodynamic model-based Operational Forecast Systems (OFS) to support navigation in U.S. waters. This system is a national network that provides operational nowcast and forecast guidance (out 48-72 hours). Ocean currents from a NOAA OFS output  can be downloaded from `OFS Subsetter <https://opendap.co-ops.nos.noaa.gov/ofsdataagg/index.html>`_. To simplify use case scenario and to reduce file size, choose 2D surface currents and velocity (only).

Ocean Currents from Copernicus Marine Service (International)
=============================================================
The Copernicus Marine Service is the marine component of the European Union’s Copernicus Programme. It provides free, open-access, and science-based information on the state of the Ocean at both global and regional scales. Ocean currents downloaded from the `Copernicus Marine Data Store <https://data.marine.copernicus.eu/products>`_  (requires individual registration) can be used in WebGNOME.

Ocean Conditions
================
GNOME allows for input of temperature and other ocean conditions for weathering algorithms.  A couple of useful references for accessing information on ocean conditions include:

- `NOAA IOOS EDS Model Viewer <https://eds.ioos.us/map/>`_
- `Copernicus <https://data.marine.copernicus.eu/viewer/>`_

Oil Characteristics
===================
Oil characteristics are required by JSON file in the ADIOS Oil Database format when weathering is active.  These files can be downloaded in the right format from the  `ADIOS oil database <https://adios.orr.noaa.gov/oils>`_.  Be sure to click the “GNOME Compatible” box.

GNOME Data Server (GOODS)
=========================

.. admonition:: GOODS no longer maintained

    The stand-alone GOODS website is being replaced with options integrated into WebGNOME. The GOODS application is still available during this transition but no longer actively maintained.

The GNOME Online Oceanographic Data Server (GOODS) provides access to a
variety of data in a format that can be easily loaded into WebGNOME. Ocean
current and wind data and forecasts from numerous sources are available.

GOODS also includes a map generator tool that can be used to make a map
for WebGNOME.

Visit https://gnome.orr.noaa.gov/goods to access WebGNOME compatible data
and forecasts through GOODS.

