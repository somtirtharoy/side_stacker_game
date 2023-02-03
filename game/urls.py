from . import views
from django.urls import path

urlpatterns = [
    path('', views.index),
    path('game/<str:room_code>', views.game)
]