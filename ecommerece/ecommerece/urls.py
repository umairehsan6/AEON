from django.contrib import admin
from django.urls import path, include
from user import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', views.index, name='user-index'),
    path('admin/', admin.site.urls),
    # add this so POST /api/token/refresh/ exists
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/user/', include('user.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/orders/', include('orders.urls')),
]
