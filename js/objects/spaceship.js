const PIXI = require( 'pixi' );


module.exports = class SpaceShip{
	constructor( x, y ) {
		this._container = new PIXI.DisplayObjectContainer();

		this._bodyTexture = PIXI.Texture.fromImage( '/img/spaceship-body.png' );
		this._body = new PIXI.Sprite( this._bodyTexture );
		this._container.addChild( this._body );

		this._container.x = x;
		this._container.y = y;
	}

	getPixiObject() {
		return this._container;
	}

	update() {

	}
}