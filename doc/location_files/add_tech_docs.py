#!/usr/bin/env python

"""
Script to copy the rst files for the location tech docs from the webapi repo

This duplicates the files, but we can maintain them in one place.

Kinda klunky, but should work.

This script is designed to be run from this dir, and with the
webgnomeapi repo sitting next to this one. But that can be changed
right at the top of this script

"""

import os

# hard-coded to be relative to here
WEBGNOMEAPI_REPO = "../../../gnome2_api"

tech_files_location = os.path.join(WEBGNOMEAPI_REPO, "help/views/model/locations/")

locations = os.listdir(tech_files_location)
try:
    locations.remove(".DS_Store")
except ValueError:
    pass

# loop through them one by one:
for loc in locations:
    print "processing:", loc
    loc_dir = os.path.join(tech_files_location, loc)
    docs = os.listdir(loc_dir)
    print "found:", docs
    # merge them all into one doc
    filename = loc.lower().replace(" ", "_") + "_tech.rst"
    print "creating:", filename
    with open(filename, 'w') as outfile:
        contents = [":orphan:"]
        for doc in docs:
            contents.append("\n\n")  # make sure there's a newline between them!
            contents.extend(open(os.path.join(loc_dir, doc)).readlines())
            contents.append("\n")  # make sure there's a newline at the end
        # look  for the header to add the reference name
        for i, line in enumerate(contents):
            if line.strip() and all((c == line[0] for c in line.strip())):
                break
        # insert the name line:
        contents.insert(i - 1, ".. _%s:\n\n" % filename[:-4])

        outfile.writelines(contents)





