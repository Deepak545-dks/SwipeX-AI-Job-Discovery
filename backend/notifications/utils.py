import logging
from django.core.mail import send_mail
from django.conf import settings
from notifications.models import Notification

logger = logging.getLogger("notifications.utils")

def send_new_application_notification(application):
    """
    Sends an email and creates an in-app notification for a recruiter
    when a job seeker applies to one of their jobs.
    """
    recruiter = application.job.recruiter
    seeker_name = application.applicant.profile.full_name or application.applicant.email
    job_title = application.job.title
    
    # 1. Create In-App Notification
    Notification.objects.create(
        recipient=recruiter,
        title="New Job Application",
        message=f"{seeker_name} has applied for your job posting: {job_title}.",
        notification_type="application"
    )

    # 2. Dispatch Email
    subject = f"SwipeX: New Candidate Application for {job_title}"
    message_body = (
        f"Hello,\n\n"
        f"A new candidate, {seeker_name}, has swiped right and applied for your position: {job_title}.\n\n"
        f"Log in to your Recruiter Hub to review their resume and schedule an interview:\n"
        f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/recruiter\n\n"
        f"Best regards,\n"
        f"The SwipeX Team"
    )
    
    try:
        send_mail(
            subject=subject,
            message=message_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@swipex.com'),
            recipient_list=[recruiter.email],
            fail_silently=False
        )
        logger.info(f"Dispatched New Application email to recruiter: {recruiter.email}")
    except Exception as e:
        logger.error(f"Failed to dispatch New Application email: {e}")

def send_interview_scheduled_notification(interview):
    """
    Sends an email and creates an in-app notification for a candidate
    when a recruiter schedules an interview slot.
    """
    candidate = interview.application.applicant
    recruiter_name = interview.application.job.recruiter.profile.full_name or interview.application.job.recruiter.email
    job_title = interview.application.job.title
    company_name = interview.application.job.company.name
    
    # 1. Create In-App Notification
    Notification.objects.create(
        recipient=candidate,
        title="Interview Scheduled",
        message=f"Recruiter {recruiter_name} has invited you to a video interview for: {job_title} at {company_name}.",
        notification_type="interview"
    )

    # 2. Dispatch Email
    subject = f"SwipeX Invitation: Interview for {job_title} at {company_name}"
    message_body = (
        f"Hello,\n\n"
        f"Great news! Recruiter {recruiter_name} has invited you to an interview for the role: {job_title} at {company_name}.\n\n"
        f"Interview Details:\n"
        f"Title: {interview.title}\n"
        f"Time: {interview.start_time.strftime('%Y-%m-%d %H:%M UTC')}\n"
        f"Description: {interview.description or 'None'}\n\n"
        f"Please accept or decline this interview slot on your calendar dashboard:\n"
        f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/calendar\n\n"
        f"Best regards,\n"
        f"The SwipeX Team"
    )
    
    try:
        send_mail(
            subject=subject,
            message=message_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@swipex.com'),
            recipient_list=[candidate.email],
            fail_silently=False
        )
        logger.info(f"Dispatched Interview Scheduled email to candidate: {candidate.email}")
    except Exception as e:
        logger.error(f"Failed to dispatch Interview Scheduled email: {e}")

def send_interview_response_notification(interview):
    """
    Sends an email and creates an in-app notification for a recruiter
    when a candidate responds (accept/decline) to an interview invitation.
    """
    recruiter = interview.application.job.recruiter
    seeker_name = interview.application.applicant.profile.full_name or interview.application.applicant.email
    job_title = interview.application.job.title
    status_response = interview.status # accepted or declined
    
    # 1. Create In-App Notification
    Notification.objects.create(
        recipient=recruiter,
        title=f"Interview {status_response.capitalize()}",
        message=f"{seeker_name} has {status_response} your interview invite for: {job_title}.",
        notification_type="interview"
    )

    # 2. Dispatch Email
    subject = f"SwipeX Update: Interview {status_response.capitalize()} by Candidate"
    message_body = (
        f"Hello,\n\n"
        f"Candidate {seeker_name} has {status_response} your interview invitation for the position: {job_title}.\n\n"
        f"View your upcoming schedule or call links on your dashboard:\n"
        f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')}/calendar\n\n"
        f"Best regards,\n"
        f"The SwipeX Team"
    )
    
    try:
        send_mail(
            subject=subject,
            message=message_body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@swipex.com'),
            recipient_list=[recruiter.email],
            fail_silently=False
        )
        logger.info(f"Dispatched Interview Response email to recruiter: {recruiter.email}")
    except Exception as e:
        logger.error(f"Failed to dispatch Interview Response email: {e}")
