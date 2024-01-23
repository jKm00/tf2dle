import requests
from bs4 import BeautifulSoup

class Map:
  def __init__(self, name, thumbnail, image, game_mode, release_date):
    self.name = name
    self.thumbnail = thumbnail
    self.image = image
    self.game_modes = [game_mode]
    self.release_date = release_date

  def add_game_mode(self, game_mode):
    self.game_modes.append(game_mode)

  def __str__(self):
    return f"Map: {self.name}\nThumbnail: {self.thumbnail}\nImage: {self.image}\nGame Modes: {self.game_modes}\nRelease Date: {self.release_date}"
  
  def to_dict(self):
    return {
      'name': self.name,
      'thumbnail': self.thumbnail,
      'image': self.image,
      'gameModes': self.game_modes,
      'releaseDate': self.release_date
    }

URL = "https://wiki.teamfortress.com/wiki/List_of_maps"
page = requests.get(URL)

soup = BeautifulSoup(page.content, "html.parser")

# Select all <tr> under <tbody> under <table> with class "wikitable sortable grid jquery-tablesorter"
table = soup.find("table", {"class": "grid"})
tbody = table.find("tbody")
trs = tbody.find_all("tr")

hashmap = {}

def convert_to_full_image_url(thumbnail_url):
  parts = thumbnail_url.split('/')

  full_image_parts = [part for i, part in enumerate(parts) if part != 'thumb' and i != len(parts) - 1]

  full_image_url = '/'.join(full_image_parts)

  return full_image_url

for tr in trs:
  tds = tr.find_all("td")

  if not len(tds) == 7:
    continue

  map_name = tds[1].find("a").text
  map_game_mode = tds[2].text.replace("\n", "")

  if map_name in hashmap.keys():
    # If game is already added, add game mode to game
    hashmap[map_name].add_game_mode(map_game_mode)
  else:
    # Else, create new game
    map_thumbnail = "https://wiki.teamfortress.com" + tds[0].find("img")["src"]
    map_image = convert_to_full_image_url(map_thumbnail)
    map_release_date = tds[4].find("span")

    if map_release_date:
      map_release_date = map_release_date.text
    else:
      map_release_date = "unknown"

    hashmap[map_name] = Map(map_name, map_thumbnail, map_image, map_game_mode, map_release_date)

# Write to a json file
import json

maps_json = json.dumps([map_instance.to_dict() for map_instance in hashmap.values()], indent=4)

with open("maps.json", "w") as file:
  file.write(maps_json)
