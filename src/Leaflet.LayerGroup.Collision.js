
L.LayerGroup.Collision = L.LayerGroup.extend({

	initialize: function(layers) {
		this._originalLayers = [];
		this._visibleLayers  = [];
		this._staticLayers   = [];
		this._rbush = null;
		L.LayerGroup.prototype.initialize.call(this, layers);
	},


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

		this._switchBush();
		map.on('zoomend', this._switchBush, this);
	},


	_maybeAddLayerToRBush: function(layer) {
		var z    = this._map.getZoom();
		var bush = this._rbush;

		// Add the layer to the map so it's instantiated on the DOM,
		//   in order to fetch its position and size.
		L.LayerGroup.prototype.addLayer.call(this, layer);
		var htmlElement = layer._icon;

		var boxes = this._getHtmlElementBoxes(layer._icon);
		var collision = false;
		for (var i=0; i<boxes.length && !collision; i++) {
			collision = bush.search(boxes[i]).length > 0;
		}

		if (!collision) {
// 			this._map.addLayer(layer);	// Already added before the calculations
			this._visibleLayers.push(layer);
			bush.load(boxes);
		} else {
			L.LayerGroup.prototype.removeLayer.call(this, layer);
		}
	},


	// Similar to L.DomUtil.GetPosition(), but works on any HTML element, even
	//   nested children.
	/// FIXME: Detect whether the element has absolute/relative positioning instead
	///   of inherited???
	_getHtmlElementBox(el) {
		var pos = L.DomUtil.getPosition(el);
		if (!pos) {
			var parentBox = this._getHtmlElementBox(el.offsetParent);
			pos = {
				x: parentBox[0] + el.offsetLeft,
				y: parentBox[1] + el.offsetTop
			}
		}
		var w   = el.offsetWidth;
		var h   = el.offsetHeight;
		return [pos.x, pos.y, pos.x + w, pos.y + h];
	},

	_getHtmlElementBoxes(el) {
		var boxes = [];
		for (var i=0; i<el.children.length; i++) {
			var childBoxes = this._getHtmlElementBoxes(el.children[i])
			var boxes = boxes.concat( childBoxes );
		}
		boxes.push( this._getHtmlElementBox(el) );
		return boxes;
	},



	/// FIXME!!! Check if data in the bush for that zoom level is calculated, then
	///   switch data from the old bush to the new bush.
	/// In other words: cache things!!
	_switchBush: function() {

		for (var i=0; i<this._visibleLayers.length; i++) {
			L.LayerGroup.prototype.removeLayer.call(this, this._visibleLayers[i]);
		}

		this._rbush = rbush();

		for (var i=0; i < this._originalLayers.length; i++) {
			this._maybeAddLayerToRBush(this._originalLayers[i]);
		}
	}
});



L.LayerGroup.collision = function (options) {
	return new L.LayerGroup.Collision(options);
};

