##################
The WebGnome Stack
##################


The WebGnome stack is a complete system for running a Web-based client-server oil spill fate and transport model. It consists of a number of components that all work together, and they all need to be installed and configured properly in order to work together. All the server-side components are written in Python, and the client is written in Javascript

The system is under active development, so there we have not distributed packages of teh various components -- you will need to use the source code directly.

All components are available on the NOAA-ORR-ERD organization on gitHub:

https://github.com/NOAA-ORR-ERD

Or perhaps you are working with the source from elsewhere )(like inside NOAA).

In any case, you want to use everything from the same source if you can, and make sure the branches of each project match. (e.g. the main branch from the full stack should all work together)


You will need to download the source (or clone the repo) for all components to the machine you want to run it on.

The entire stack is developed, tested, and should run on Windows, OS-X and Linux Systems.


Server Side
===========

On the server, you need:

PyGNOME
-------

This is the model itself, the computational code for fate and transport modeling. It can be run with python scripts on its own, or used behind the WebGnome system.

It is available on gitHub here: https://github.com/NOAA-ORR-ERD/PyGnome.


adios_db
--------

`adios_db` is a Python package that provides a system for working with oil property data, and functionality to create oils that can work with the PyGNOME weathering code. It is an optional component of PyGNOME, but required if you want to run the weathering algorithms with a variety of oil types.

https://github.com/NOAA-ORR-ERD/adios_oil_database

NOTE: you will likely want to use the `production` branch of this library.


``adios_db`` is a package within that repository (which also holds code for a web interface to an oil datbase)

Oil data, in compatible format (JSON), can be obtained from NOAA's ADIOS Oil Database Web Service:

https://adios.orr.noaa.gov

or from the source of the data on gitHub:

https://github.com/NOAA-ORR-ERD/noaa-oil-data


WebGnome API
------------

The WebGNOME API is a python (Pyramid) package that provides an http / JSON web service to setup, run, and visualize the results of the PyGNOME model. It provides the connection between the computational code on the server and the client side code running in a browser.

https://github.com/NOAA-ORR-ERD/WebGnomeAPI


WebGnome Client
---------------

The WebGnome client is a Javascript application, that runs in the browser and provides a user interface to the GNOME system. It is served with node.js


https://github.com/NOAA-ORR-ERD/WebGnomeClient

redis
-----

Redis is an open source (BSD licensed), in-memory data structure store, used as a data store for session data by the WebGnomeAPI.
It is not maintained or distributed by NOAA, but you must have a Redis server running in order run the WebGnome stack:

https://redis.io/

(it can be optionally installed with conda, too -- see below)


Installation / Deployment
=========================

You have a number of options to deploy the system. All five components need to be installed and run, but you can run the WebGnome API, and WebGnome Client all on one machine, or on separate machines, or separate Docker images (or multiple instance in a cloud service).

Local System
------------

Running it all on one machine for local access (your own laptop for instance).


Dependencies
............

PyGNOME, in particular, is a complex system with many dependencies on various scientific packages.
Many of the dependencies are available through the pip package manager, but some need to be complied for your system.
You are free to satisfy the dependencies in whatever way works for you, but we use conda to manage it in our development and deployment work, and that is the best supported option.

Dependencies with conda
.......................

We recommend that you use the `conda <https://conda.io/docs/>`_ package management system to satisfy the dependencies. You probably want to set up a conda environment in which to run the system.

Each component has a conda_requirements file that specifies the packages needed for that component.

1) Install `miniconda <https://conda.io/miniconda.html>`_ or the `Anaconda <https://www.anaconda.com/distribution/>`_ distribution. Any 64 bit version will do, but WebGnome is currently using Python3.8 . (Note, you can install an environment with any supported version of python with any miniconda version)

The rest of these steps assume a version of conda is installed, and you have access to a command line. The steps should be the same on all platforms except where noted.

2) update conda:

It's a good idea to start off with an updated version of conda itself::

  conda update conda

3) Setting up anaconda.org channels
...................................

To get all the packages required, you need to access the conda-forge collection of packages:

https://conda-forge.org/


To make it easy for your install to find conda-forge packages, it should be added to your conda configuration:


    conda config --add channels conda-forge

When you add a channel to conda, it puts it at the top of the list.
So now when you install a package, conda will first look in conda-forge and then in the default channel.

This order should work well for WebGnome.

You can see what channels you have with::

    conda config --get channels

It should return something like this::

    --add channels 'defaults'   # lowest priority
    --add channels 'conda-forge'   # highest priority

In that order -- the order is important

(if you have other channels, that's fine, as long as conda-forge is the highest priority)

4) Create an environment for WebGnome::

It's a best practice to create a conda environment for the WebGnome stack, and it is most stable to install all the requirements for all the components at once. If you have the repositories for all the components "next to" each other you should be able to do this::

    conda create -n webgnome \
      --file adios_oil_data/adios_db/conda_requirements.txt \
      --file webgnomeapi/conda_requirements.txt \
      --file pygnome/conda_requirements.txt \
      --file webgnomeclient/conda_requirements.txt

or all on one line::

    conda create -n webgnome --file adios_oil_data/adios_db/conda_requirements.txt --file webgnomeapi/conda_requirements.txt --file pygnome/conda_requirements.txt --file webgnomeclient/conda_requirements.txt

That will create a conda environment called "webgnome", and install all the dependencies into it at once.


5) Activate that environment::

    conda activate webgnome

If you don't have a redis server installed on your system another way, you can use conda for that as well::

    conda install redis

(be sure to have the webgnome environment activated when you install redis)

This should have set up a complete conda environment that can run all the pieces of the WebGnome Stack. Do make sure that you have activated the environment before running any of the components.


Installing Everything
=====================

.. note::

  There are a number of related components, and their dependencies, that need to be installed to run the full WebGNOME application. Below is a description of the whole process, one by one.

  There is also a script: ``setup_stack.sh`` which will run all these steps for you. It should run on any *nix system (Linux, OS-X, and maybe the "git bash" prompt on Windows). And you can use that script as a guide to the steps, and copy and paste commands one by one into your command prompt.

You need to install and test each component in the correct order. These are the very basics -- if you run into an issue, refer to the instructions with each component (you can skip the requirements step).

adios_db
PyGNOME
WebGnome API

Here are the commands::

cd adios_oil_database/adios_db
python setup.py install

cd pygnome/py_gnome

python setup.py cleanall
python setup.py install

cd webgnomeapi
python setup.py install


**NOTE:** if you are going to be doing development on any of the components, or updating to newer code via git, then you should install in "develop" mode::

    python setup.py develop

rather than::

    python setup.py install

"develop" puts a link into python pointing back the source of the package -- so as you change it, it "takes" right away. "install" copies everything into the Python system, so you need to re-install if anything changes.

Once you have the two APIs running, you need the client:

The client is a Javascript app, deployed via node.js. It can be installed according to the directions in its README.

``adios_db``
------------

Once you have the source or repo (and the dependencies), installing ``adios_db`` is pretty straightforward::

    cd adios_db
    pip install ./

or

    pip install -e ./

You can then run the tests with::

    pytest --pyargs adios_db

They should all pass.


py_gnome
--------

Once you have the source or repo (and the dependencies), installing the py_gnome is also straightforward::

    cd py_gnome

For Windows and Linux::

    python setup.py install

or

    python setup.py develop

NOTE: the py_gnome paccke does not currently install with pip, you need to use the ``setup.py`` command

This requires building a bunch of C++ code, so it takes a while.

You can then run the tests with::

    cd tests/unit_tests/
    pytest

If they all pass, you can run the full set with::

    pytest --runslow


WebGnome API
------------

As we move along, this will start to feel familiar...

    pip install ./

or::

    pip install -e ./

In order to run (or test) the API, you need to be running Redis. In another terminal window::

    conda activate webgnome
    redis-server

Then you can test it with::

    pytest


WebGnome Client
---------------

(for more details on installing the Client see the README.md file in this dir)

The client is getting to new ground -- it is a javascript app, deployed with the node ecosystem.

node can be installed via conda, a system pacackage manager, or an installer.
(https://nodejs.org/en/)


Once node is installed, you can use npm to install everything else required.

First we need "grunt", which can be installed with npm::

  npm install -g grunt

Install all of the applications dependencies::

  npm install


There are a couple ways to setup and run the app, but for running locally::

  grunt develop

Will do the trick. This sets up a working development environment by reinstalling client side dependancies, compiling less files, starting a http server on port 8080, and setting up a watch task for the less to recompile on change.

Running the System
==================

Once everything is installed, you need to run three separate servers (this is easiest do do in three separate command windows):




Linux Server
============

If you want to run it all on the same Linux server, the above instructions should suffice. But in a production environment, you may want to set up a more robust and flexible system.

NOAA is running our operational system(s) in a set of Docker images.

Please reach out if you want help doing that.







