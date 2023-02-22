from .views import index, game
from .views import RoomCreateView
from django.urls import path

urlpatterns = [
    path('', index, name='home'),
    path('game/<str:room_code>', game, name='room'),
    path('room/new', RoomCreateView.as_view(), name='new_room')
]