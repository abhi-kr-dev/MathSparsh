import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(user):
    session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=[{
            'price': settings.STRIPE_PRICE_ID,
            'quantity': 1,
        }],
        mode='payment',
        customer_email=user.email,
        success_url=f"{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{settings.FRONTEND_URL}/dashboard",
        metadata={
            'user_id': user.id,
        }
    )
    return session
