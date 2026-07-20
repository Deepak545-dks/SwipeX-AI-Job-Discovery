from rest_framework import serializers
from django.contrib.auth import get_user_model
from chat.models import ChatRoom, Message
from profiles.serializers import ProfileSerializer
from jobs.serializers import JobSerializer

User = get_user_model()

class ChatUserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='profile.full_name', read_only=True)
    avatar_url = serializers.CharField(source='profile.portfolio_url', read_only=True) # Fallback / reuse profile field

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'full_name', 'avatar_url')

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'room', 'sender', 'sender_email', 'content', 'is_read', 'created_at')
        read_only_fields = ('id', 'sender', 'sender_email', 'is_read', 'created_at')

class ChatRoomSerializer(serializers.ModelSerializer):
    seeker_details = ChatUserSerializer(source='seeker', read_only=True)
    recruiter_details = ChatUserSerializer(source='recruiter', read_only=True)
    job_details = JobSerializer(source='job', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = (
            'id', 'seeker', 'seeker_details', 'recruiter', 'recruiter_details',
            'job', 'job_details', 'last_message', 'unread_count', 'created_at'
        )
        read_only_fields = ('id', 'seeker_details', 'recruiter_details', 'job_details', 'created_at')

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Count unread messages sent by the other user
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0
