import socket
import os
import json
from django.shortcuts import render
from django.conf import settings
from django.http import HttpResponse

# Create your views here.
def index(request):
    list_of_files = [file for file in os.listdir(settings.DATA_FILE_DIR) if file.endswith('.gpx')]
    print(json.dumps(list_of_files))
    context = {
        'ip': socket.gethostbyname(socket.gethostname()),
        'list_of_datafiles': json.dumps(list_of_files),
    }
    return render(request, 'freerun/index.html', context)

def get_file(request, filename):
    path = settings.DATA_FILE_DIR + filename
    print(path)
    assert(len(filename) > 0)
    file_contents = None
    with open(path, 'r') as file:
        file_contents = file.read()
    
    return HttpResponse(file_contents, content_type='application/gpx+xml')
