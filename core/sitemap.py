from django.http import HttpResponse
from django.urls import reverse
from django.utils import timezone
from .models import PublicQuestion

def sitemap_xml(request):
    base_url = 'https://mathsparsh.com'
    urls = [
        f'<url><loc>{base_url}/</loc><priority>1.0</priority></url>',
        f'<url><loc>{base_url}/ask</loc><priority>0.8</priority></url>',
        f'<url><loc>{base_url}/qna</loc><priority>0.8</priority></url>',
    ]
    for q in PublicQuestion.objects.filter(status='answered'):
        urls.append(f'<url><loc>{base_url}/qna/{q.id}</loc><priority>0.7</priority><lastmod>{q.created_at.date().isoformat()}</lastmod></url>')
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + ''.join(urls) + '</urlset>'
    return HttpResponse(xml, content_type='application/xml')
