const PIXI = require( 'pixi' );
const SpaceShip = require( './objects/spaceship' );
const BulletManager = require( './bullet-manager' );
module.exports = class Game{
	constructor( element ) {
		this._element = element;
		this._gameObjects = [];
		this.stage = new PIXI.Stage();
		this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, null, true );
		this._element.appendChild( this.renderer.view );
		this._players = global.ds.record.getList( 'players' );
		this._lastFrameTime = 0;
		this._players.on( 'entry-added', this._addPlayer.bind( this ) );
		this._players.on( 'entry-removed', this._removePlayer.bind( this ) );
		this._players.getEntries().forEach( this._addPlayer.bind( this ) );
		this.bulletManager = new BulletManager( this, 200 );
		requestAnimationFrame( this._tick.bind( this ) );
		window.xxx = this;
	}

	add( gameObject ) {
		this._gameObjects.push( gameObject );
		if( gameObject.setGame ) {
			gameObject.setGame( this );
		}
		this.stage.addChild( gameObject.getPixiObject() );
	}


	_addPlayer( recordName ) {
		var x = this.renderer.width * ( 0.1 + Math.random() * 0.8 );
		var y = this.renderer.height * ( 0.1 + Math.random() * 0.8 );
		this.add( new SpaceShip( x, y, recordName ) );
	}

	_removePlayer( recordName ) {

	}

	_tick( currentTime ) {

		for( var i = 0; i < this._gameObjects.length; i++ ) {
			this._gameObjects[ i ].update( currentTime - this._lastFrameTime, currentTime );
		}
		this.bulletManager.update();
		this._lastFrameTime = currentTime;

		this.renderer.render( this.stage );
		requestAnimationFrame( this._tick.bind( this ) );
	}
}