const PIXI = require( 'pixi' );

module.exports = class Game{
	constructor( element ) {
		this._element = element;
		this._gameObjects = [];
		this._stage = new PIXI.Stage( 0x000000 );
		this._renderer = PIXI.autoDetectRenderer( window.innerWidth - 20, window.innerHeight - 20 );
		this._element.appendChild( this._renderer.view );
		requestAnimationFrame( this._tick.bind( this ) );
	}

	add( gameObject ) {
		this._gameObjects.push( gameObject );
		this._stage.addChild( gameObject.getPixiObject() );
	}

	_tick( timePassed ) {
		for( var i = 0; i < this._gameObjects.length; i++ ) {
			this._gameObjects[ i ].update();
		}

		this._renderer.render( this._stage );
		requestAnimationFrame( this._tick.bind( this ) );
	}
}