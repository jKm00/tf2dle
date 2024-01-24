# Scraper

This folder contains python file that scrapes for different thing. Belove is a list of all the files and what the scrape:

## List of scrapers

- [Maps.py](#maps)

<h3 id="maps">Maps</h3>

Scrapes the web for all official tf2 maps. This is what it collects for each map:

```
- name          # Name of the map
- thumbnail     # A link to the thumbnail
- image         # A link to full size image
- game modes    # A list of all available game mode for the map
- release date  # The release date of the map
```

## Instructions

1. Cd into folder
2. Activate environment:

```
./Scripts/activate
```

3. If it's your first time activating the environment, you also need to install packages to it before you can continue:

```
pip install -r requirements.txt
```

4. Run a python file

```
python <filename>
```
