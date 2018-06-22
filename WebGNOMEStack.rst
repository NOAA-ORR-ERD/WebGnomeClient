##################
The WebGNOME Stack
##################


The WebGNOME stack is a complete system for running a Web-based client-server oil spill fate and transport model. The different components of the stack


It consists of a number of components that all work together, and they all need to be installed and configured to work together. All the server-side components are written in Python, and the client is written in Javascript

Server Side
===========

On the server, you need:

pyGNOME
-------

This is the model itself, the computational code for fate and transport modeling. It can be run with python scripts on its own, or used behind the WebGNOME system.


https://github.com/NOAA-ORR-ERD/PyGnome


OilLibrary
----------

The OilLibrary is a Python package that provides a library of properties for many oils, as well as the code to work with library, and provide what pyGNOME needs to perform fate and weathering calculations.

https://github.com/NOAA-ORR-ERD/OilLibrary


WebGNOME API
------------

The WebGNOME API is a python (Pyramid) package that provides an http / JSON web service to control and run the pyGNOME model. It provides the connection between the computational code and client side code running in a browser.

https://github.com/NOAA-ORR-ERD/WebGnomeAPI


Oil Library API
---------------

The Oil Library API is a python (Pyramid) package that provides an http / JSON web service to access the oil library.

https://github.com/NOAA-ORR-ERD/OilLibraryAPI


WebGNOME Client
---------------

The WEbGNOME client is a Javascript application, that runs in the browser and provides a user interface to the GNOME system.


https://github.com/NOAA-ORR-ERD/WebGnomeClient


Installation / Deployment
=========================

You have a number of options to deploy the system. All five components need to be installed and run, but you can run the WebGNOME API, OilLibraryAPI, and WebGNOME Client all on one machine, or on separate machines (or multiple instance in a cloud service).

Local system
------------

Running it all on one machine for local access (your own laptop for instance).

PyGNOME, in particular, is a complex system with many dependencies on various scientific packages. We recommend that you use the conda package management system to satisfy the dependencies. YOu probably want to set up a conda environment in which to run the system. Follow the instructions with each component, and install in this order, running the unit tests for each one:

OilLibrary
PyGNOME
WebGNOME API
Oil Library API

Once you have the two APIs running, you need the client:

The client is a Javascript app, deployed via node.js. It can be installed according to the directions in its README:

WebGNOME Client
---------------




Linux Server
------------


Docker Images
-------------







