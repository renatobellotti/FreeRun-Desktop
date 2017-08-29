from django.shortcuts import render
import socket

# Create your views here.
def index(request):
    context = {'ip': socket.gethostbyname(socket.gethostname())}
    return render(request, 'freerun/index.html', context)
