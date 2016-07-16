const PIXI = require( 'pixi' );


module.exports = class SpaceShip{
	constructor( x, y, record ) {
		this._record = record;
		this._container = new PIXI.DisplayObjectContainer();
		this._bodyTexture = PIXI.Texture.fromImage( '/img/spaceship-body.png' );
		this._body = new PIXI.Sprite( this._bodyTexture );
		this._turretTexture = PIXI.Texture.fromImage( '/img/spaceship-turret.png' );
		this._turret = new PIXI.Sprite( this._turretTexture );
		this._turret.anchor.x = 0.45;
		this._turret.anchor.y = 0.6;
		this._turret.pivot.x = 1;
		this._turret.pivot.y = 7;
		this._container.addChild( this._body );
		this._container.addChild( this._turret );
		this._container.position.x = x;
		this._container.position.y = y;
		this._body.anchor.x = 0.5;
		this._body.anchor.y = 0.5;
		window.xxx = this;
	}

	getPixiObject() {
		return this._container;
	}

	update() {
		var data = this._record.get();
		this._turret.rotation = data.turretRotation - data.bodyRotation;
		this._container.rotation = data.bodyRotation;
	}
}