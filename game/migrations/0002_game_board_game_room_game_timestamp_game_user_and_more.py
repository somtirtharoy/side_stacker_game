# Generated by Django 4.0.9 on 2023-02-10 19:07

from django.conf import settings
import django.contrib.postgres.fields
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('game', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='board',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.IntegerField(), default=list, size=49),
        ),
        migrations.AddField(
            model_name='game',
            name='room',
            field=models.ForeignKey(default=666, on_delete=django.db.models.deletion.CASCADE, to='game.gameroom'),
        ),
        migrations.AddField(
            model_name='game',
            name='timestamp',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='game',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='gameroom',
            name='name',
            field=models.CharField(default='lobby', max_length=255),
        ),
    ]
