from rest_framework import serializers
from .models import SiteSettings, Question, Solution, Option, AnswerKey, Chapter, Topic, QuestionType, QuestionImage, SolutionImage, AnswerKeyImage, PracticeAttempt, PublicQuestion, PublicSolution

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ['site_name', 'logo', 'banner', 'homepage_content', 'updated_at']

class PracticeAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PracticeAttempt
        fields = ['id', 'user', 'question', 'selected_option', 'is_correct', 'attempted_at']

class QuestionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionImage
        fields = ['id', 'image']

class SolutionImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SolutionImage
        fields = ['id', 'image']

class AnswerKeyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnswerKeyImage
        fields = ['id', 'image']

class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct', 'image']

class SolutionSerializer(serializers.ModelSerializer):
    images = SolutionImageSerializer(many=True, read_only=True)
    class Meta:
        model = Solution
        fields = ['id', 'text', 'content', 'images']

class AnswerKeySerializer(serializers.ModelSerializer):
    images = AnswerKeyImageSerializer(many=True, read_only=True)
    class Meta:
        model = AnswerKey
        fields = ['id', 'answer', 'content', 'images']

class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)
    solutions = SolutionSerializer(many=True, read_only=True)
    answer_keys = AnswerKeySerializer(many=True, read_only=True)
    images = QuestionImageSerializer(many=True, read_only=True)
    class Meta:
        model = Question
        fields = [
            'id', 'text', 'content', 'level', 'qtype', 'topic', 'created_by', 'created_at',
            'options', 'solutions', 'answer_keys', 'images'
        ]

class ChapterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chapter
        fields = ['id', 'name', 'description']

class TopicSerializer(serializers.ModelSerializer):
    chapter = ChapterSerializer(read_only=True)
    class Meta:
        model = Topic
        fields = ['id', 'name', 'description', 'chapter']

class QuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionType
        fields = ['id', 'name', 'description']

# --- Public Q&A Serializers ---
class PublicSolutionSerializer(serializers.ModelSerializer):
    answered_by = serializers.SerializerMethodField()
    class Meta:
        model = PublicSolution
        fields = ['id', 'answer_text', 'answer_image', 'answered_by', 'created_at']
    def get_answered_by(self, obj):
        return obj.answered_by.username if obj.answered_by else None

class PublicQuestionSerializer(serializers.ModelSerializer):
    solution = PublicSolutionSerializer(read_only=True)
    class Meta:
        model = PublicQuestion
        fields = ['id', 'user', 'session_id', 'text', 'image', 'status', 'created_at', 'solution']
