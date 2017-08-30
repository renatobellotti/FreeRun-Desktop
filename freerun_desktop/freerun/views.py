import socket
import os
import json
from django.shortcuts import render
from django.conf import settings

# Create your views here.
def index(request):
    list_of_files = [file for file in os.listdir(settings.DATA_FILE_DIR) if file.endswith('.gpx')]
    print(json.dumps(list_of_files))
    context = {
        'ip': socket.gethostbyname(socket.gethostname()),
        'list_of_datafiles': json.dumps(list_of_files),
    }
    return render(request, 'freerun/index.html', context)
