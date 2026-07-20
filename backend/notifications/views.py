from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from notifications.models import Notification, PushSubscription
from notifications.serializers import NotificationSerializer, PushSubscriptionSerializer

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        # Retrieve notifications for user, ordered by most recent
        return Notification.objects.filter(recipient=user)

class MarkNotificationReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        notification = get_object_or_404(Notification, id=pk)
        
        # Enforce ownership check
        if notification.recipient != request.user:
            return Response({"error": "You are not the recipient of this notification."}, status=status.HTTP_403_FORBIDDEN)
            
        notification.is_read = True
        notification.save()
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

class MarkAllNotificationsReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        Notification.objects.filter(recipient=user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)

class PushSubscribeView(generics.CreateAPIView):
    serializer_class = PushSubscriptionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        # Prevent duplicate subscriptions for same user/endpoint combination
        user = self.request.user
        endpoint = serializer.validated_data.get('endpoint')
        
        PushSubscription.objects.filter(user=user, endpoint=endpoint).delete()
        serializer.save(user=user)
