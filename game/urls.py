from . import views
from django.urls import path

urlpatterns = [
    path('', views.index, name='home'),
    path('game/<str:room_code>', views.game, name='room')
]