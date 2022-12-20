###########################
Simulating Response Actions
###########################

WebGNOME allows you to apply various response actions to the oil spill. These include mechanical recovery of the oil using skimmers, chemical dispersant application, or  in-situ burning. 

These oil removal algorithms act globablly on the total oil volume affecting the overall oil budget.

Skimming
^^^^^^^^^^^^^^^^^^^^^^^^^^
Skimming devices are a way to mechanically recover floating oil often used with collection booms towed by recovery vessels. These booms help to direct the floating oil into the skimmer. The towing speed of the system must be slow enough such that oil will not be entrained underneath the booms. Typically, this reduces the towing speed to around a knot or less. Skimming efficency is dependent upon oil thickness and sea state.

Oil which is collected by skimmers must be stored, separated from any accompanying water, and either recycled or disposed of. All these factors must be considered when estimating the efficiency of mechanical recovery. For large spills, it is unlikely that skimmers will be able to recover more than a small percentage of the floating oil.

WebGNOME uses the data entered by the user to compute an hour loss rate from the spill due to mechanical cleanup. No particular portion of the slick is assumed to be cleaned up. WebGNOME removes the oil in equal amounts from all parts of the spill. Any cleanup which occurs after the end of the spill scenario or before the initial oil release is ignored. If the user enters a mechanical cleanup value which exceed the remaining amount of floating oil, it is reduced to the amount of floating oil at the specified hour. 

Dispersing
^^^^^^^^^^^^^^^^^^^^^^^^^^ 
Dispersant chemicals are a way to treat big spills that have spread over a large area. Dispersants reduce the surface tension between oil and water and therefore contribute to the dispersion of the surface oil as small droplets in the water column. Dispersion occurs naturally but is greatly enhanced by the addition of dispersing chemicals. The argument in favor of dispersion is that spreading the oil into the water column will increase natural weathering processes such as biodegradation and oxidation, and reduce the oil concentration levels that organisms are exposed to from a surface slick. 

During a spill, dispersants are often applied more than once. Each dispersant pass over the slick will likely have different start and duration times. Also, the area of the spill sprayed and the area actually dispersed will vary for each dispersant operation. 

WebGNOME treats dispersant application as a global removal mechanism, removing oil uniformly from the whole slick. If the combination of dispersants,weathering, and other cleanup procedures removes more than 100% of the floating oil, all the processes are scaled back proportionately so that only 100% is removed. Later versions of the model will estimate subsurface dispersed oil concentration.

In-Situ Burning
^^^^^^^^^^^^^^^^^^^^^^^^^
In-situ burning is a cleanup technique which removes oil by burning it while it is still floating on the water. Generally, the minimum thickness for fresh oil to burn is two to three millimeters. For emulsified oil, the minimum thickness is probably closer to five millimeters. Oil which is allowed to spread without restriction will usually quickly become too thin to sustain a burn. It therefore becomes necessary to collect the oil by using specially designed fire-proof booms towed through the slick. 

The burn scenarios entered in WebGNOME must begin after oil has been spilled. Any burn which goes beyond the time limit of the model run ( usually five days) will be truncated. You must enter two pieces of information: the area of boomed oil and the thickness of the boomed oil. Since the oil will not be uniformly thick, use the average thickness.

WebGNOME will let the you run a burn scenario even under conditions where a real burn would be difficult or impossible. It is difficult to ignite emulsified oil that is more than 25 percent water unless an emulsion breaker is used first. Towed booms will usually not hold oil if the current normal to the boom is greater than 1 knot. Waves greater than 1-2 meters or winds stronger than 40 knots also can make burning impractical.

WebGNOME has a default burn regression rate of 0.04 mm/sec. This is the rate at which the thickness of the boomed oil shrinks as it is burned and turned into smoke particles. This is a conservative number and many oils may actually burn somewhat faster. Since WebGNOME computes burn volumes on an hourly basis, and since most burns do not last much longer than an hour, you will probably not notice much difference if you put in a different regression rate other than with the smoke plume calculations, which are sensitive to this number. For mass balance purposes, WebGNOME considers all the boomed oil to be consumed in the burn. Actually, a few percent of the oil will remain as residue. This residue will have quite different characteristics than the unburned oil. WebGNOME does not model the properties of the residue
