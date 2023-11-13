#######################
Uncertainty in WebGNOME
#######################

When making a trajectory, GNOME includes a parameterization for the turbulence that is inherent
in natural processes, such as winds and currents, but not for errors in wind
forecasts or current patterns. To account for these errors you can include the uncertainty solution
by checking “Include uncertainty in particle transport" in the Model Settings panel.

The uncertainty trajectory represents other possibilities of where the spill might go based on uncertainty in the inputs. It is visualized in Map View using red dots. It shows areas of the map that could be impacted if, for example,
the wind blows from a somewhat different direction than you have specified,
or if the currents in the area flow somewhat faster or slower than expected.

Wind, currents, and diffusion all have uncertainty parameters with default values.
You can set the coefficients that control the size and distribution of the uncertainty
in Advanced Settings. The uncertainty only applies to the transport.
Uncertainty for weathering is under development.