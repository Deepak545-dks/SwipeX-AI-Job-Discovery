from django.urls import re_path
from .consumers import ChatConsumer, CallConsumer

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>[a-f0-9\-]+)/$', ChatConsumer.as_asgi()),
    re_path(r'ws/call/(?P<room_id>[a-f0-9\-]+)/$', CallConsumer.as_asgi()),
]
