const PIXI = require( 'pixi.js' );
const SpaceShip = require( './spaceship' );
const BulletManager = require( './bullet-manager' );
const EventEmitter = require( 'events' ).EventEmitter;

module.exports = class Game extends EventEmitter{
	constructor( element ) {
		super();
		this._element = element;
		this.spaceShips = [];
		this.stage = new PIXI.Container();
		this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {transparent: true}, false );
		this._element.appendChild( this.renderer.view );
		this._lastFrameTime = 0;
		this.bulletManager = new BulletManager( this, 200 );
		global.ds.event.listen( 'status/.*', this._playerOnlineStatusChanged.bind( this ) );
		requestAnimationFrame( this._tick.bind( this ) );
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
		this.spaceShips.push( new SpaceShip( this, x, y, name ) );
	}

	_removePlayer( name ) {
		for( var i = 0; i < this.spaceShips.length; i++ ) {
			if( this.spaceShips[ i ].name === name ) {
				this.spaceShips[ i ].destroy();
				this.spaceShips.splice( i, 1 );
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