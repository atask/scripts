# install virtualenv
pip install virtualenv
# make virtual env folder
virtualenv notebook
# activate env
. notebook/bin/activate
# install jupyter notebook
pip install jupyter
# install sframe
pip install -U sframe
# install graphlab create
pip install --upgrade --no-cache-dir https://get.dato.com/GraphLab-Create/1.8/<USER-NAME>/<LICENCE-CODE>/GraphLab-Create-License.tar.gz
# install matplotlib
pip install matplotlib
# start notebook
jupyter notebook
