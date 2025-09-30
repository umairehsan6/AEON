from django.urls import path
from user import views 

urlpatterns = [
    path('', views.index, name='user-index'),
    path('signup/', views.SignUpAPIView.as_view(), name='user-signup'),
    path('login/', views.LoginAPIView.as_view(), name='user-login'),
]