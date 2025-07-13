from django.contrib import admin
from .models import User, Chapter, Topic, Question, Solution, AnswerKey, QuestionType, QuestionImage, SolutionImage, AnswerKeyImage, Option, SiteSettings, PracticeAttempt, PublicQuestion, PublicSolution

class OptionInline(admin.TabularInline):
    model = Option
    extra = 4

class QuestionImageInline(admin.TabularInline):
    model = QuestionImage
    extra = 1

class SolutionImageInline(admin.TabularInline):
    model = SolutionImage
    extra = 1

class AnswerKeyImageInline(admin.TabularInline):
    model = AnswerKeyImage
    extra = 1

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    inlines = [OptionInline, QuestionImageInline]

@admin.register(Solution)
class SolutionAdmin(admin.ModelAdmin):
    inlines = [SolutionImageInline]

@admin.register(AnswerKey)
class AnswerKeyAdmin(admin.ModelAdmin):
    inlines = [AnswerKeyImageInline]

admin.site.register(User)
admin.site.register(Chapter)
admin.site.register(Topic)
admin.site.register(QuestionType)
admin.site.register(Option)
admin.site.register(PracticeAttempt)
admin.site.register(PublicQuestion)
admin.site.register(PublicSolution)

class SingletonModelAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Prevent more than one instance
        return not SiteSettings.objects.exists()

@admin.register(SiteSettings)
class SiteSettingsAdmin(SingletonModelAdmin):
    pass

# Register your models here.
