
:orphan:

Continuous Release Exercise
============================

    .. rubric::
       :name: section

    +--------------------------------------+-----------------------------------------------+
    | |image_cont|                         | .. rubric:: GNOME Fate Exercises:             |
    |                                      |    Continuous Release                         |
    |                                      |    :name: GNOME-exercises-continuous-release  |
    +--------------------------------------+-----------------------------------------------+

    .. rubric:: Incident
       :name: incident

    On August 24, 2000 at 0800, a jet aircraft carrying 450 gallons of
    JP-5 crashes into a lake. The pilot and co-pilot exit the aircraft
    safely and are not injured. Unfortunately, the aircraft sinks to the
    bottom of the lake. The water temperature is reported to be 69°F.
    On-scene observers report a 100 yard by 10 yard sheen.

    Local officials are concerned about fuel leaking from the aircraft
    and would like to send a skimmer to the site. The owner of the
    aircraft argues that the oil leaking from the aircraft is not
    recoverable and a skimmer would be wasting both time and money.
    *Local officials would like to know when the slick will dissipate
    and not be observable.*

    The trajectory analysis team is given the following weather
    forecast:

    Winds are currently from the north at less than 5 knots and are
    expected to increase to 10 knots from the north later in the
    afternoon. Tomorrow, August 25, the winds are forecast to be from
    the northwest at 15 knots. August 26, the winds are predicted to be
    from west at 5 knots or less.

    The team recommends running the oil weathering software, ADIOS, for
    two different scenarios: 1) credible worst case and 2) a chronic
    release.

    .. rubric:: GNOME Model Input
       :name: GNOME-model-input

    Oil: JP-5

    #. Click Oil
    #. Select JP-5 from the list of oils
    #. Click Select

    Winds: variable 5-10 knots

    #. Click Wind/Wave
    #. Select Variable Wind
    #. Select August 24 at 0800 hours
    #. Enter Speed as 5 and choose knots from the popup menu.
    #. Enter N for North or 0 as the Direction
    #. Click Add
       Repeat this process for the remainder of the weather forecast. 10
       knots from the north on the afternoon of August 24. By the
       morning of August 25, the winds will be from the northwest at 15
       knots. By the morning of August 26, the winds are forecast to be
       from west at 5 knots or less.
    #. Click OK.

    Water: temperature 69°F

    #. Click Water
    #. Enter 69 as the Temperature and choose F from the popup menu
    #. Select 0 (fresh water) from the Salinity popup menu
    #. Select 50 (avg. river/estuary) from the Water Sediment Load popup
       menu
    #. Click OK

    Release: 1000 gallons

    .. rubric:: Discussion
       :name: discussion

    *Local officials would like to know when the slick will dissipate
    and not be observable.*

    A credible worst case scenario might be all of the oil was released
    at once.

    #. Click Release
    #. Select Instantaneous Release
    #. Select the Time of Release as August 24 at 0800 hours
    #. Enter 1000 as Amount Spilled and choose gal from the popup menu
    #. Click OK
    #. Click OK
    #. Click Solve.

    From the Output menu, select the Oil Budget Table. This will show
    that most of the oil has evaporated and dispersed within the first
    10-hours after the release.

    The trajectory analysis team recommend a chronic release scenario.
    GNOME has a minimum release value of 84 gallons per hour. For this
    scenario, you could do a chronic release of 84 gallons per hour for
    11 hours.

    #. Click Release
    #. Un-select the Instantaneous Release
    #. Select Continuous Release
    #. Select the Time of Release as August 24 at 0800 hours
    #. Enter Duration of Release as 11 and select hours from the popup
       menu
    #. Select Amount Spilled
    #. Enter 1000 as the Amount and choose gal from the popup menu
    #. Click OK
    #. Click Solve.

    At this chronic release rate, the slick dissipates about as fast as
    it is leaking out. Please note that GNOME releases the oil in
    hourly intervals. This chronic release is equivalent to spilling 1.4
    gallons per minute, a rather small amount. For either the
    instantaneous or continuous release, the oil will likely dissipate
    in half a day. 

    --------------

    `|image1|\ Top <#ADIOS>`__ `|image2|\ Back <Exercise.html>`__
    `Home <Contents.html>`__

    ::

        Last updated December 20, 2000
        Send comments to adiosmail@hazmat.noaa.gov

     

.. |image_cont| image:: images/contPict.gif
   :width: 71px
   :height: 86px
