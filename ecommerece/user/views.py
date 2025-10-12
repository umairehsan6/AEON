from django.http import HttpResponse
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
import logging

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializer import SignUpSerializer , LoginSerializer
from django.contrib.auth import get_user_model

logger = logging.getLogger('user')

User = get_user_model()

class SignUpAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Signup request received: {request.data}")
            serializer = SignUpSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                logger.info(f"User created successfully: {user.username}")
                return Response(
                    {"message": "User created successfully", "user": serializer.data},
                    status=status.HTTP_201_CREATED
                )
            else:
                logger.warning(f"Signup validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error during signup"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            logger.info(f"Login request received: {request.data}")
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.validated_data['user']
                logger.info(f"User login successful: {user.username}")

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
            else:
                logger.warning(f"Login validation failed: {serializer.errors}")
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Internal server error during login"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
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


