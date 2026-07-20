from django.urls import path
from .views import (
    ChatRoomListCreateView,
    MessageHistoryListView,
    MarkRoomMessagesReadView
)

urlpatterns = [
    path('rooms/', ChatRoomListCreateView.as_view(), name='chat_rooms'),
    path('rooms/<uuid:room_id>/messages/', MessageHistoryListView.as_view(), name='chat_messages_history'),
    path('rooms/<uuid:room_id>/read/', MarkRoomMessagesReadView.as_view(), name='chat_mark_read'),
]
