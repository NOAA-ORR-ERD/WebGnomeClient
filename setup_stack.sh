# shell script to set up the web gnome stack

# WARNING: still experimental, but it works on Chris' Mac

# this is expecting that you have all the repositories "next to" each other.
# and are running this from this dir (webgnomeclient)

# this should be run with:
#  source setup_stack.sh
#
#  or you can copy and paste the individual commands to the command line
#
# prerequisite: a conda environment called "webgnome" already
# created with:
#   conda create -n webgnome python=3.9


# NOTE: it may not work to activate a conda environment in a script.
# best to adtivate it before running this script.
# conda activate webgnome

conda install --yes \
  --file ../pygnome/conda_requirements.txt \
  --file ../pygnome/conda_requirements_docs.txt \
  --file ../pygnome/conda_requirements_build.txt \
  --file ../pygnome/conda_requirements_test.txt \
  --file ../oil_database/adios_db/conda_requirements.txt \
  --file ../oil_database/adios_db/conda_requirements_optional.txt \
  --file ../oil_database/adios_db/conda_requirements_test.txt \
  --file ../webgnomeapi/conda_requirements.txt \
  --file ../webgnomeapi/conda_requirements.txt \
  --file ../webgnomeapi/conda_requirements_test.txt
  --file conda_requirements.txt \

pushd ../pygnome/py_gnome
./setup.py cleanall
./setup.py  develop
popd

pushd ../oil_database/adios_db/
./setup.py clean
pip install -e ./
popd

pushd webgnomeapi
./setup.py cleanall
pip install -e ./
popd

pushd webgnomeclient
mkdir config
cp config-example.json config/config.json
ln -s config/config.json config.json
npm install
npm install -g grunt
grunt install
popd






