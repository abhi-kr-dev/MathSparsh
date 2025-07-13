from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SiteSettings, Question, Solution, Option, AnswerKey, Chapter, Topic, QuestionType
from .serializers import (
    SiteSettingsSerializer, QuestionSerializer, SolutionSerializer, OptionSerializer, AnswerKeySerializer,
    ChapterSerializer, TopicSerializer, QuestionTypeSerializer, PracticeAttemptSerializer,
    PublicQuestionSerializer, PublicSolutionSerializer
)
from .stripe_utils import create_checkout_session
from .models import PublicQuestion, PublicSolution
from rest_framework import status
from rest_framework.views import APIView
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    return Response({
        'username': user.username,
        'role': user.role,
        'email': user.email,
    })

from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

@api_view(['POST'])
def register(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    data = request.data
    required = ['username', 'password', 'email']
    if not all(k in data and data[k] for k in required):
        return Response({'error': 'All fields required'}, status=400)
    if User.objects.filter(username=data['username']).exists():
        return Response({'error': 'Username already exists'}, status=400)
    user = User.objects.create_user(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        role='free'
    )
    user.is_active = False
    user.save()
    # Send verification email
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/verify-email/{uid}/{token}/"
    send_mail(
        subject="Verify your MathSparsh account",
        message=f"Hi {user.username},\n\nPlease verify your email by clicking the link: {verify_url}",
        from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@mathsparsh.com'),
        recipient_list=[user.email],
        fail_silently=True,
    )
    return Response({'username': user.username, 'email': user.email, 'role': user.role, 'detail': 'Verification email sent. Please check your inbox.'})

@api_view(['GET'])
def verify_email(request, uidb64, token):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and default_token_generator.check_token(user, token):
        user.is_active = True
        user.email_verified = True
        user.save()
        return Response({'detail': 'Email verified successfully.'})
    return Response({'error': 'Invalid or expired verification link.'}, status=400)

@api_view(['POST'])
def resend_verification_email(request):
    from django.contrib.auth import get_user_model
    User = get_user_model()
    email = request.data.get('email')
    if not email:
        return Response({'error': 'Email required'}, status=400)
    try:
        user = User.objects.get(email=email)
        if user.email_verified:
            return Response({'detail': 'Email already verified.'})
        # Send verification email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verify_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')}/verify-email/{uid}/{token}/"
        send_mail(
            subject="Verify your MathSparsh account",
            message=f"Hi {user.username},\n\nPlease verify your email by clicking the link: {verify_url}",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@mathsparsh.com'),
            recipient_list=[user.email],
            fail_silently=True,
        )
        return Response({'detail': 'Verification email resent. Please check your inbox.'})
    except User.DoesNotExist:
        return Response({'error': 'No account found for this email.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    from .models import PracticeAttempt
    user = request.user
    attempts = PracticeAttempt.objects.filter(user=user)
    total_attempts = attempts.count()
    correct_attempts = attempts.filter(is_correct=True).count()
    accuracy = (correct_attempts / total_attempts * 100) if total_attempts else 0
    last_attempt = attempts.order_by('-timestamp').first()
    last_activity = last_attempt.timestamp if last_attempt else None
    # Calculate streak (consecutive days)
    from datetime import timedelta
    streak = 0
    if last_attempt:
        days = attempts.order_by('-timestamp').values_list('timestamp', flat=True)
        prev_day = None
        for ts in days:
            day = ts.date()
            if prev_day is None:
                streak = 1
                prev_day = day
            elif (prev_day - day).days == 1:
                streak += 1
                prev_day = day
            elif prev_day == day:
                continue
            else:
                break
    return Response({
        'total_attempts': total_attempts,
        'correct_attempts': correct_attempts,
        'accuracy': round(accuracy, 1),
        'streak': streak,
        'last_activity': last_activity
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_analytics(request):
    if not request.user.is_superuser and getattr(request.user, 'role', None) != 'admin':
        return Response({'error': 'Forbidden'}, status=403)
    from django.contrib.auth import get_user_model
    User = get_user_model()
    from .models import Question, PracticeAttempt
    from django.utils import timezone
    from datetime import timedelta

    total_users = User.objects.count()
    total_questions = Question.objects.count()
    total_attempts = PracticeAttempt.objects.count()
    recent_attempts = PracticeAttempt.objects.select_related('user', 'question').order_by('-timestamp')[:10]

    # Signups per day (last 14 days)
    import csv
    from django.http import HttpResponse
    # Date range filter
    start = request.GET.get('start')
    end = request.GET.get('end')
    if start:
        start_date = timezone.datetime.strptime(start, '%Y-%m-%d').date()
    else:
        start_date = today - timedelta(days=13)
    if end:
        end_date = timezone.datetime.strptime(end, '%Y-%m-%d').date()
    else:
        end_date = today
    signups_per_day = []
    attempts_per_day = []
    premium_per_day = []
    days_range = (end_date - start_date).days
    for i in range(days_range, -1, -1):
        day = end_date - timedelta(days=i)
        signups = User.objects.filter(date_joined__date=day).count()
        attempts = PracticeAttempt.objects.filter(timestamp__date=day).count()
        premium = User.objects.filter(role='premium', date_joined__date=day).count()
        signups_per_day.append({'date': str(day), 'count': signups})
        attempts_per_day.append({'date': str(day), 'count': attempts})
        premium_per_day.append({'date': str(day), 'count': premium})

    # CSV export
    if request.GET.get('export') == 'csv':
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="analytics.csv"'
        writer = csv.writer(response)
        writer.writerow(['Date', 'Signups', 'Attempts', 'Premium Upgrades'])
        for i in range(len(signups_per_day)):
            writer.writerow([
                signups_per_day[i]['date'],
                signups_per_day[i]['count'],
                attempts_per_day[i]['count'],
                premium_per_day[i]['count']
            ])
        return response

    # Top 5 users by attempts
    from django.db.models import Count, Q
    top_attempt_users = User.objects.annotate(num_attempts=Count('practice_attempts')).order_by('-num_attempts')[:5]
    top_correct_users = User.objects.annotate(num_correct=Count('practice_attempts', filter=Q(practice_attempts__is_correct=True))).order_by('-num_correct')[:5]

    return Response({
        'total_users': total_users,
        'total_questions': total_questions,
        'total_attempts': total_attempts,
        'recent_attempts': [
            {
                'user': a.user.username,
                'question': a.question.id,
                'is_correct': a.is_correct,
                'attempted_at': a.timestamp,
            }
            for a in recent_attempts
        ],
        'signups_per_day': signups_per_day,
        'attempts_per_day': attempts_per_day,
        'premium_per_day': premium_per_day,
        'top_users_by_attempts': [
            {'username': u.username, 'attempts': u.num_attempts} for u in top_attempt_users
        ],
        'top_users_by_correct': [
            {'username': u.username, 'correct': u.num_correct} for u in top_correct_users
        ],
    })

from rest_framework.decorators import authentication_classes
from django.views.decorators.csrf import csrf_exempt
import stripe
from django.conf import settings

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_stripe_checkout(request):
    session = create_checkout_session(request.user)
    return Response({'checkout_url': session.url})

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_SECRET_KEY
        )
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    # Handle successful payment
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        user_id = session['metadata'].get('user_id')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
            user.role = 'premium'
            user.save()
        except User.DoesNotExist:
            pass
    return Response({'status': 'success'})

class PracticeAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = PracticeAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.practice_attempts.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SiteSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SiteSettings.objects.all()
    serializer_class = SiteSettingsSerializer
    permission_classes = [permissions.AllowAny]

class QuestionViewSet(viewsets.ModelViewSet):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Question.objects.all()
        chapter = self.request.query_params.get('chapter')
        topic = self.request.query_params.get('topic')
        qtype = self.request.query_params.get('type')
        level = self.request.query_params.get('level')
        if chapter:
            qs = qs.filter(topic__chapter__id=chapter)
        if topic:
            qs = qs.filter(topic__id=topic)
        if qtype:
            qs = qs.filter(qtype__id=qtype)
        if level:
            qs = qs.filter(level=level)
        return qs


class SolutionViewSet(viewsets.ModelViewSet):
    queryset = Solution.objects.all()
    serializer_class = SolutionSerializer
    permission_classes = [permissions.AllowAny]

class OptionViewSet(viewsets.ModelViewSet):
    queryset = Option.objects.all()
    serializer_class = OptionSerializer
    permission_classes = [permissions.AllowAny]

class AnswerKeyViewSet(viewsets.ModelViewSet):
    queryset = AnswerKey.objects.all()
    serializer_class = AnswerKeySerializer
    permission_classes = [permissions.AllowAny]

class ChapterViewSet(viewsets.ModelViewSet):
    queryset = Chapter.objects.all()
    serializer_class = ChapterSerializer
    permission_classes = [permissions.AllowAny]

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [permissions.AllowAny]

class QuestionTypeViewSet(viewsets.ModelViewSet):
    queryset = QuestionType.objects.all()
    serializer_class = QuestionTypeSerializer
    permission_classes = [permissions.AllowAny]

# --- Public Q&A API ---
from rest_framework.throttling import SimpleRateThrottle

class SessionRateThrottle(SimpleRateThrottle):
    scope = 'public_question'
    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            return None  # No throttle for logged-in
        session_id = request.data.get('session_id') or request.COOKIES.get('sessionid')
        if not session_id:
            return None
        return self.cache_format % {
            'scope': self.scope,
            'ident': session_id
        }

class PublicQuestionViewSet(viewsets.ModelViewSet):
    queryset = PublicQuestion.objects.all().order_by('-created_at')
    serializer_class = PublicQuestionSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [SessionRateThrottle]

    def get_throttles(self):
        # Allow 3 questions/day/session for anonymous, unlimited for premium
        if self.action == 'create' and not self.request.user.is_authenticated:
            self.throttle_scope = 'public_question'
        return super().get_throttles()

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        session_id = self.request.data.get('session_id', '')
        serializer.save(user=user, session_id=session_id)

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

from rest_framework.permissions import IsAdminUser

class PublicSolutionCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAdminUser]
    def post(self, request, question_id):
        try:
            question = PublicQuestion.objects.get(id=question_id)
        except PublicQuestion.DoesNotExist:
            return Response({'error': 'Question not found'}, status=404)
        if hasattr(question, 'solution'):
            return Response({'error': 'Already answered'}, status=400)
        serializer = PublicSolutionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question, answered_by=request.user)
            question.status = 'answered'
            question.save()
            # --- Notify premium user ---
            if question.user and getattr(question.user, 'role', None) == 'premium' and question.user.email:
                from django.core.mail import send_mail
                send_mail(
                    subject='Your MathSparsh question has been answered!',
                    message=f'Hi {question.user.username},\n\nYour question has been answered. View it here: https://mathsparsh.com/qna/{question.id}',
                    from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@mathsparsh.com'),
                    recipient_list=[question.user.email],
                    fail_silently=True,
                )
                # --- SMS notification placeholder ---
                # from twilio.rest import Client
                # client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                # client.messages.create(
                #     to=question.user.profile.phone_number,
                #     from_=settings.TWILIO_PHONE_NUMBER,
                #     body=f'Your MathSparsh question has been answered! Visit: https://mathsparsh.com/qna/{question.id}'
                # )
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
