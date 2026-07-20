import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger("swipex.security")

def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler to provide clean, unified error responses 
    and log security exceptions gracefully.
    """
    response = exception_handler(exc, context)

    # Log exception context details
    view_name = context.get('view').__class__.__name__ if context.get('view') else 'UnknownView'
    logger.warning(f"Security Exception in {view_name}: {exc}")

    if response is not None:
        error_msg = ""
        if isinstance(response.data, dict):
            if "detail" in response.data:
                error_msg = str(response.data["detail"])
            elif "error" in response.data:
                error_msg = str(response.data["error"])
            else:
                # Format validation errors cleanly
                errors = []
                for field, msgs in response.data.items():
                    msg_str = ", ".join(msgs) if isinstance(msgs, list) else str(msgs)
                    errors.append(f"{field}: {msg_str}")
                error_msg = "; ".join(errors)
        elif isinstance(response.data, list):
            error_msg = ", ".join([str(m) for m in response.data])
        else:
            error_msg = str(response.data)

        # Standardize error response structure
        response.data = {
            "error": error_msg or "An API validation error occurred.",
            "status_code": response.status_code
        }
    else:
        # Unhandled 500 server exception
        logger.error(f"Unhandled Server Error in {view_name}: {exc}", exc_info=True)
        response = Response(
            {
                "error": "An internal server error occurred. Please contact support.",
                "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
