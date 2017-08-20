virtual_env_dir=.virtualenv
python3 -m virtualenv $virtual_env_dir
source $virtual_env_dir/bin/activate
pip install -r requirements.txt
