import argparse
import re
from urllib.parse import urlsplit

from bs4 import BeautifulSoup

from common import add_scraper_args, check_discovery, download_image, ensure_dir, format_date, hash_id, index_unique, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, record_sort_key, request_wiki, save_progress_json, should_skip_date, validate_limit, wiki_url, write_merged_json


URL = wiki_url("/wiki/War_Paint")
GRADES = {
  "civilian": "Civilian",
  "freelance": "Freelance",
  "mercenary": "Mercenary",
  "commando": "Commando",
  "assassin": "Assassin",
  "elite": "Elite",
}


def update_release_dates(soup):
  history = soup.find("div", class_="update-history-container")
  if history is None:
    raise ValueError("Missing War Paint update history")

  dates = {}
  for heading in history.find_all("b"):
    links = heading.find_all("a", href=True)
    patch = next((link for link in links if re.search(r"_Patch(?:#.*)?$", link["href"])), None)
    released = parse_wiki_date(patch.get_text(" ", strip=True)) if patch else None
    if released is None:
      continue
    for link in links:
      if link is patch:
        continue
      update = wiki_url(link["href"])
      dates[update] = min(dates.get(update, released), released)
  if not dates:
    raise ValueError("No War Paint update release dates discovered")
  return dates


def full_image_url(src):
  url = wiki_url(src)
  # MediaWiki thumbnails add /thumb/ and a size-prefixed final path segment.
  path = urlsplit(url).path
  if path.startswith("/w/images/thumb/"):
    path = path.replace("/w/images/thumb/", "/w/images/", 1).rsplit("/", 1)[0]
  if not path.startswith("/w/images/") or not path.endswith("_War_Paint_Factory_New.png"):
    raise ValueError(f"Expected a Factory New War Paint PNG: {src}")
  return wiki_url(path)


def discover_warpaints(soup):
  section = soup.find(id="War_Paint_Collections")
  heading = section.find_parent("h2") if section else None
  if heading is None:
    raise ValueError("Missing War Paint collections section")
  dates = update_release_dates(soup)
  index = {}
  collection = None
  collection_link = None
  released = None
  collection_count = 0
  entry_count = 0
  for element in heading.find_next_siblings():
    if element.name in ("h2", "h3"):
      if collection is not None and entry_count == 0:
        raise ValueError(f"Empty War Paint collection: {collection}")
      if element.name == "h2":
        break
      headline = element.find(class_="mw-headline")
      update = headline.find("a", href=True) if headline else None
      if headline is None or not headline.get("id") or update is None:
        raise ValueError("Malformed War Paint collection heading")
      collection = headline.get_text(" ", strip=True)
      if not collection.endswith("Collection"):
        raise ValueError(f"Unexpected War Paint collection: {collection}")
      collection_link = wiki_url(f"{URL}#{headline['id']}")
      released = dates.get(wiki_url(update["href"]))
      collection_count += 1
      entry_count = 0
    elif element.name == "ul" and "gallery" in element.get("class", []):
      if collection is None:
        raise ValueError("War Paint gallery is missing its collection")
      for item in element.select("li.gallerybox"):
        caption = item.select_one(".warpaint.item-grade")
        image = item.find("img")
        if caption is None or image is None:
          raise ValueError(f"Malformed War Paint gallery entry in {collection}")
        grades = [GRADES[value] for value in caption.get("class", []) if value in GRADES]
        if len(grades) != 1:
          raise ValueError(f"Missing or ambiguous War Paint grade in {collection}")
        name = caption.get_text(" ", strip=True)
        record = {
          "name": name,
          "link": collection_link,
          "image": hash_id(name),
          "collection": collection,
          "grade": grades[0],
          "wear": "Factory New",
          "releaseDate": format_date(released),
        }
        index_unique(index, name, (record, full_image_url(image.get("src"))))
        entry_count += 1
  if collection is not None and entry_count == 0:
    raise ValueError(f"Empty War Paint collection: {collection}")
  log(f"Found {len(index)} War Paints in {collection_count} collections")
  return index


parser = argparse.ArgumentParser(description="Scrape TF2 War Paint collections and Factory New images")
add_scraper_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log_scraper_start("warpaints scraper", args)

scraper_output_dir = output_dir("warpaints", dry_run=args.dry_run)
image_dir = scraper_output_dir / "images"
if args.img_download and not args.dry_run:
  ensure_dir(image_dir)
  log(f"Writing War Paint images to {image_dir.resolve()}")

existing_records, existing_names = load_existing_records("warpaints")
log(f"Fetching War Paint collections page: {URL}")
soup = BeautifulSoup(request_wiki(URL).content, "html.parser")
warpaint_index = discover_warpaints(soup)
check_discovery(warpaint_index, existing_names, "War Paints")
skipped_existing = len(set(warpaint_index) & existing_names)
log(f"Pending War Paints to inspect: {len(warpaint_index) - skipped_existing}")

records = []
skipped_older = 0
skipped_unknown = 0
for record, image_url in sorted(warpaint_index.values(), key=lambda entry: record_sort_key(entry[0])):
  if record["name"] in existing_names:
    continue
  released = parse_wiki_date(record["releaseDate"])
  if should_skip_date(released, args.start_date):
    if released:
      skipped_older += 1
    else:
      skipped_unknown += 1
    continue
  log(f"Including War Paint {len(records) + 1}: {record['name']} ({record['collection']})")
  if args.img_download and not args.dry_run:
    download_image(image_url, image_dir / f"{record['image']}.png")
  records.append(record)
  save_progress_json("warpaints", existing_records, records, dry_run=args.dry_run)
  if reached_limit(records, args.limit):
    log(f"Reached limit of {args.limit} War Paints")
    break

write_merged_json("warpaints", existing_records, records, dry_run=args.dry_run)
log(f"Skipped {skipped_existing} records already present in output")
if args.start_date:
  log(f"Filter: releaseDate >= {args.start_date}")
  log(f"Skipped {skipped_older} older records and {skipped_unknown} records with unknown release dates")
log("Finished warpaints scraper")
