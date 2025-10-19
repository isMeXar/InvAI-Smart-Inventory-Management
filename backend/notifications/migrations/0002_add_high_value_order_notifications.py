# Generated migration for adding high-value order notification support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='notification',
            name='notification_type',
            field=models.CharField(
                choices=[
                    ('info', 'Information'),
                    ('success', 'Success'),
                    ('warning', 'Warning'),
                    ('error', 'Error'),
                    ('inventory_low', 'Low Inventory'),
                    ('order_status', 'Order Status'),
                    ('order_high_value', 'High Value Order'),
                    ('user_action', 'User Action'),
                    ('system', 'System')
                ],
                default='info',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='notificationpreference',
            name='email_order_high_value',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='notificationpreference',
            name='push_order_high_value',
            field=models.BooleanField(default=True),
        ),
    ]
