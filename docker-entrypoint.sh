#!/bin/bash
set -e

echo "Waiting for PostgreSQL to be ready..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  sleep 1
done

echo "PostgreSQL is ready!"

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Creating superuser if not exists..."
python manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@invai.com', 'admin123')
    print('Superuser created: username=admin, password=admin123')
else:
    print('Superuser already exists')
END

echo "Populating sample data if database is empty..."
python manage.py shell << END
from inventory.models import Product
if Product.objects.count() == 0:
    import os
    os.system('python manage.py populate_data')
    os.system('python manage.py create_sample_notifications --count 15')
    print('Sample data populated successfully')
else:
    print('Database already contains data')
END

echo "Starting Django server..."
exec "$@"
