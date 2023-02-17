import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer

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
            data = {
                'type': 'send_message',
                'message': message,
                'event': event
            }
        else:
            data = {
                'type': 'send_message',
                'message': message,
                'question': 'Play again?',
                'event': event
            }
        
        # Send message to room group
        await self.channel_layer.group_send(self.room_group_name, data)

    async def send_message(self, res):
        """ Receive message from room group """
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "payload": res,
        }))