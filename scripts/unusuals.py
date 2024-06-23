import requests
from bs4 import BeautifulSoup
import json
import sys
import time

class Unusual:
    def __init__(self, name, image, series, type):
        self.name = name
        self.image = image
        self.series = series
        self.type = type

    def to_dict(self):
        return {
            'name': self.name,
            'image': self.image,
            'series': self.series,
            'type': self.type
        }

enable_img_download = '--enable-img-download' in sys.argv

if enable_img_download:
    print("Image download enabled")
else:
    print("Image download disabled")

# Go to the wiki page
BASE_URL = "https://wiki.teamfortress.com/"
URL = "https://wiki.teamfortress.com/wiki/Unusual"
page = requests.get(URL)

# Parse the html
soup = BeautifulSoup(page.content, 'html.parser')

unusuals = {}

tables = soup.find_all('table', class_='wikitable')[:-3]

removed_unusuals = ['Unusual Energy Orb.png']

for table in tables:
    # Extract the series name
    series_header = table.find('th', class_='header').get_text(strip=True)
    
    # Find all rows in the table
    rows = table.find_all('tr')
    
    item_type = None
    i = 1  # Start after the header row
    while i < len(rows):
        has_sidebar = rows[i].find('td').has_attr('rowspan')

        if has_sidebar:
            item_type = rows[i].find('td').get_text(strip=True)

        if i + 1 > len(rows):
            break

        # Process the image row
        image_row = rows[i]
        images = image_row.find_all('img')
        
        # Determine if there is a third row for names
        if i + 2 < len(rows):
            has_variant = rows[i + 2].find('img') == None
        
        for j, img in enumerate(images):
            img_url = BASE_URL + img['src']
            img_alt = img['alt']
            item_name = img_alt.replace('Unusual ', '').replace('.png', '')
            img_name = str(hash(item_name))

            if img_alt in removed_unusuals:
                break
            
            # Save image locally
            if enable_img_download:
                img_data = requests.get(img_url).content
                with open(f"images/unusuals/{img_name}.png", "wb") as file:
                    file.write(img_data)
                    
            
            # print(f"Name: {item_name}, Image: {img_name}, Series: {series_header}, Type: {item_type}")

            unusuals[item_name] = Unusual(item_name, img_name, series_header, item_type)
        
        # Move to the next set of rows
        i += 3 if has_variant else 2

unusual_json = json.dumps([unusual.to_dict() for unusual in unusuals.values()], indent=4)

with open("unusuals.json", "w") as file:
    file.write(unusual_json)