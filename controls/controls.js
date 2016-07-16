class Area{
	constructor( type ) {
		this._type = type;
		this._radius = null;
		this._cX = null;
		this._cY = null;
		this._pad = $( '.pad.' + type );
		this._area = this._pad.find( '.area' );
		this._angleIndicator = this._pad.find( '.angle-indicator' );
		this._area.on( 'mousedown mousemove', this._onMouse.bind( this ) );
		this._area.on( 'touchstart touchmove', this._onTouch.bind( this ) );
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
	}
}



$(function(){
	var moveArea = new Area( 'move' );
	var shootArea = new Area( 'shoot' );
	var connectionIndicator = $( '.connection-indicator' );
	var isFullScreen = false;
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
	function setSize() {
		moveArea.setSize();
		shootArea.setSize();
		connectionIndicator.height( connectionIndicator.width() + 5 );
	}
	$( window ).resize( setSize );
	setSize();
});