from django.urls import path
from .views import (
    NotificationListView,
    MarkNotificationReadView,
    MarkAllNotificationsReadView,
    PushSubscribeView
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification_list'),
    path('<uuid:pk>/read/', MarkNotificationReadView.as_view(), name='mark_notification_read'),
    path('read-all/', MarkAllNotificationsReadView.as_view(), name='mark_all_notifications_read'),
    path('push/subscribe/', PushSubscribeView.as_view(), name='push_subscribe'),
]
