
:orphan:

Uncertainty Exercise
====================

+--------------------------------------+----------------------------------------+
| |image0|                             | .. rubric:: Fate Exercises:            |
|                                      |    Uncertainty  |image1|               |
|                                      |                                        |
+--------------------------------------+----------------------------------------+


Background
----------


In a real spill, the size of the release is often ambiguous. It is
not uncommon for the spiller to report a 10 barrel release and the
on-scene observers to estimate a 1000 barrel release. `Wind
speed <wind.html>`__ directly effects several oil weathering
processes, but the National Weather Service rarely forecasts exact
values for `wind speed <wind.html>`__. Instead, the wind is given as
a range of values.

These two factors are examples of the
`uncertainty <Uncertainty.html>`__ inherent in forecasting oil slick
fate and behavior. WebGNOME allows you to incorporate this uncertainty
in your model predictions.


Incident
--------

On June 2, at 1800 hours, a barge carrying diesel (Fuel Oil No.2)
hits a rock and releases and unknown amount of oil. The strike team
on-scene thinks it was 1000 bbl, but it could be half that or twice
that. They won't know for certain until they sound the tanks. The
spill is twenty miles offshore and the NOAA/HAZMAT trajectory model
predicts that the oil will first impact the beach after about two
days.

Winds are forecast to be from the Northwest at 10-20 knots. Sediment
load is negligible. Seas are fully developed. Water temperature is
65 F.

Model Input
-----------

    Oil: diesel (Fuel Oil N0.2)

    #. Click Oil to open the ADIOS Oil Database
    #. Select diesel from the list of oils
    #. Click Download
       `For more information on Oil <oil.html>`__

    Winds: from the Northwest at 10-20 knots

    #. Click Wind/Wave
    #. Select Constant Wind (This is the default)
    #. Enter Wind speed as 15 and choose knots from the popup menu.
    #. Enter NW for northwest or 315 as the Direction
    #. Click Uncertainty
    #. Enter Wind Speed Uncertainty as 5 choose knots from the popup
       menu.
    #. Click OK
    #. Click OK
       `For more information on Winds <wind.html>`__

    Water: temperature 65°F

    #. Click Water
    #. Enter 65 as the Temperature and choose F from the popup menu
    #. Click OK
       `For more information on Water <waterTemp.html>`__

    Release: 1000 barrels

    #. Click Release
    #. Select Instantaneous Release
    #. Select the Time of Release as June 2, at 1800 hours
    #. Enter 1000 as Amount Spilled and choose bbl from the popup menu
    #. Click OK
    #. Click Uncertainty
    #. Enter Amount of Oil Uncertainty as 50. This is a percentage of
       the total spilled.
    #. Click OK
       `For more information on Release <release.html>`__

Discussion of Model Output
--------------------------

What are the implications for shoreline impact ?

What would the oil look like ?

Suppose the Coast Guard wants you to give them information for the
`ICS 209 <ics_209.htm>`__ form pertaining to the 8 hour operational
period beginning 0700 on June 3. Do you think that the answers are
really this accurate ?

Try letting some of the oil hit the beach after 2 days and recheck
the `ICS form <ics_209.htm>`__. Where would the beach impact
estimates likely come from ?

Do you think they would be accurate?


--------------

.. `|image2|\ Top <#ADIOS>`__ `|image3|\ Back <Exercise.html>`__
.. `Home <Contents.html>`__

.. ::
..  

.. .. |image0| image:: imagesUncer/UnPict.gif
..    :width: 75px
..    :height: 60px
.. .. |image1| image:: Images/inProg.gif
..    :width: 30px
..    :height: 30px
.. .. |image2| image:: Images/UpArrow.gif
..    :width: 32px
..    :height: 32px
.. .. |image3| image:: Images/LeftArrow.gif
..    :width: 32px
..    :height: 32px
