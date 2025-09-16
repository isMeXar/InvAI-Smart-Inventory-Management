from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone', 'profile_pic']
        read_only_fields = ['id']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username