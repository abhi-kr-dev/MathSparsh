from django import forms

class BulkUploadForm(forms.Form):
    data_file = forms.FileField(label='Upload CSV, Excel, or Word file')
    images_zip = forms.FileField(label='Upload Images ZIP file', required=False)
