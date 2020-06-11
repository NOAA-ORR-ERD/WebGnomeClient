# shell script to set up the web gnome stack

# WARNING: still experimental, but it works on Chris' Mac

# this is expecting that you have all the repositories "next to" each other.
#  and are running this from the dir they are all in.

# this should be run with:
#  source setup_stack.sh
#
#  or you can copy and paste the individual commands to the command line
#
# prerequisite: a conda environment called "webgnome" already
# created with:
#   conda create -n webgnome python=2


# NOTE: it may not work to activate a conda environment in a script.
# best to adtivate it before running this script.
# conda activate webgnome

conda install --yes \
  --file OilLibrary/conda_requirements.txt \
  --file oillibraryapi/conda_requirements.txt \
  --file webgnomeapi/conda_requirements.txt \
  --file pygnome/conda_requirements.txt \
  --file webgnomeclient/conda_requirements.txt

pushd OilLibrary
python setup.py cleanall
pip install -e ./
popd

pushd pygnome/py_gnome
./build_anaconda.sh cleanall
./build_anaconda.sh develop
popd

pushd webgnomeapi
pip install -r pip_requirements.txt
pip install -e ./
popd

pushd oillibraryapi/
# pip install -r pip_requirements.txt
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






