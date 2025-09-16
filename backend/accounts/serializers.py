from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'phone', 'profile_pic', 'name']
        read_only_fields = ['id', 'name']

    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username