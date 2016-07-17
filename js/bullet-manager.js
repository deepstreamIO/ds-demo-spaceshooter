const PIXI = require( 'pixi.js' );
const SPEED = 7;

module.exports = class BulletManager{
	constructor( game, initialBullets ) {
		this._game = game;
		this._game.on( 'update', this._update.bind( this ) );
		this._activeBullets = [];
		this._passiveBullets = [];
		this._texture = PIXI.Texture.fromImage( '/img/bullet.png' );
		for( var i = 0; i < initialBullets; i++ ) {
			this._createBullet();
		}
	}

	add( x, y, alpha ) {
		if( this._passiveBullets.length === 0 ) {
			this._createBullet();
		}

		var bullet = this._passiveBullets.pop();
		bullet.position.x = x;
		bullet.position.y = y;
		bullet.rotation = alpha;
		this._activeBullets.push( bullet );
	}

	_update() {
		var i, bullet;

		for( i = 0; i < this._activeBullets.length; i++ ) {
			bullet = this._activeBullets[ i ];
			bullet.position.x += Math.sin( bullet.rotation ) * SPEED;
			bullet.position.y -= Math.cos( bullet.rotation ) * SPEED;

			if(
				bullet.position.x < 0 ||
				bullet.position.x > this._game.renderer.width ||
				bullet.position.y < 0 ||
				bullet.position.y > this._game.renderer.height
			) {
				bullet.position.x = -50;
				bullet.position.y = -50;
				bullet.rotation = 0;
				this._activeBullets.splice( i, 1 );
				this._passiveBullets.push( bullet );
			}
		}
	}

	_createBullet() {
		var bullet = new PIXI.Sprite( this._texture );
		bullet.position.x = -50;
		bullet.position.y = -50;
		bullet.anchor.x = 0.5;
		bullet.anchor.y = 0.5;
		bullet.rotation = 0;
		this._passiveBullets.push( bullet );
		this._game.stage.addChild( bullet );
	}
}