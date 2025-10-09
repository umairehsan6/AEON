from django.contrib import admin
from django.apps import apps

app_models = apps.get_app_config('orders').get_models()

for model in app_models:
	# build a ModelAdmin that shows all fields
	field_names = [f.name for f in model._meta.get_fields() if getattr(f, 'concrete', False) and not f.many_to_many]

	admin_class = type(
		f"{model.__name__}Admin",
		(admin.ModelAdmin,),
		{
			'list_display': field_names or ('id',),
			'search_fields': [fn for fn in field_names if fn.endswith('name') or fn.endswith('code')][:3],
			'list_filter': [fn for fn in field_names if fn.endswith('status') or fn.endswith('type')][:5],
		}
	)

	try:
		admin.site.register(model, admin_class)
	except admin.sites.AlreadyRegistered:
		pass
