from rest_framework import routers
from . import views
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'settings', views.SiteSettingsViewSet, basename='sitesettings')
router.register(r'questions', views.QuestionViewSet, basename='question')
router.register(r'solutions', views.SolutionViewSet, basename='solution')
router.register(r'options', views.OptionViewSet, basename='option')
router.register(r'answerkeys', views.AnswerKeyViewSet, basename='answerkey')
router.register(r'chapters', views.ChapterViewSet, basename='chapter')
router.register(r'topics', views.TopicViewSet, basename='topic')
router.register(r'questiontypes', views.QuestionTypeViewSet, basename='questiontype')
router.register(r'practiceattempts', views.PracticeAttemptViewSet, basename='practiceattempt')
# --- Public Q&A ---
router.register(r'public-questions', views.PublicQuestionViewSet, basename='public-question')

from .views import user_profile, register, admin_analytics, verify_email, create_stripe_checkout, stripe_webhook, resend_verification_email

urlpatterns = [
    path('', include(router.urls)),
    path('user/', user_profile, name='user-profile'),
    path('register/', register, name='register'),
    path('admin/analytics/', admin_analytics, name='admin-analytics'),
    path('user/stats/', views.user_stats, name='user-stats'),
    path('verify-email/<uidb64>/<token>/', verify_email, name='verify-email'),
    path('resend-verification/', resend_verification_email, name='resend-verification'),
    path('create-stripe-checkout/', create_stripe_checkout, name='create-stripe-checkout'),
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
    # --- Public Q&A ---
    path('public-questions/<int:question_id>/answer/', views.PublicSolutionCreateView.as_view(), name='public-question-answer'),
]
