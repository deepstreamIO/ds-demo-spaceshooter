const PIXI = require( 'pixi.js' );

// Speed and acceleration is expressed in pixels per millisecond
const MAX_SPEED = 5;
const MAX_HEALTH = 30;
const ACCELERATION = 0.01;
const FIRE_INTERVAL = 100;
const BARREL_LENGTH = 27;
const HIT_HIGHLIGHT_DURATION = 70;
const TINTS = [
	0x00FF00,
	0x66FFAA,
	0x00FFFF,
	0xFF00FF,
	0xFFAAFF,
	0x00FF33,
	0x99FF44,
	0xFFFF00,
	0xFF6600
];

module.exports = class SpaceShip{
	constructor( game, x, y, name ) {

		// record
		this._record = global.ds.record.getRecord( 'player/' + name );

		// public properties
		this.name = name;
		this.tint = this._getTint();

		this._game = game;
		this._isDestroyed = false;
		this._timeLastBulletFired = 0;
		this._hitHighlightStart = null;
		this._speed = 0;
		this._health = MAX_HEALTH;

		// text
		this._textStyle = { font : '14px Arial', fill: 'rgb(0,255,0)', align : 'center' };
		this._text = new PIXI.Text( name, this._textStyle );
		this._text.anchor.x = 0.5;
		this._text.anchor.y = 0.5;
		this._game.stage.addChild( this._text );

		// container
		this._container = new PIXI.Container();
		this._container.position.x = x;
		this._container.position.y = y;

		// body
		this._body = PIXI.Sprite.fromImage( '/img/spaceship-body.png' );
		this._body.tint = this.tint;
		this._body.anchor.x = 0.5;
		this._body.anchor.y = 0.5;
		this._container.addChild( this._body );

		// turret
		this._turret = PIXI.Sprite.fromImage( '/img/spaceship-turret.png' );
		this._turret.tint = this.tint;
		this._turret.anchor.x = 0.45;
		this._turret.anchor.y = 0.6;
		this._turret.pivot.x = 1;
		this._turret.pivot.y = 7;
		this._container.addChild( this._turret );
		this._game.stage.addChild( this._container );

		// explosion
		this._explosion = new PIXI.extras.MovieClip( global.EXPLOSION_FRAMES.map( PIXI.Texture.fromImage ) );
		this._explosion.anchor.x = 0.5;
		this._explosion.anchor.y = 0.5;
		this._explosion.loop = false;

		this._game.on( 'update', this._update.bind( this ) );
	}

	checkHit( bulletPosition ) {
		if( this._body.containsPoint( bulletPosition ) ) {
			this._body.tint = 0xFF0000;
			this._turret.tint = 0xFF0000;
			this._hitHighlightStart = performance.now();
			this._health--;
			if( this._health <= 0 ) {
				this._onDestroyed();
			} else {
				var f = ( this._health / MAX_HEALTH );
				var g = Math.floor(f * 255);
				var r = Math.floor( ( 1 - f ) * 255 );

				this._textStyle.fill = `rgb(${r}, ${g}, 0)`;
				this._text.style = this._textStyle;
			}

			return true;
		}
		return false;
	}

	_getTint() {
		var sum = 0, i;

		for( i = 0; i < this.name.length; i++ ) {
			sum += this.name.charCodeAt( i );
		}

		return TINTS[ sum % TINTS.length ];
	}

	remove() {
		this._game.stage.removeChild( this._container );
		this._game.stage.removeChild( this._text );
		this._game.stage.removeChild( this._explosion );
		this._record.delete();
		this._record.discard();
	}

	_onDestroyed() {
		this._game.stage.addChild( this._explosion );
		this._isDestroyed = true;
		this._explosion.position.x = this._container.position.x;
		this._explosion.position.y = this._container.position.y;
		this._explosion.play();
	}

	_update( msSinceLastFrame, currentTime ) {
		if( this._record.isReady === false ) {
			return;
		}
		var data = this._record.get();

		this._turret.rotation = data.turretRotation - data.bodyRotation;
		this._container.rotation = data.bodyRotation;

		this._speed +=  ( msSinceLastFrame * ACCELERATION ) * ( data.moving ? 1 : -1 );

		if( this._isDestroyed ) {
			if( this._explosion.currentFrame + 1 === this._explosion.totalFrames ) {
				this._game.removePlayer( this.name );
			}
			this._container.alpha = ( 1 - ( this._explosion.currentFrame + 1 ) ) / this._explosion.totalFrames;
		}

		if( this._speed < 0 ) {
			this._speed = 0;
		}

		if( this._speed > MAX_SPEED ) {
			this._speed = MAX_SPEED;
		}

		if( this._hitHighlightStart && currentTime > this._hitHighlightStart + HIT_HIGHLIGHT_DURATION ) {
			this._body.tint = this.tint;
			this._turret.tint = this.tint;
			this._hitHighlightStart = null;
		}

		this._container.position.x += Math.sin( this._container.rotation )  * this._speed;
		this._container.position.y -= Math.cos( this._container.rotation )  * this._speed;

		this._text.position.x = this._container.position.x;
		this._text.position.y = this._container.position.y + 45;

		if( data.shooting && currentTime > this._timeLastBulletFired + FIRE_INTERVAL ) {
			var alpha = data.turretRotation;
			var x = this._container.position.x + Math.sin( alpha ) * BARREL_LENGTH;
			var y = this._container.position.y - Math.cos( alpha ) * BARREL_LENGTH

			this._game.bulletManager.add( x, y, alpha, this );
			this._timeLastBulletFired = currentTime;
		}
	}
}