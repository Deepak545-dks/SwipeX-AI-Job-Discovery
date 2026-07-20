from rest_framework import serializers
from notifications.models import Notification, PushSubscription

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'title', 'message', 'notification_type', 'is_read', 'created_at')
        read_only_fields = ('id', 'recipient', 'created_at')

class PushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = ('id', 'user', 'endpoint', 'p256dh', 'auth')
        read_only_fields = ('id', 'user')
