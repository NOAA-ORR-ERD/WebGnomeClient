# **NOTE** These instructions are somewhat out of date. They really need to be updated.

# WebgnomeAPI [![build status](https://srccontrol.orr.noaa.gov/gnome/webgnomeapi/badges/master/build.svg)](https://srccontrol.orr.noaa.gov/gnome/webgnomeapi/commits/master)
============

WebgnomeAPI requires a running redis server on the same system. Depending on your operating system the process to install and run redis varies, but once redis is installed, you can usually run it with:

`$ redis-server`

The default configuration usually works

#### Installing redis

**Linux:** It's usally easy to install redis with the system package manager, .e.g.:

`$ yum install redis`

or

`$ apt install redis`

**Windows and Mac:**

redis is available as a conda package on conda-forge. If you are using conda and conda-forge for everything else (which we recommend), then it's as easy as:

`conda install redis`

Alternatively, For Windows there are binaries availabe on GitHub here:
https://github.com/MSOpenTech/redis/releases.

For the Mac, Homebrew has redis, if  you are using homebrew for other things already: https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/


### Installation of the WebGNOME API

`conda create -n webgnomeapi python=2`

`conda activate webgnomeapi`

__PyGnome__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/pygnome.git`
2. `cd pygnome`
3. `git checkout develop`
4. `conda install --file conda_requirements.txt`
5. `cd py_gnome`
6. `python setup.py develop`

__WebgnomeAPI__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/webgnomeapi.git`
2. `cd webgnomeapi`
3. `git checkout develop`
4. `pip install -r requirements.txt`
5. `python setup.py develop`
6. `python setup.py compilejson`

### Running
`pserve --reload config-example.ini` (localhost:9899)


# adios_db

`adios_db` is required if you want to simulate oil weathering.


### Installation
`conda create -n oillibraryapi python=2`
`source activate oillibraryapi`

__OilLibrary__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/OilLibrary.git`
2. `cd OilLibrary`
3. `pip install -r requirements.txt`
4. `conda install unit_conversion`
5. `python setup.py develop`

__OilLibraryAPI__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/oillibraryapi.git`
2. `cd oillibraryapi`
3. `pip install -r requirments.txt`
4. `conda install scipy`
5. `python setup.py develop`

### Running
`pserve --reload config_example` (localhost:9898)
