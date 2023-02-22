import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Game
from datetime import datetime

User = get_user_model()

class GameConsumer(AsyncJsonWebsocketConsumer):

    async def connect(self):
        print("Connected")
        self.room_name = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'room_{self.room_name}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        print("Disconnected")
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        print("Received")
        """
        Receive message from WebSocket.
        Get the event and send the appropriate event
        """
        print("Received")
        response = json.loads(text_data)
        event = response.get("event", None)
        message = response.get("message", None)
        if event == 'END':
            # save end game
            await self.save_game(response)

            data = {
                'type': 'send_message',
                'message': message,
                'question': 'Play again?',
                'event': event
            }
        else:
            data = {
                'type': 'send_message',
                'message': message,
                'event': event
            }
        
        # Send message to room group
        await self.channel_layer.group_send(self.room_group_name, data)
    
    @database_sync_to_async
    def save_game(data):
        board = data['game']
        timestamp = datetime.now()
        username = data['username']
        room_code = data['room_code']
        user = User.objects.filter(username=username)[0]
        game = Game.objects.get_or_create(
            board=board,
            timestamp=timestamp,
            user=user,
            room=room_code
        )
        game.save()

    async def send_message(self, res):
        """Receive message from room group"""
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))