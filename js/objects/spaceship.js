const PIXI = require( 'pixi' );
const Bullet = require( './bullet' );
// Speed and acceleration is expressed in pixels per millisecond
const MAX_SPEED = 5;
const ACCELERATION = 0.01;
const FIRE_INTERVAL = 100;
const BARREL_LENGTH = 27;
window.PIXI = PIXI;
module.exports = class SpaceShip{
	constructor( x, y, recordName ) {
		// record
		this._record = global.ds.record.getRecord( recordName );
		this._game = null;
		this._timeLastBulletFired = 0;

		// properties
		this._speed = 0;
		//this._tint =  0XFF0000; Math.random() * 0xFFFFFF;

		// container
		this._container = new PIXI.DisplayObjectContainer();
		this._container.position.x = x;
		this._container.position.y = y;

		// body
		this._body = PIXI.Sprite.fromImage( '/img/spaceship-body.png' );
		//this._body.tint = this._tint;
		this._body.anchor.x = 0.5;
		this._body.anchor.y = 0.5;
		this._container.addChild( this._body );

		// turret
		this._turret = PIXI.Sprite.fromImage( '/img/spaceship-turret.png' );
		//this._turret.tint = this._tint;
		this._turret.anchor.x = 0.45;
		this._turret.anchor.y = 0.6;
		this._turret.pivot.x = 1;
		this._turret.pivot.y = 7;
		this._container.addChild( this._turret );
	}

	setGame( game ) {
		this._game = game;
	}

	getPixiObject() {
		return this._container;
	}

	update( msSinceLastFrame, currentTime ) {
		if( this._record.isReady === false ) {
			return;
		}
		var data = this._record.get();

		this._turret.rotation = data.turretRotation - data.bodyRotation;
		this._container.rotation = data.bodyRotation;

		this._speed +=  ( msSinceLastFrame * ACCELERATION ) * ( data.moving ? 1 : -1 );

		if( this._speed < 0 ) {
			this._speed = 0;
		}

		if( this._speed > MAX_SPEED ) {
			this._speed = MAX_SPEED;
		}

		this._container.position.x += Math.sin( this._container.rotation )  * this._speed;
		this._container.position.y -= Math.cos( this._container.rotation )  * this._speed;

		if( data.shooting && currentTime > this._timeLastBulletFired + FIRE_INTERVAL ) {
			var alpha = data.turretRotation;// - Math.PI / 2;
			var x = this._container.position.x + Math.sin( alpha ) * BARREL_LENGTH;
			var y = this._container.position.y - Math.cos( alpha ) * BARREL_LENGTH

			this._game.bulletManager.add( x, y, alpha );
			this._timeLastBulletFired = currentTime;
		}
	}
}