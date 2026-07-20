from django.core import signing
from django.core.signing import SignatureExpired, BadSignature

def generate_verification_token(email):
    return signing.dumps(email, salt='email-verification')

def verify_email_token(token, max_age=86400):  # 24 hours
    try:
        email = signing.loads(token, salt='email-verification', max_age=max_age)
        return email
    except (SignatureExpired, BadSignature):
        return None

def generate_password_reset_token(email):
    return signing.dumps(email, salt='password-reset')

def verify_password_reset_token(token, max_age=3600):  # 1 hour
    try:
        email = signing.loads(token, salt='password-reset', max_age=max_age)
        return email
    except (SignatureExpired, BadSignature):
        return None
