const PIXI = require( 'pixi' );
const SpaceShip = require( './objects/spaceship' );
const BulletManager = require( './bullet-manager' );
const EventEmitter = require( 'events' ).EventEmitter;

module.exports = class Game extends EventEmitter{
	constructor( element ) {
		super();
		this._element = element;
		this._spaceShips = [];
		this.stage = new PIXI.Stage();
		this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, null, true );
		this._element.appendChild( this.renderer.view );
		this._lastFrameTime = 0;
		this.bulletManager = new BulletManager( this, 200 );
		global.ds.event.listen( 'status/.*', this._playerOnlineStatusChanged.bind( this ) );
		requestAnimationFrame( this._tick.bind( this ) );
		window.xxx = this;
	}

	_playerOnlineStatusChanged( match, isSubscribed ) {
		var name = match.replace( 'status/', '' );

		if( isSubscribed ) {
			this._addPlayer( name );
		} else {
			this._removePlayer( name );
		}
	}

	_addPlayer( name ) {
		var x = this.renderer.width * ( 0.1 + Math.random() * 0.8 );
		var y = this.renderer.height * ( 0.1 + Math.random() * 0.8 );
		this._spaceShips.push( new SpaceShip( this, x, y, name ) );
	}

	_removePlayer( name ) {
		for( var i = 0; i < this._spaceShips.length; i++ ) {
			if( this._spaceShips[ i ].name === name ) {
				this._spaceShips[ i ].destroy();
				this._spaceShips.splice( i, 1 );
			}
		}
	}

	_tick( currentTime ) {
		this.emit( 'update', currentTime - this._lastFrameTime, currentTime );
		this._lastFrameTime = currentTime;
		this.renderer.render( this.stage );
		requestAnimationFrame( this._tick.bind( this ) );
	}
}