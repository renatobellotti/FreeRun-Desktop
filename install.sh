virtual_env_dir=.virtualenv
python3 -m virtualenv $virtual_env_dir
source $virtual_env_dir/bin/activate
pip3 install -r requirements.txt
