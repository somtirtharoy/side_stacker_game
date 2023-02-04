from django.shortcuts import render, redirect
from django.http import Http404

# Create your views here.

def index(request):
    if request.method == 'POST':
        room_code = request.POST.get("room_code")
        char_choice = request.POST.get("character_choice")
        return redirect(
            '/game/%s?&choice=%s'
            %(room_code, char_choice)
        )
        
    return render(request, 'index.html')

def game(request, room_code):
    board_size = 49
    choice = request.GET.get("choice")
    if choice not in ['X', 'O']:
        raise Http404("Choice does not exists")

    context = {
        "char_choice": choice, 
        "room_code": room_code,
        'indexes': [i for i in range(board_size)]
    }

    return render(request, "board.html", context)