# FreeRun-Desktop
Analyses your fitness progress by comparing GPX data: display them on a map, show speed and height difference curves

# Notice:
This program is currently at an early stage, but it will be updated and extended in the future :)
At the moment it is possible to display tracks from single-track single-track-segment GPX files on a map and plot the speed curves as well as the height-difference curves.

**Warning:** Currently, there is no authentication. This means that Everybody who connected to the same network, e. g. uses the same wifi, can access your server (and read your GPX data). Also, ```ALLOWED_HOSTS``` is not set yet. Debugging is enabled as well.

# Installation
- Clone the repo: ```git clone git@github.com:renatobellotti/FreeRun-Desktop.git```
- ```cd FreeRun-Desktop```
- Add a Font-Awesome key:

  ```cp freerun_desktop/freerun_desktop/api_keys_template.py freerun_desktop/freerun_desktop/api_keys.py```
  
  If you don't have a key yet, you can get one for free at http://fontawesome.io/get-started/. It's super easy!
  
  Now open the file ```freerun_desktop/freerun_desktop/api_keys.py``` with your favourite text editor and enter your FontAwesome key (between parenthesis). If your key, for example, is ```XXXXXXXXXX```, then enter ```"XXXXXXXXXX"```.
- Install the dependencies in a virtualenv:
  
  ```./install.sh```
  
  Activate the virtualenv:
  
  ```source .virtualenv/bin/activate```
- Start the server:
  
  ```./start_server.sh```

- You can use the program by opening your browser at http://localhost:8000. The program will look for GPX files in the folder ```~/Dokumente/freerun/```. To change this behaviour, just set the value of ```DATA_FILE_DIR``` at the bottom of the settings.py file to the desired folder.
