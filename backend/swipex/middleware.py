class SecurityHeadersMiddleware:
    """
    Middleware to inject essential security headers into HTTP responses
    protecting against XSS, clickjacking, MIME sniffing, and referrer leaks.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        # Security Headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Content Security Policy (Basic default)
        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy'] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: http: https:;"

        return response
