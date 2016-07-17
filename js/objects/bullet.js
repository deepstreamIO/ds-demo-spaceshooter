const PIXI = require( 'pixi' );
const SPEED = 8;

module.exports = class Bullet{
	constructor( x, y, alpha ) {
		this._sprite = new PIXI.Sprite( PIXI.Texture.fromImage( '/img/bullet.png' ) );
		this._alpha = alpha;
		this._sprite.position.x = x;
		this._sprite.position.y = y;
		this._sprite.anchor.x = 0.5;
		this._sprite.anchor.y = 0.5;
		this._sprite.rotation = alpha;
	}

	getPixiObject() {
		return this._sprite;
	}

	update() {
		this._sprite.position.x += Math.sin( this._alpha ) * SPEED;
		this._sprite.position.y -= Math.cos( this._alpha ) * SPEED;
	}
}