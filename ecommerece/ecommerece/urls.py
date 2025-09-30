from django.contrib import admin
from django.urls import path , include
from user import views

urlpatterns = [
    path('', views.index, name='user-index'),
    path('admin/', admin.site.urls),
    path('api/user/', include('user.urls')),
]
