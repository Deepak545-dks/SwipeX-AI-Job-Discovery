import uuid
import logging
from django.utils.timezone import is_naive, make_aware

logger = logging.getLogger("jobs.calendar_utils")

def sync_event_to_google_calendar(interview) -> str:
    """
    Simulates syncing an interview event to Google Calendar API v3.
    Constructs invitation payloads, generates a mock event ID, and formats iCalendar invite logs.
    In production, this would make an authenticated OAuth2 post call to:
    https://www.googleapis.com/calendar/v3/calendars/primary/events
    """
    event_id = f"mock_gcal_{uuid.uuid4().hex[:16]}"
    
    start_iso = interview.start_time.isoformat()
    end_iso = interview.end_time.isoformat()
    
    # Construct Google Calendar event resource payload
    event_payload = {
        "id": event_id,
        "summary": interview.title,
        "description": interview.description or "SwipeX Video Interview Session",
        "start": {
            "dateTime": start_iso,
            "timeZone": "UTC"
        },
        "end": {
            "dateTime": end_iso,
            "timeZone": "UTC"
        },
        "attendees": [
            {"email": interview.application.applicant.email, "responseStatus": "needsAction"},
            {"email": interview.application.job.recruiter.email, "responseStatus": "accepted"}
        ],
        "conferenceData": {
            "createRequest": {
                "requestId": f"meet_{event_id}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"}
            }
        }
    }
    
    # Generate mock .ics string
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//SwipeX//Career Platform//EN",
        "BEGIN:VEVENT",
        f"UID:{event_id}@swipex.com",
        f"DTSTART:{interview.start_time.strftime('%Y%m%dT%H%M%SZ')}",
        f"DTEND:{interview.end_time.strftime('%Y%m%dT%H%M%SZ')}",
        f"SUMMARY:{interview.title}",
        f"DESCRIPTION:{interview.description or ''}",
        f"ORGANIZER;CN=SwipeX:MAILTO:noreply@swipex.com",
        f"ATTENDEE;RSVP=TRUE:MAILTO:{interview.application.applicant.email}",
        "END:VEVENT",
        "END:VCALENDAR"
    ]
    ics_data = "\n".join(ics_lines)
    
    logger.info(f"Simulating Google Calendar event creation for event_id={event_id}")
    logger.info(f"Event Payload: {event_payload}")
    logger.info(f"Generated ICS file data:\n{ics_data}")
    
    return event_id
