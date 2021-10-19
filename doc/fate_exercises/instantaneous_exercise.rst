
:orphan:

Instantaneous Release Exercise
==============================

|image_inst|

    .. rubric:: Background
       :name: background

    Tankers of up to 125,000 dry weight are permitted to enter Puget
    Sound and some of these tankers are covered by the Maritime
    Commission. Complete destruction of one of these vessels would
    release about 500,000 barrels of crude oil. This amount of oil, and
    the Rosario Strait location, represent the worst case scenario in
    Section 9.2.4 of the Northwest Area Contingency Plan.

Incident
--------

A fully laden tanker of North Slope crude oil runs aground on Bird
Rocks in Rosario Straits during an early winter storm. The master
reports the vessel listing and breaking up in heavy weather. All
crew members are rescued by helicopter.

Assumptions
-----------

#. The incident occurs in early winter, winds are from the South at
   25 mph and the water temperature is 45°F.
#. The discharged oil is North Slope crude, which is commonly
   brought into Puget Sound.
#. All of the oil carried by the tanker is spilled.
#. Tidal currents in the strait are 1-2 knots during the flood tide
   and 3-3.5 knots during the ebb tide. Currents of greater than 1
   knot will impede booming in the immediate area.

Using WebGNOME weathering only mode, answer the following questions:

#. How much oil will evaporate in the first 24 hours of the spill?
#. After 5 days, how much oil remain floating on the surface?
 

WebGNOME Model Input
--------------------

From this scenario we are given information on the oil, winds, water
temperature, and tides. Input this information into WebGNOME.

Oil: North Slope crude oil

#. Click Oil to load an oil from the ADIOS Oil Database
#. Click the ADIOS Oil Database link to open the database
#. Select North Slope from the list of oils
#. Click Download
#. Drop the oil file onto the form
#. Click Save

Winds: from the South at 25 mph

#. Click Wind.
#. Select Constant Wind (This is the default).
#. Enter the wind speed as 25 and choose mph from the popup menu.
#. Enter S for South or 180 as the Direction.
#. Click Save.

Water: temperature 45°F

#. Click Water.
#. Enter the Water Temperature 45 and choose F from the popup menu.
#. Select 15 psu (ave. estuary) for salinity.
#. Select 5 mg/l (ocean) for sediment load.
#. Click Save

Release: 500,000 barrels

#. Click Spill
#. Select Point/Line Instantaneous Release
#. Select the Time of Release as December 15 at 1100 hours
#. Enter 500,000 as Amount Spilled and choose bbl from the popup
   menu
#. Click Save
#. Click Solve.

     

Discussion
----------


One thing to keep in mind is that it is very unlikely that 500,000
barrels can be released instantaneously (over a 1 hour period). It
will take some time for the oil to leak from the tanker. To get
handle on this, you might consider running the leaking tank model to
develop your intuition. However, the leaking tank option will not
release 500,000 barrels as you would not store that amount in one
tank.

Notice that we did not enter the tidal current information provided
in the scenario. WebGNOME does let you enter a constant current but it
will only affect the spreading for the continuous release option.

For an instantaneous release of 500,000 barrels, you can find how
much evaporated in the first 24 hours of the release by looking at
the Oil Budget Table under the Output menu. The table shows that
approximately 15 to 20% of the oil evaporates and less than 10%
disperse into the water column with approximately 3/4 of the slick
remains on the surface. After 5 days, 20 to 25% evaporates and less
than 10% disperses in the water column with 60 to 70% remaining on
the surface.

.. |image_inst| image:: images/instPict.gif
   :width: 71px
   :height: 86px


