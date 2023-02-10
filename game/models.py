from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class Game(models.Model):
    board = ArrayField(models.IntegerField(), size=49, default=list)
    timestamp = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, default=1, on_delete=models.CASCADE)
    room = models.ForeignKey('GameRoom', default=666, on_delete=models.CASCADE)

class GameRoom(models.Model):
    name = models.CharField(max_length=255, default="lobby")
