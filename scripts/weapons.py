import requests
from bs4 import BeautifulSoup
import json
import time
import sys

class Weapon:
  """Class representing a TF2 weapon"""
  def __init__(self, name, link, image, kill_icon, release_date, used_by, slot, ammo_loaded, ammo_carried, reload_type, qualities):
    self.name = name
    self.link = link
    self.image = image
    self.kill_icon = kill_icon
    self.release_date = release_date
    self.used_by = used_by
    self.slot = slot
    self.ammo_loaded = ammo_loaded
    self.ammo_carried = ammo_carried
    self.reload_type = reload_type
    self.qualities = qualities
    self.attributes = []
  
  def add_class_user(self, class_name):
    self.used_by.append(class_name) 

  def add_slot(self, slot):
    self.slot.append(slot)

  def add_quality(self, quality):
    self.qualities.append(quality)

  def add_attribute(self, attribute):
    self.attributes.append(attribute)

  def to_dict(self):
    """Converts the object to a dictionary"""
    return {
      'name': self.name,
      'link': self.link,
      'image': self.image,
      'killIcon': self.kill_icon,
      'releaseDate': self.release_date,
      'usedBy': self.used_by,
      'slot': self.slot,
      'ammoLoaded': self.ammo_loaded,
      'ammoCarried': self.ammo_carried,
      'reloadType': self.reload_type,
      'qualities': self.qualities,
      'attributes': [attribute.to_dict() for attribute in self.attributes]
    }

class Attribute:
  def __init__(self, text, variant):
    self.text = text
    self.variant = variant

  def to_dict(self):
    return {
      'text': self.text,
      'variant': self.variant
    }

attribute_class_map = {
  'att_level': 'level',
  'att_positive': 'positive',
  'att_negative': 'negative',
  'att_neutral': 'neutral'
}

# If the script should download images (weapon icons and kill icons)
enable_img_download = '--enable-img-download' in sys.argv
test_run = '--test-run' in sys.argv

if enable_img_download:
  print("Image download enabled")
else:
  print("Image download disabled")

# Go to the wiki page
BASE_URL = "https://wiki.teamfortress.com"
URL = "https://wiki.teamfortress.com/wiki/Weapons"
page = requests.get(URL)

# Parse the html
soup = BeautifulSoup(page.content, "html.parser")

# Select all tables
tables = soup.find_all("table", { "class": "wikitable" })

# Initialize empty hashmap
weapons = {}

# Loop through each table
for table in tables:
  # Find all table rows
  rows = table.find_all("tr")

  # Loop through each row, exlude the first two rows because they are headers
  for row in rows[2:]:
    row_header = row.find("th")

    if row_header is None:
      continue
    
    # Find weapon name
    name = row_header.find_all("a")[1].text

    # Skip if weapon is already in hashmap
    if name in weapons.keys():
      continue

    # Find weapon link
    link = row_header.find("a")
    if link:
      href = link.get("href")

    # Find weapon image link
    image_link = row_header.find("img").get("src")

    # Download image into /images/weapons
    if enable_img_download:
      img_data = requests.get(BASE_URL + image_link).content
      with open(f'./images/weapons/{name}.png', 'wb') as handler:
        handler.write(img_data)

    weapons[name] = Weapon(name, href, image_link, None, None, [], [], None, None, None, [])

# Loop through each weapon and scrape additional info
index = 1
for weapon in weapons.values():
  # Prevent getting blocked by the server
  time.sleep(2)

  print(f"#### Scraping {weapon.name} #### {index}/{len(weapons)}")
  index += 1

  # Load weapon page
  weapon_page = requests.get(BASE_URL + weapon.link)
  weapon_soup = BeautifulSoup(weapon_page.content, "html.parser")

  # Find kill icon url
  kill_icon_div = weapon_soup.find("div", { "class": "tf-killnotice-icon" })
  if kill_icon_div:
    kill_icon_url = kill_icon_div.find("img").get("src")
    weapon.kill_icon = kill_icon_url

  # Download kill icon
  if enable_img_download and kill_icon_url:
    img_data = requests.get(BASE_URL + kill_icon_url).content
    with open(f'./images/kill-icons/{name}.png', 'wb') as handler:
      handler.write(img_data)

  # Find release date
  release_date_label = weapon_soup.find("td", string="Released:")
  if release_date_label:
    weapon.release_date = release_date_label.find_next_sibling("td").text
  else:
    weapon.release_date = "unknown"

  # Find used by
  used_by_label = weapon_soup.find("td", string="Used by:")
  if used_by_label:
    weapon.used_by = used_by_label.find_next_sibling("td").text.split(", ")
    
  # Find slot
  slot_label = weapon_soup.find("td", string="Slot:")
  if slot_label:
    slot_value = slot_label.find_next_sibling("td").find_all("a")
    for slot in slot_value:
      weapon.add_slot(slot.text)
    
  # Find ammo loaded
  ammo_loaded_label = weapon_soup.find("td", string="Ammo loaded:")
  if ammo_loaded_label:
    weapon.ammo_loaded = ammo_loaded_label.find_next_sibling("td").text
    
  # Find ammo carried
  ammo_carried_label = weapon_soup.find("td", string="Ammo carried:")
  if ammo_carried_label:
    weapon.ammo_carried = ammo_carried_label.find_next_sibling("td").text
    
  # Find reload type
  reload_type_label = weapon_soup.find("td", string="Reload type:")
  if reload_type_label:
    weapon.reload_type = reload_type_label.find_next_sibling("td").text
    
  # Find qualities
  qualitiy_divs = weapon_soup.find_all("div", { "class": "quality-tag" })
  for div in qualitiy_divs:
    weapon.add_quality(div.find("a").find("span").text)

  # Find attributes
  attribute_container = weapon_soup.find("td", class_="loadout-tooltip-container")
  attributes = attribute_container.find_all("span", class_=lambda x: x and x.startswith("att_"))
  
  for attribute in attributes:
    attribute_class = attribute.get("class")[0]

    for br in attribute.find_all("br"):
      br.replace_with("\n")

    attribute_text = attribute.text

    if attribute_class in attribute_class_map.keys():
      weapon.add_attribute(Attribute(attribute_text, attribute_class_map[attribute_class]))

  if test_run and index == 5:
    break

# Convert hashmap to json
weapons_json = json.dumps([weapon.to_dict() for weapon in weapons.values()], indent=4)

# Write json to file
with open("weapons.json", "w") as file:
  file.write(weapons_json)

