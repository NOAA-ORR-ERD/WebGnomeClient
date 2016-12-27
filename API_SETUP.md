WebgnomeAPI [![build status](https://srccontrol.orr.noaa.gov/gnome/webgnomeapi/badges/master/build.svg)](https://srccontrol.orr.noaa.gov/gnome/webgnomeapi/commits/master)
============

### Installation
`conda create -n webgnomeapi python=2`
`source activate webgnomeapi`

__PyGnome__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/pygnome.git`
2. `cd pygnome`
3. `git checkout develop`
4. `conda install --file conda_requirements.txt`
5. `cd py_gnome`
6. `python setup.py develop`

__OilLibrary__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/OilLibrary.git`
2. `cd OilLibrary`
3. `pip install -r requirements.txt`
4. `conda install unit_conversion`
5. `python setup.py develop`

__WebgnomeAPI__
1. `git clone https://srccontrol.orr.noaa.gov/gnome/webgnomeapi.git`
2. `cd webgnomeapi`
3. `git checkout develop`
4. `pip install -r requirements.txt`
5. `python setup.py develop`
