# Scraper

This folder contains python file that scrapes for different thing. Belove is a list of all the files and what the scrape:

## List of scrapers

- [maps.py](#maps)
- [weapons.py](#weapons)
- [cosmetics.py](#cosmetics)

<h3 id="maps">Maps</h3>

Scrapes the web for all official tf2 maps. This is what it collects for each map:

```
- name          # Name of the map
- thumbnail     # A link to the thumbnail
- image         # A link to full size image
- game modes    # A list of all available game mode for the map
- release date  # The release date of the map
```

<h3 id="weapons">Weapons</h3>

TODO

<h3 id="cosmetics">Cosmetics</h3>

## Setting up python environment

1. Cd into folder

```
cd scripts
```

3. Create environment

```
python -m venv .
```

4. Activate environment:

```
./Scripts/activate
```

5. Install requirements

```
pip install -r requirements.txt
```

## Running python files

1. Make sure you have activated your python environment

```
./Scripts/activate
```

2. Run a python file

```
python <filename>
```
