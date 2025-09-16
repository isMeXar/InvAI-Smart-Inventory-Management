from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Employee', 'Employee'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Employee')
    phone = models.CharField(max_length=20, blank=True, null=True)
    profile_pic = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
