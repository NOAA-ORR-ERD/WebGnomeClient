############
Introduction
############

WebGNOME is the Web-based interface to GNOME, a publicly available oil spill trajectory and fate model that simulates oil movement and weathering due to winds and currents. GNOME was developed by the NOAA Office of Response
and Restoration (OR&R) Emergency Response Division for use in oil spill response.

More information about the GNOME suite can be found on `OR&R's  Web Site. <https://response.restoration.noaa.gov/oil-and-chemical-spills/oil-spills/response-tools/gnome-suite-oil-spill-modeling.html>`_

WebGNOME can be used to:

    - Predict how winds, currents, and other processes might move and spread oil spilled on the water.
    - Learn how predicted oil trajectories are affected by inexactness ("uncertainty") in current and wind observations and forecasts.
    - See how spilled oil is predicted to change chemically and physically ("weather") during the time that it remains on the water surface.


To use WebGNOME, users describe a spill scenario by entering information into the program and
potentially uploading files with ocean currents, wind forecasts, and shoreline information.
To examine the fate of spilled oil, a specific oil can be selected from a database
of more than a thousand different crude oils and refined products.

WebGNOME then creates and displays an oil spill animation showing the predicted trajectory
of the oil spilled in the scenario. WebGnome also produces graphs containing information on
the "oil budget" or partitioning of spilled oil between the water surface, water column, and
atmosphere.

To make setting up and running WebGNOME easier, users can choose to start with a
Location File. These exist for many United States waterways and contain pre-packaged tide
and current data.

Alternatively, users can choose to utilize shoreline data and output from numerous publicly
available ocean and meteorological models through the GOODS website or other sources.


Related Projects
================

The source code for WebGNOME and all its components can be found on ERD's gitHub Page:

https://github.com/NOAA-ORR-ERD

In particular the pyGNOME project contains the source code for the computational engine behind WebGNOME. It allows users to run simulations with Python scripts, and even to add their own custom algorithms:

pyGNOME: https://github.com/NOAA-ORR-ERD/PyGnome




