/**
 * @class Pad
 *
 * This class represents one of the directional pads
 *
 * (we're not using ES6 syntax here as Safari on iPhone doesn't support it
 * yet - and Babel is a bit overkill for a single file)
 *
 * @param {String} type either 'move' or 'shoot'
 */
function Pad ( type ) {
	this._type = type;

	// The record for this player. Both pads write to the same record
	// will be set by setRecord()
	this._record = null;

	// The radius of the pad in pixels, will be set by setSize()
	this._radius = null;

	// The center of the pad
	this._cX = null;
	this._cY = null;

	// The key that rotation will be stored as on the record in radians
	// either bodyRotation or turretRotation
	this._rotationType = ( type === 'move' ? 'body' : 'turret' ) + 'Rotation';

	// The key that status will be stored as (e.g. moving: true if the pad is touched)
	this._activeType = type === 'move' ? 'moving' : 'shooting';

	// DOM elements
	this._pad = $( '.pad.' + type );
	this._area = this._pad.find( '.area' );
	this._angleIndicator = this._pad.find( '.angle-indicator' );

	// Events. Touch events are bound separately as their event signature
	// is different
	this._area.on( 'touchstart mousedown', this._onStart.bind( this ) );
	this._area.on( 'mousedown mousemove', this._onMouse.bind( this ) );
	this._area.on( 'touchstart touchmove', this._onTouch.bind( this ) );
	this._area.on( 'mouseup touchend', this._onEnd.bind( this ) );
}

/**
 * Sets the record this pads movement will be stored under
 *
 * @param {deepstream.Record} record
 *
 * @public
 * @returns {void}
 */
Pad.prototype.setRecord = function( record ) {
	this._record = record;
}

/**
 * Updates the pad's dimensions
 *
 * @public
 * @returns {void}
 */
Pad.prototype.setSize = function() {
	var width = this._pad.width();
	var height = this._pad.height();
	var circumference = Math.min( width, height ) - 40;

	this._area.css({
		width: circumference,
		height: circumference,
		marginTop: ( height - circumference ) / 2
	});

	this._radius = circumference / 2;
	this._cX = this._area.offset().left + this._radius;
	this._cY = this._area.offset().top + this._radius;
}

/**
 * Callback for mousedown and touchstart events.
 *
 * @private
 * @returns {void}
 */
Pad.prototype._onStart = function ( event ) {
	event.preventDefault();
	this._record.set( this._activeType, true );
}

/**
 * Callback for mousemove events over the pad.
 *
 * @private
 * @returns {void}
 */
Pad.prototype._onMouse = function ( event ) {
	this._setAngle( this._radius, this._radius, event.offsetX, event.offsetY );
}

/**
 * Callback for touchmove events. Retrieves the single applicable
 * touch and passes it to setAngle()
 *
 * @private
 * @returns {void}
 */
Pad.prototype._onTouch = function ( event ) {
	event.preventDefault();
	var touch = event.targetTouches[ 0 ];

	if( touch ) {
		this._setAngle( this._cX, this._cY, touch.clientX, touch.clientY );
	}
}

/**
 * Sets the rotation angle of the ship and places the radar-ish
 * indicator on the pad. The actual rotation of the later is achieved
 * using CSS transforms with a transform origin at the bottom center as the
 * pivot point.
 *
 * @private
 * @returns {void}
 */
Pad.prototype._setAngle = function ( cX, cY, pX, pY ) {
	var angle =  Math.PI / 2 + Math.atan2( pY - cY, pX - cX );
	this._angleIndicator.css( 'transform', 'rotate(' + angle + 'rad)' );
	this._record.set( this._rotationType, angle );
}

/**
 * Callback for mouseup and touchend events.
 *
 * @private
 * @returns {void}
 */
Pad.prototype._onEnd = function() {
	this._record.set( this._activeType, false );
}