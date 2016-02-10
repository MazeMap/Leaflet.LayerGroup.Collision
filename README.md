Leaflet.LayerGroup.Collision
================================

Provides basic collision detection in order to declutter large or overlapping sets of Leaflet markers.

Don't like READMEs? Then see http://mazemap.github.io/Leaflet.LayerGroup.Collision/demo/demo.html


What?
--------

Inspired by the ClusterMarker plugin, this plugin works by hiding any markers that overlap each other - only the marker which was first added to the LayerGroup will be shown.



How?
--------

Collision detection is done by using the dimensions of the DOM elements inside the `L.Marker`'s icon; this has been tested only using `display:block` elements. `L.Layer`s which are not markers will be always shown.

This plugin uses Vladimir Agafonkin's `rbush` library for the grunt work of detecting bounding box collisions.

Caveats: this plugin expects markers to not change dinamically, to not be draggable, and marker deletion is not supported (yet). Currently everything is recalculated on zoom change. Only partial data caching is done - marker bounding boxes are cached; collisions per zoom level are recalculated.


Usage
-------------

Works as a normal Leaflet LayerGroup, just add your markers to it.

When instantiating, can take the 'margin' option. This defines the margin between markers, in pixels, and defaults to zero.

```
var collisionLayer = L.layerGroup.collision({margin:5});
collisionLayer.addTo(map);

collisionLayer.add( L.marker( markeroptions ) );
```

This plugin also extends `L.FeatureGroup` into `L.FeatureGroup.collision` and `L.GeoJSON` into `L.GeoJSON.collision`.


Demo
------

There is a live demo at http://mazemap.github.io/Leaflet.LayerGroup.Collision/demo/demo.html

The demo loads about 1000 placenames, each of them being a `L.DivIcon` with two boxes.

The demo includes data from Natural Earth, which is public domain. Please visit  http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/ for more information.

In order to try the demo locally, just clone the repo, run `bower install` (if using the `gh-pages` branch, use `git clone --recursive` instead to pull the `rbush` submodule), and see the file `demo/demo.html`. You can choose to load more or less data by commenting/uncommenting the lines that include the natural earth data files.
