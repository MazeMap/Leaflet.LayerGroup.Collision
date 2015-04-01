Leaflet.LayerGroup.Collision
================================

Provides basic collision detection in order to declutter large or overlapping sets of Leaflet markers.


What?
--------

Inspired by the ClusterMarker plugin, this plugin works by hiding any markers that overlap each other - only the marker which was first added to the LayerGroup will be shown.



How?
--------

Collision detection is done by using the dimensions of the DOM elements inside the `L.Marker`'s icon; this has been tested only using `display:block` elements. `L.Layer`s which are not markers will be always shown.

This plugin uses Vladimir Agafonkin's `rbush` library for the grunt work of detecting bounding box collisions.

Caveats: this plugin expects markers to not change dinamically, to not be draggable, and marker deletion is not supported (yet). Currently everything is recalculated on zoom change and no caching is performed


Usage
-------------

Works as a normal Leaflet LayerGroup, just add your markers to it.

When instantiating, can take the 'margin' option. This defines the margin between markers, in pixels, and defaults to zero.

```
var collisionLayer = L.LayerGroup.collision({margin:5});
collisionLayer.addTo(map);

collisionLayer.add( L.marker( markeroptions ) );
```


Demo
------

In order to try out the demo, clone the repo, run `bower install`, and point your browser to the `demo.html` file. A live example is not available due to the lack of a CDN for `rbush.js`.

The demo loads about 1000 placenames, each of them being a `L.DivIcon` with two boxes. If you want to try loading more/less data, just comment/uncomment a different GeoJSON file in `demo.html`.

The demo includes data from Natural Earth, which is public domain. Please visit  http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-populated-places/ for more information.

