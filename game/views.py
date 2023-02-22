from django.shortcuts import render, redirect
from django.views.generic.edit import CreateView
from django.http import Http404
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from .models import GameRoom

# Create your views here.

def index(request):
    if request.method == 'POST':
        username = request.POST.get("user_name")
        room_code = request.POST.get("room_code")
        char_choice = request.POST.get("character_choice")
        return redirect(
            f'/game/{room_code}?&choice={char_choice}'
        )
        
    # get room names from database
    game_room_list = [ obj.name for obj in GameRoom.objects.all()]
    return render(request, 'index.html', context={'room_list': game_room_list})

@login_required
def game(request, room_code):
    board_size = 49
    choice = request.GET.get("choice")
    if choice not in ['X', 'O', '-']:
        raise Http404("Choice does not exists")

    context = {
        "char_choice": choice, 
        "room_code": room_code,
        'indexes': [i for i in range(board_size)]
    }

    return render(request, "board.html", context)

# using class based view for creating the cfreate room view
@method_decorator(login_required, name='dispatch')
class RoomCreateView(CreateView):
    model = GameRoom
    template_name = 'create_room.html'
    fields = ['name']
