import urllib.request
import re
import os
import json

folder_id = '1KO0VYYFJLHE_eM0UGbOAtUtSLFAbP3XF'
url = f'https://drive.google.com/drive/folders/{folder_id}'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    with open('scripts/drive_page.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print('Saved drive_page.html, size:', len(html))
except Exception as e:
    print('Fetch error:', e)
