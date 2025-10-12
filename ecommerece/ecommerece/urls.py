from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
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

# Serve media files during development and on Render
if settings.DEBUG or settings.MEDIA_URL:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
