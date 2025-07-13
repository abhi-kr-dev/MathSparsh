from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor_uploader.fields import RichTextUploadingField

# Custom user model to handle roles
class User(AbstractUser):
    ROLE_CHOICES = [
        ('free', 'Free User'),
        ('premium', 'Premium User'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='free')
    email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True, null=True, help_text='Optional phone number for SMS notifications')

class Chapter(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    def __str__(self):
        return self.name

class Topic(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='topics')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    def __str__(self):
        return f"{self.chapter.name} - {self.name}"

class QuestionType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    def __str__(self):
        return self.name

class Question(models.Model):
    LEVEL_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    text = RichTextUploadingField()
    content = RichTextUploadingField(blank=True, help_text='Use LaTeX for equations.')
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    qtype = models.ForeignKey(QuestionType, on_delete=models.CASCADE, related_name='questions')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='questions')
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"{self.text[:50]}... ({self.get_level_display()})"

class Option(models.Model):
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=512)
    is_correct = models.BooleanField(default=False)
    image = models.ImageField(upload_to='option_images/', blank=True, null=True)
    def __str__(self):
        return f"Option for: {self.question.text[:30]}... {'(Correct)' if self.is_correct else ''}"

class QuestionImage(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='question_images/')
    def __str__(self):
        return f"Image for: {self.question.text[:30]}..."


class Solution(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='solutions')
    text = RichTextUploadingField()
    content = RichTextUploadingField(blank=True, help_text='Use LaTeX for equations.')
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Solution for: {self.question.text[:30]}..."

class SolutionImage(models.Model):
    solution = models.ForeignKey(Solution, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='solution_images/')
    def __str__(self):
        return f"Image for Solution: {self.solution.question.text[:30]}..."

class AnswerKey(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answer_keys')
    answer = models.CharField(max_length=255)
    content = RichTextUploadingField(blank=True, help_text='Use LaTeX for equations.')
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return f"Answer Key for: {self.question.text[:30]}..."

class AnswerKeyImage(models.Model):
    answer_key = models.ForeignKey(AnswerKey, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='answerkey_images/')
    def __str__(self):
        return f"Image for AnswerKey: {self.answer_key.question.text[:30]}..."
class SiteSettings(models.Model):
    site_name = models.CharField(max_length=100, default="MathSparsh")
    logo = models.ImageField(upload_to="site_logo/", blank=True, null=True)
    banner = models.ImageField(upload_to="site_banner/", blank=True, null=True)
    homepage_content = RichTextUploadingField(blank=True, help_text='Homepage dynamic content (supports rich text and LaTeX)')
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return "Site Settings"

class PracticeAttempt(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='practice_attempts')
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name='attempts')
    selected_option = models.ForeignKey('Option', on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField(default=False)
    attempted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Q{self.question.id} - {'Correct' if self.is_correct else 'Incorrect'}"

# Public Q&A system for user-submitted questions (free/premium users)
class PublicQuestion(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('answered', 'Answered'),
    ]
    user = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, help_text='Null for free/anonymous users')
    session_id = models.CharField(max_length=64, blank=True, help_text='Session or browser id for anonymous users')
    text = models.TextField(blank=True)
    image = models.ImageField(upload_to='user_questions/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"User Q{self.id}: {self.text[:40]}... ({self.get_status_display()})"

class PublicSolution(models.Model):
    question = models.OneToOneField(PublicQuestion, on_delete=models.CASCADE, related_name='solution')
    answer_text = models.TextField(blank=True)
    answer_image = models.ImageField(upload_to='user_solutions/', blank=True, null=True)
    answered_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='answered_public_questions')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Solution for User Q{self.question.id} by {self.answered_by.username if self.answered_by else 'staff'}"
