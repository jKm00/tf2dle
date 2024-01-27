"""A script that compresses images in a specified directory."""

import argparse
import os
import glob
from PIL import Image

# Create parser with arguments
parser = argparse.ArgumentParser(description='Compress images in a specified directory.')
parser.add_argument('path', type=str, help='The path to the directory to compress images in')
parser.add_argument('file_extension', type=str, help='Extension of the files to compress')

args = parser.parse_args()

# Get arguments
directory = args.path.split('=')[1]
file_extension = args.file_extension.split('=')[1]

# Check if the directory exists
if not os.path.isdir(directory):
  print(f"Directory '{directory}' does not exist")
  exit()

allowed_file_extensions = ['png', 'jpg', 'jpeg']
if file_extension not in allowed_file_extensions:
  print(f"File extension '{file_extension}' is not supported")
  exit()

# Get all files in the directory
if not directory.endswith('/'):
  directory += '/'

file_paths = glob.glob(f"{directory}*.{file_extension}")

index = 1
for file_path in file_paths:
  print(f"Compressing image {index}/{len(file_paths)}")
  index += 1

  file_name = os.path.basename(file_path)
  new_path = f"{directory}compressed/{file_name}"

  # Compress the image
  image = Image.open(file_path)
  image.save(new_path, file_extension, optimize=True, quality=20)
