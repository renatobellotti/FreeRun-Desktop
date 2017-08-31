import socket
import os
import json
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse
from .GPXData import GPXData

# Create your views here.
def index(request):
    list_of_files = [file for file in os.listdir(settings.DATA_FILE_DIR) if file.endswith('.gpx')]
    # TODO: make this defined behaviour even if the list is empty
    gpx_data = GPXData(settings.DATA_FILE_DIR + list_of_files[0])
    first_point = gpx_data.get_first_data_point()
    context = {
        'ip': socket.gethostbyname(socket.gethostname()),
        'list_of_datafiles': json.dumps(list_of_files),
        'start_lat': first_point['latitude'],
        'start_lon': first_point['longitude'],
    }
    return render(request, 'freerun/index.html', context)

def get_file(request, filename):
    path = settings.DATA_FILE_DIR + filename
    file_contents = None
    with open(path, 'r') as file:
        file_contents = file.read()
    
    return HttpResponse(file_contents, content_type='application/gpx+xml')

def get_data(request, filename):
    gpx_data = GPXData(settings.DATA_FILE_DIR + filename)
    return HttpResponse(json.dumps(gpx_data.get_data()))
