import requests
from bs4 import BeautifulSoup
import json
import sys
import time

class Cosmetic:
  def __init__(self, name, image, used_by):
    self.name = name
    self.image = image
    self.used_by = used_by

  def to_dict(self):
    return {
      'name': self.name,
      'image': self.image,
      'usedBy': self.used_by
    }
  
enable_img_download = '--enable-img-download' in sys.argv

if enable_img_download:
  print("Image download enabled")
else:
  print("Image download disabled")

# Go to the wiki page
BASE_URL = "https://wiki.teamfortress.com"
URL = "https://wiki.teamfortress.com/wiki/Cosmetic_items"
page = requests.get(URL)

# Parse the html
soup = BeautifulSoup(page.content, 'html.parser')

class_pages = []

# Get all the class pages
li = soup.find('h2', string='List of cosmetic items').find_next('ul').find_all('li')

# Get the links to the class pages
for item in li:
  class_pages.append(item.find('a')['href'])

cosmetics = {}
for page in class_pages[:-1]:
  time.sleep(2)

  print(f"Fetching {BASE_URL + page}...")

  cosmetic_page = requests.get(BASE_URL + page)
  cosmetic_soup = BeautifulSoup(cosmetic_page.content, 'html.parser')

  rows = cosmetic_soup.find_all('tr', attrs={"style": "vertical-align:top;"})

  for row in rows:
    links = row.find_all('a')

    for link in links:
      name = link.get('title')

      hashed_cosmetic_name = str(hash(name))

      subdomain = page.split('/')[-1].split('_')

      if len(subdomain) == 5:
        used_by = f'{subdomain[2]} {subdomain[3]}'
      else:
        used_by = f'{subdomain[2]}'
      
      image = link.find('img')
      if image:
        image_url = BASE_URL + image['src']

        if enable_img_download:
          img_data = requests.get(image_url).content
          with open(f"images/cosmetics/{hashed_cosmetic_name}.png", "wb") as file:
            file.write(img_data)

      # print(f"Name: {name}, Image: {hashed_cosmetic_name}, Used by: {used_by}")
      
      cosmetics[name] = Cosmetic(name, hashed_cosmetic_name, used_by)

cosmetic_json = json.dumps([cosmetic.to_dict() for cosmetic in cosmetics.values()], indent=4)

with open("cosmetics.json", "w") as file:
  file.write(cosmetic_json)