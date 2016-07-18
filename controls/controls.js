class Area{
	constructor( type ) {
		this._type = type;
		this._record = null;
		this._radius = null;
		this._cX = null;
		this._cY = null;
		this._rotationType = ( type === 'move' ? 'body' : 'turret' ) + 'Rotation';
		this._activeType = type === 'move' ? 'moving' : 'shooting';
		this._pad = $( '.pad.' + type );
		this._area = this._pad.find( '.area' );
		this._angleIndicator = this._pad.find( '.angle-indicator' );
		this._area.on( 'touchstart mousedown', this._onStart.bind( this ) );
		this._area.on( 'mousedown mousemove', this._onMouse.bind( this ) );
		this._area.on( 'touchstart touchmove', this._onTouch.bind( this ) );
		this._area.on( 'mouseup touchend', this._onEnd.bind( this ) );
	}

	setRecord( record ) {
		this._record = record;
	}

	setSize() {
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

	_onStart() {
		this._record.set( this._activeType, true );
	}

	_onMouse( event ) {
		this._setAngle( this._radius, this._radius, event.offsetX, event.offsetY );
	}

	_onTouch( event ) {
		var touch = event.targetTouches[ 0 ];

		if( touch ) {
			this._setAngle( this._cX, this._cY, touch.clientX, touch.clientY );
		}
	}

	_setAngle( cX, cY, pX, pY ) {
		var angle =  Math.PI / 2 + Math.atan2( pY - cY, pX - cX );
		this._angleIndicator.css( 'transform', `rotate(${angle}rad)` );
		this._record.set( this._rotationType, angle );
	}

	_onEnd() {
		this._record.set( this._activeType, false );
	}
}
$(() => {

	var name;
	var recordName;
	var moveArea;
	var shootArea;
	var connectionIndicator;
	var ds;
	var isFullScreen = false;

	function joinGame() {
		name = $( 'input#name' ).val();
		recordName = 'player/' + name;

		ds.record.getRecord( recordName ).whenReady( record => {
			record.set({
				name: name,
				moving: false,
				shooting: false,
				bodyRotation: 0,
				turretRotation: 0
			});

			record.once( 'delete', () => {
				$( '.overlay' ).addClass( 'game-over' ).fadeIn( 300 );
				$( '#game-over button' ).one( 'touch click', joinGame );
				ds.event.unsubscribe( 'status/' + name );
				record.discard();
			});

			ds.event.subscribe( 'status/' + name );
			moveArea.setRecord( record );
			shootArea.setRecord( record );
			$( '.overlay' ).removeClass( 'game-over' ).fadeOut( 500 );
		});
	}

	function startApp( ds ) {
		moveArea = new Area( 'move' );
		shootArea = new Area( 'shoot' );
		connectionIndicator = $( '.connection-indicator' );

		// Bind resize
		function setSize() {
			moveArea.setSize();
			shootArea.setSize();
			connectionIndicator.height( connectionIndicator.width() + 5 );
		}

		$( window ).resize( setSize );
		setSize();

		$('#enter-name').submit( event => {
			event.preventDefault();
			joinGame();
		});
	}




// Bind fullscreen toggle

	$( '.fullscreen-toggle' ).on('click touch', ()=>{
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

	ds = deepstream( '192.168.0.12:6020' ).login({}, () => { startApp( ds ); });
	ds.on( 'connectionStateChanged', connectionState => {
		var cssClass;

		if( connectionState === 'ERROR' || connectionState === 'CLOSED' ) {
			cssClass = 'red';
		}
		else if ( connectionState === 'OPEN' ) {
			cssClass = 'green';
		} else {
			cssClass = 'yellow';
		}

		$( '.connection-indicator' ).removeClass( 'red yellow green' ).addClass( cssClass );
	});
});