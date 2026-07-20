from rest_framework import permissions

class IsRecruiterOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['recruiter', 'admin']

class IsJobOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow admin overrides
        if request.user.role == 'admin':
            return True
        return obj.recruiter == request.user
