# Generated by Django 5.2.4 on 2025-07-13 13:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_user_email_verified_practiceattempt_publicquestion_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(blank=True, help_text='Optional phone number for SMS notifications', max_length=20, null=True),
        ),
    ]
