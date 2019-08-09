##################
The WebGNOME Stack
##################


The WebGNOME stack is a complete system for running a Web-based client-server oil spill fate and transport model. It consists of a number of components that all work together, and they all need to be installed and configured properly in order to work together. All the server-side components are written in Python, and the client is written in Javascript

All components are available on the NOAA-ORR-ERD organization on gitHub:

https://github.com/NOAA-ORR-ERD

Or perhaps you are working with the source from elsewhere )(like inside NOAA). In which case, you want to use everything from the same source if you can, to make sure versions match.

You will need to download the source (or clone the repo) for all components to the machine you want to run it on.

The entire stack is developed, tested, and should run on Windows, OS-X and Linux Systems.


Server Side
===========

On the server, you need:

pyGNOME
-------

This is the model itself, the computational code for fate and transport modeling. It can be run with python scripts on its own, or used behind the WebGNOME system.

It is available on gitHub here: https://github.com/NOAA-ORR-ERD/PyGnome.


OilLibrary
----------

The OilLibrary is a Python package that provides a library of properties for many oils, as well as the code to work with library, and provide what pyGNOME needs to perform fate and weathering calculations.

https://github.com/NOAA-ORR-ERD/OilLibrary


WebGNOME API
------------

The WebGNOME API is a python (Pyramid) package that provides an http / JSON web service to control and run the pyGNOME model. It provides the connection between the computational code on teh server and the client side code running in a browser.

https://github.com/NOAA-ORR-ERD/WebGnomeAPI


Oil Library API
---------------

The Oil Library API is a python (Pyramid) package that provides an http / JSON web service to access the oil library.

https://github.com/NOAA-ORR-ERD/OilLibraryAPI


WebGNOME Client
---------------

The WebGNOME client is a Javascript application, that runs in the browser and provides a user interface to the GNOME system. It is served with node.js


https://github.com/NOAA-ORR-ERD/WebGnomeClient

redis
-----

Redis is an open source (BSD licensed), in-memory data structure store, used as a data store for session data by the WebGNOMEAPI And OilLibraryAPI. It is not maintained or distributed by NOAA, but you must have a Redis server running in order run the WebGNOME stack:

https://redis.io/

(it can be optionally installed with conda, too -- see below)


Installation / Deployment
=========================

You have a number of options to deploy the system. All five components need to be installed and run, but you can run the WebGNOME API, OilLibraryAPI, and WebGNOME Client all on one machine, or on separate machines, or separate Docker images (or multiple instance in a cloud service).

Local System
------------

Running it all on one machine for local access (your own laptop for instance).


Dependencies
............

PyGNOME, in particular, is a complex system with many dependencies on various scientific packages. AMy of the dependencies are available through the pip package manager, but some need to be complied for your system. You are free to satisfy the dependencies in whatever way works for you, but we use conda to manage it in our development and deployment work, and that is the best supported option.

Dependencies with conda
.......................

We recommend that you use the `conda <https://conda.io/docs/>`_ package management system to satisfy the dependencies. You probably want to set up a conda environment in which to run the system.

Each component has a conda_requirements file that specifies the packages needed for that component.

1) Install `miniconda <https://conda.io/miniconda.html>`_ or the `Anaconda <https://www.anaconda.com/distribution/>`_ distribution. Any 64 bit version will do, but WebGNOME is built with Python 2.7, so if you don't need Python 3 for other projects, it's a bit easier to use the Py2.7 conda. (Note, you can install an environment with any supported version of python with any miniconda version)

The rest of these steps assume a version of conda is installed, and you have access to a command line. The steps should be the same on all platforms except where noted.

2) update conda:

It's a good idea to start off with an updated version of conda itself::

  conda update conda

3) Setting up anaconda.org channels
...................................

To get all the packages required, you need to access additional sources, in this case:

conda-forge: A community supported collection of packages

NOAA-ORR-ERD: A NOAA supported source of packages not available in defaults or conda-forge

To make it easy for your install to find conda-forge and NOAA packages, they should be added to your conda configuration:

First add the NOAA-ORR-ERD channel::

    conda config --add channels NOAA-ORR-ERD

And then add the conda-forge channel::

    conda config --add channels conda-forge

When you add a channel to conda, it puts it at the top of the list.
So now when you install a package, conda will first look in conda-forge,
then NOAA-ORR-ERD, and then in the default channel.
This order should work well for WebGNOME.

Be sure to add the channels in the order we specify.  You can see what channels you have with::

    conda config --get channels

It should return something like this::

    --add channels 'defaults'   # lowest priority
    --add channels 'NOAA-ORR-ERD'
    --add channels 'conda-forge'   # highest priority

In that order -- the order is important

4) Create an environment for webGNOME::

It is most stable to install all the requirements for all the components at once. If you have the repositories for all the components "next to each other" you should be able to do this::

    conda install --yes \
      --file OilLibrary/conda_requirements.txt \
      --file oillibraryapi/conda_requirements.txt \
      --file webgnomeapi/conda_requirements.txt \
      --file pygnome/conda_requirements.txt \
      --file webgnomeclient/conda_requirements.txt

or all on one line::

    conda install --yes --file OilLibrary/conda_requirements.txt --file oillibraryapi/conda_requirements.txt --file webgnomeapi/conda_requirements.txt --file pygnome/conda_requirements.txt --file webgnomeclient/conda_requirements.txt

If you don't have a redis server installed on your system another way, you can use conda for that as well::

    conda install redis


5) Activate that environment::

    conda activate webgnome

6) Install the pip requirements: Some of WebGNOME's requirements are not (yet) available as conda packages. You can use pip to install these::


    cd  webgnomeapi
    pip install -r pip_requirements.txt

(make sure that you are in the activated environment before you do any of that)

This should have set up a complete conda environment that can run all the pieces of the WebGNOME Stack. Do make sure that you have activated the environment before running any of the components.

Installing Everything
=====================

You need to install and test each component in the correct order. These are the very basics -- if you run into an issue, refer to the instructions with each component (you can skip the requirements step).

OilLibrary
PyGNOME
WebGNOME API
Oil Library API

Here are the commands::

cd OilLibrary
python setup.py cleanall
python setup.py develop

cd pygnome/py_gnome

# for the mac: ./build_anaconda.sh cleanall
# for the mac: ./build_anaconda.sh develop
python setup.py cleanall
python setup.py develop

cd webgnomeapi
python setup.py develop


cd oillibraryapi/
python setup.py develop


**NOTE:** if you are going to doing development on any of the components, or updating to newer code via git, then you should install in "develop" mode::

    python setup.py develop

rather than::

    python setup.py install

"develop" puts a link into python pointing back the source of the package -- so as you change it, it "takes" right away. "install" copies everything into the Python system, so you need to re-install if anything changes.

Once you have the two APIs running, you need the client:

The client is a Javascript app, deployed via node.js. It can be installed according to the directions in its README.

OilLibrary
----------

Once you have the source or repo (and the dependencies), installing the oil_libary is pretty straightforward::

    python setup.py install

or

    python setup.py develop

You can then run the tests with::

    pytest --pyargs oil_library

They should all pass.


py_gnome
--------

Once you have the source or repo (and the dependencies), installing the py_gnome is almost straightforward::

    cd py_gnome

For Windows and Linux::

    python setup.py install

or

    python setup.py develop

For OS-X -- there are some linking issues with conda on OS-X, so you need antoher script::

    ./build_anaconda install

or::

    ./build_anaconda install

This requires building a bunch of C++ code, so it takes a while.

You can then run the tests with::

    cd tests/unit_tests/
    pytest

If they all pass, you can run the full set with::

    pytest --runslow

oillibraryapi
-------------

Once you have the source, you need to install it, and test it::

    python setup.py install

or::

    python setup.py develop

Then you can test it with::

    pytest


webgnomeapi
-----------

As we move along, this will start to feel familiar...

    python setup.py install

or::

    python setup.py develop

In order to run (or test) the API, you need to be running Redis. In another terminal window::

    conda activate webgnome
    redis-server

Then you can test it with::

    python setup.py test


webgnomeclient
--------------

The client is getting to new ground -- it is a javascript app, deployed with the node ecosystem. node itself should have been installed from the conda requirements.

To install and "build" the requirements and code:

Install all of the applications dependencies described in ``package.json``. Calls `grunt install` upon completion::

  npm install

NOTE: npm should have been installed with the nodejs conda package (or with node installed any other way).

There are a couple ways to setup and run the app::

  grunt develop

Sets up a working development environment by reinstalling client side dependancies, compiling less files, starting a http server on port 8080, and setting up a watch task for the less to recompile on change.

Linux Server
============

If you want to run it all on the same Linux server, the above instructions should suffice. But in a production environment, you may want to set up a more robust and flexible system.


Docker Images
-------------

TBD






