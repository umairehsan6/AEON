from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import SignUpSerializer , LoginSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class SignUpAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = SignUpSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {"message": "User created successfully", "user": serializer.data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']

            # create JWT tokens and add custom claims
            refresh = RefreshToken.for_user(user)
            refresh['username'] = user.username
            refresh['first_name'] = user.first_name
            refresh['last_name'] = user.last_name
            refresh['role'] = user.role

            access = refresh.access_token
            access['username'] = user.username
            access['first_name'] = user.first_name
            access['last_name'] = user.last_name
            access['role'] = user.role
            return Response(
                {
                    "message": "Login successful",
                    "access": str(access),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()  # <-- marks it as invalid
                return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": "Logout failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
def index(request):
    return HttpResponse("Hello, this is the user index page.")


