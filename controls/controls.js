var DEEPSTREAM_URL = '192.168.3.4:6020';

/**
 * @class Area
 *
 * This class represents one of the directional pads
 *
 * (we're not using ES6 syntax here as Safari on iPhone doesn't support it
 * yet - and Babel is a bit overkill for a single file)
 *
 * @param {String} type either 'move' or 'shoot'
 */
function Area ( type ) {
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
Area.prototype.setRecord = function( record ) {
	this._record = record;
}

/**
 * Updates the pad's dimensions
 *
 * @public
 * @returns {void}
 */
Area.prototype.setSize = function() {
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
Area.prototype._onStart = function () {
	this._record.set( this._activeType, true );
}

/**
 * Callback for mousemove events over the pad.
 *
 * @private
 * @returns {void}
 */
Area.prototype._onMouse = function ( event ) {
	this._setAngle( this._radius, this._radius, event.offsetX, event.offsetY );
}

/**
 * Callback for touchmove events. Retrieves the single applicable
 * touch and passes it to setAngle()
 *
 * @private
 * @returns {void}
 */
Area.prototype._onTouch = function ( event ) {
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
Area.prototype._setAngle = function ( cX, cY, pX, pY ) {
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
Area.prototype._onEnd = function() {
	this._record.set( this._activeType, false );
}

$(function() {

	var name;
	var recordName;
	var moveArea;
	var shootArea;
	var connectionIndicator;
	var ds;
	var isFullScreen = false;

	// Join the game, either initially or after
	// the player's ship was destroyed and they hit
	// play again
	function joinGame() {
		name = $( 'input#name' ).val();
		recordName = 'player/' + name;

		// Retrieve the record for the player's control data. When the record
		// was deleted previously it will be created again here
		ds.record.getRecord( recordName ).whenReady(function( record ) {

			// Set the record's initial data-set
			record.set({
				name: name,
				moving: false,
				shooting: false,
				bodyRotation: 0,
				turretRotation: 0
			});

			// Listen for the record's delete event. We use the deletion
			// of the record as a means to inform the client that his or her ship
			// was destroyed
			record.once( 'delete',  function() {

				// Show the gameover screen
				$( '.overlay' ).addClass( 'game-over' ).fadeIn( 300 );

				// Bind play again button
				$( '#game-over button' ).one( 'touch click', joinGame );

				// Unsubscribe from the satus event (the same happens if the 
				// client goes offline)
				ds.event.unsubscribe( 'status/' + name );
			});

			// Subscribe to the status event. The game is listening for subscriptions
			// on this event and will use it as a trigger to create the spaceship
			ds.event.subscribe( 'status/' + name );

			// Pass the record to both direction pads
			moveArea.setRecord( record );
			shootArea.setRecord( record );

			// That's it, we're in!
			$( '.overlay' ).removeClass( 'game-over' ).fadeOut( 500 );
		});
	}

	// Called once the client loads
	function startApp() {
		// Create both directional pads
		moveArea = new Area( 'move' );
		shootArea = new Area( 'shoot' );

		// Store the connection status indicator element
		connectionIndicator = $( '.connection-indicator' );

		// Bind resize
		function setSize() {
			moveArea.setSize();
			shootArea.setSize();
			connectionIndicator.height( connectionIndicator.width() + 5 );
		}

		// Set the initial size and bind to resize events
		$( window ).resize( setSize );
		setSize();

		// Once the user has entered their name, join the game
		$('#enter-name').submit( function( event ) {
			event.preventDefault();
			joinGame();
		});
	}

	// Bind the fullscreen toggle button. The fullscreen API is still
	// relatively new and non-standardized, so it takes a bit more work to use it
	$( '.fullscreen-toggle' ).on( 'click touch', function(){
		var el,fn;

		if( isFullScreen ) {
			el = document;
			fn = el.exitFullscreen || el.mozCancelFullScreen || el.webkitExitFullscreen;
		} else {
			el = document.documentElement;
			fn = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
		}
		isFullScreen = !isFullScreen;
		fn.call(el);
	});

	// Create the connection to the deepstream server and login straight away
	// Replace the IP with the one for your own server
	ds = deepstream( DEEPSTREAM_URL ).login({},  startApp );

	// Listen for connection state changes. Deepstream has 11 different connection states,
	// but we've only got three colors - so we need to normalize things a bit
	ds.on( 'connectionStateChanged', function( connectionState ){
		var cssClass;

		if( connectionState === 'ERROR' || connectionState === 'CLOSED' ) {
			cssClass = 'red';
		}
		else if ( connectionState === 'OPEN' ) {
			cssClass = 'green';
		}
		else {
			cssClass = 'yellow';
		}

		$( '.connection-indicator' ).removeClass( 'red yellow green' ).addClass( cssClass );
	});
});