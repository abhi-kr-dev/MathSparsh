from django.contrib import admin
from django.urls import path
from django.shortcuts import render, redirect
from django.contrib import messages
from .forms import BulkUploadForm

class BulkUploadAdmin(admin.ModelAdmin):
    change_list_template = "admin/importer/bulk_upload.html"
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('bulk-upload/', self.admin_site.admin_view(self.bulk_upload_view), name='bulk-upload'),
        ]
        return custom_urls + urls

    def bulk_upload_view(self, request):
        if request.method == 'POST':
            form = BulkUploadForm(request.POST, request.FILES)
            if form.is_valid():
                from .utils import process_bulk_upload
                results = process_bulk_upload(
                    form.cleaned_data['data_file'],
                    form.cleaned_data.get('images_zip'),
                    user=request.user
                )
                msg = f"Imported: {results['questions']} questions, {results['options']} options, {results['solutions']} solutions, {results['answer_keys']} answer keys, {results['images']} images."
                if results['errors']:
                    msg += f" Errors: {'; '.join(results['errors'])}"
                messages.success(request, msg)
                return redirect('..')
        else:
            form = BulkUploadForm()
        return render(request, 'admin/importer/bulk_upload.html', {'form': form})

