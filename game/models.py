from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField
from django.urls import reverse


class Game(models.Model):
    board = ArrayField(models.IntegerField(), size=49, default=[-1]*49, blank=True)
    timestamp = models.DateTimeField(auto_now=True)
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    room = models.ForeignKey('GameRoom', default=666, on_delete=models.CASCADE)

    def __str__(self):
        return f'Room {self.room.name.upper()} Game'

class GameRoom(models.Model):
    name = models.CharField(max_length=255, default="lobby", unique=True)

    def __str__(self):
        return self.name

    def get_absolute_url(self): # new
        return reverse('home')

