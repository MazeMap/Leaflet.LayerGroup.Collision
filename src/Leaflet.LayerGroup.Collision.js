
L.LayerGroup.Collision = L.LayerGroup.extend({

	_originalLayers: [],
	_visibleLayers: [],
	_staticLayers: [],
	_rbush: [],
	_cachedRelativeBoxes: [],

	addLayer: function(layer) {
		if (! '_icon' in layer) {
			this._staticLayers.push(layer);
			L.LayerGroup.prototype.addLayer.call(this, layer);
			return;
		}

		this._originalLayers.push(layer);
		if (this._map) {
			this._maybeAddLayerToRBush( layer );
		}
	},

	onAdd: function (map) {
		this._map = map;

		this._onZoomEnd();
		map.on('zoomend', this._onZoomEnd, this);
	},


	_maybeAddLayerToRBush: function(layer) {
		var z    = this._map.getZoom();
		var bush = this._rbush;

		var boxes = this._cachedRelativeBoxes[layer._leaflet_id];
		var visible = false;
		if (!boxes) {
			// Add the layer to the map so it's instantiated on the DOM,
			//   in order to fetch its position and size.
			L.LayerGroup.prototype.addLayer.call(this, layer);
			var visible = true;
// 			var htmlElement = layer._icon;
			var box = this._getIconBox(layer._icon);
			boxes = this._getRelativeBoxes(layer._icon.children, box);
			boxes.push(box);
			this._cachedRelativeBoxes[layer._leaflet_id] = boxes;
		}

		boxes = this._positionBoxes(this._map.latLngToLayerPoint(layer.getLatLng()),boxes);

		var collision = false;
		for (var i=0; i<boxes.length && !collision; i++) {
			collision = bush.search(boxes[i]).length > 0;
// 			collision = bush.collides(boxes[i]);
		}

		if (!collision) {
			if (!visible) {
				L.LayerGroup.prototype.addLayer.call(this, layer);
			}
			this._visibleLayers.push(layer);
			bush.load(boxes);
		} else {
			L.LayerGroup.prototype.removeLayer.call(this, layer);
		}
	},


	// Returns a plain array with the relative dimensions of a L.Icon, based
	//   on the computed values from iconSize and iconAnchor.
	_getIconBox: function (el) {

		if (! 'getComputedStyle' in window) {
			// Fallback for MSIE8, will most probably fail on edge cases
			return [ 0, 0, el.offsetWidth, el.offsetHeight];
		}

		var styles = window.getComputedStyle(el);

		// getComputedStyle() should return values already in pixels, so using arseInt()
		//   is not as much as a hack as it seems to be.

		return [
			parseInt(styles.marginLeft),
			parseInt(styles.marginTop),
			parseInt(styles.marginLeft) + parseInt(styles.width),
			parseInt(styles.marginTop)  + parseInt(styles.height)
		];
	},


	// Much like _getIconBox, but works for positioned HTML elements, based on offsetWidth/offsetHeight.
	_getRelativeBoxes: function(els,baseBox) {
		var boxes = [];
		for (var i=0; i<els.length; i++) {
			var el = els[i];
			var box = [
				el.offsetLeft,
				el.offsetTop,
				el.offsetLeft + el.offsetWidth,
				el.offsetTop  + el.offsetHeight
			];
			box = this._offsetBoxes(box, baseBox);
			boxes.push( box );

			if (el.children.length) {
				var parentBox = baseBox;
				if ('getComputedStyle' in window) {
					var positionStyle = window.getComputedStyle(el).position;
					if (positionStyle === 'absolute' || positionStyle === 'relative') {
						parentBox = box;
					}
				}
				boxes = boxes.concat( this._getRelativeBoxes(el.children, parentBox) );
			}
		}
		return boxes;
	},

	_offsetBoxes: function(a,b){
		return [
			a[0] + b[0],
			a[1] + b[1],
			a[2] + b[0],
			a[3] + b[1]
		];
	},

	// Adds the coordinate of the layer (in pixels / map canvas units) to each box coordinate.
	_positionBoxes: function(offset, boxes) {
		var newBoxes = [];	// Must be careful to not overwrite references to the original ones.
		for (var i=0; i<boxes.length; i++) {
			newBoxes.push( this._positionBox( offset, boxes[i] ) );
		}
		return newBoxes;
	},

	_positionBox: function(offset, box) {
		return [
			box[0] + offset.x,
			box[1] + offset.y,
			box[2] + offset.x,
			box[3] + offset.y,
		]
	},

	_onZoomEnd: function() {

		for (var i=0; i<this._visibleLayers.length; i++) {
			L.LayerGroup.prototype.removeLayer.call(this, this._visibleLayers[i]);
		}

		this._rbush = rbush();

		var z = this._map.getZoom();

		for (var i=0; i < this._originalLayers.length; i++) {
			this._maybeAddLayerToRBush(this._originalLayers[i]);
		}

	}
});



L.LayerGroup.collision = function (options) {
	return new L.LayerGroup.Collision(options);
};

