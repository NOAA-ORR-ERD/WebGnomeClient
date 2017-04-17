#!/usr/bin/env python

"""
Script to run add the reference and header to all the rst files
"""

import sys, os

filenames = [n for n in os.listdir("./orig") if (n[-4:] == ".rst" and "north_slope" not in n)]

#store the references in a separte file
with  open('references.txt','w') as ref_file:
    for name in filenames:
        ref_name = name[:-4]
        ref_file.write(":ref:`%s`" % ref_name + "\n\n")
        header = []
        header.append("\n:orphan:\n\n")
        header.append(".. _{}:\n\n".format(ref_name))
        header.append("%s Example Problems\n" % ref_name.replace("_examples", "").capitalize())
        header.append("=" * (len(header[-1])-1))
        header.append("\n\n")
        print name, ref_name, header
        # read the file
        contents = open(os.path.join("orig", name), 'r').readlines()
        # replace the header
        contents[:2] = header

        #Put it all into one string
        contents = "".join(contents)
        # make headers out of example numbers
        for i in range(1,10):
            before = "\n**%i.** " % i
            contents = contents.replace(before, "\nExample %i.\n----------\n\n" % i)

        contents = contents.replace("\n**\n","\n")
        contents = contents.replace("\n**\n","\n")

        # write it back out
        open(name, 'w').write(contents)
        print contents[:4]



