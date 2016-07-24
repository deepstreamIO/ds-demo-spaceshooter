$(function() {
	var DEEPSTREAM_URL = 'localhost:6020';
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
		moveArea = new Pad( 'move' );
		shootArea = new Pad( 'shoot' );

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