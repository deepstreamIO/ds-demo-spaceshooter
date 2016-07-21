const PIXI = require( 'pixi.js' );

// Maximum speed in pixels per millisecond a ship can reach
const MAX_SPEED = 5;

// Amount of hits a ship can take before it explodes
const MAX_HEALTH = 10;

// Increase of speed in pixels per millisecond
const ACCELERATION = 0.01;

// Time that passes between shots
const FIRE_INTERVAL = 100;

// The length of the turret's barrel. Shooting starts at its end
const BARREL_LENGTH = 27;

// The amount of milliseconds the ship flashes red after its hit
const HIT_HIGHLIGHT_DURATION = 70;

// Different colors for different players
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

	/**
	 * This class represents a single player / spaceship
	 * on the screen. It creates the required display objects,
	 * and contains logic for movement, shooting and hit detection
	 *
	 * @param   {Game} 	 game A reference to the parent game object
	 * @param   {Number} x    Starting position x
	 * @param   {Number} y    Starting position y
	 * @param   {String} name Name of the player this ship belongs to
	 *
	 * @constructor
	 */
	constructor( game, x, y, name ) {

		// record
		this._record = global.ds.record.getRecord( 'player/' + name );

		// public properties
		this.name = name;
		this.tint = this._getTint();

		// private properties
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

		// explosion will be added to stage once spaceship destroyed
		this._explosion = new PIXI.extras.MovieClip( global.EXPLOSION_FRAMES.map( PIXI.Texture.fromImage ) );
		this._explosion.anchor.x = 0.5;
		this._explosion.anchor.y = 0.5;
		this._explosion.loop = false;

		// add spaceship to visible stage
		this._game.stage.addChild( this._container );

		// bind to gameloop
		this._game.on( 'update', this._update.bind( this ) );
	}

	/**
	 * Check if the spaceship was hit by a bullet
	 *
	 * @param   {PIXI.Point} bulletPosition
	 *
	 * @public
	 * @returns {Boolean} wasHit
	 */
	checkHit( bulletPosition ) {
		if( this._body.containsPoint( bulletPosition ) ) {
			// Ok, we're hit. Flash red
			this._body.tint = 0xFF0000;
			this._turret.tint = 0xFF0000;
			this._hitHighlightStart = performance.now();

			// Remove decrement health by 1
			this._health--;

			if( this._health <= 0 ) {
				// oh dear, we're dead
				this._onDestroyed();
			} else {
				// still alive, but taken some damage. Update text color from green to red
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

	/**
	 * Returns the color for the player's ship. We want to
	 * give the same player the same colored ship without keeping
	 * state - so we create a hash out of the player's name and get
	 * the color that belongs to its modulo
	 *
	 * @private
	 * @returns {HEX} tint
	 */
	_getTint() {
		var sum = 0, i;

		for( i = 0; i < this.name.length; i++ ) {
			sum += this.name.charCodeAt( i );
		}

		return TINTS[ sum % TINTS.length ];
	}

	/**
	 * Removes all assets that make up the ship and deletes
	 * the associated record
	 *
	 * @private
	 * @returns {void}
	 */
	remove() {
		this._game.stage.removeChild( this._container );
		this._game.stage.removeChild( this._text );
		this._game.stage.removeChild( this._explosion );
		this._record.delete();
	}

	/**
	 * Called once the ship was blown up. Adds the explosion animation
	 *
	 * @private
	 * @returns {void}
	 */
	_onDestroyed() {
		this._isDestroyed = true;
		this._game.stage.addChild( this._explosion );
		this._explosion.position.x = this._container.position.x;
		this._explosion.position.y = this._container.position.y;
		this._explosion.play();
	}

	/**
	 * This method is called for every ship before every frame
	 * that's rendered
	 *
	 * @param   {Number} msSinceLastFrame milliseconds since last frame was rendered
	 * @param   {Number} currentTime      milliseconds since page was opened
	 *
	 * @private
	 * @returns {void}
	 */
	_update( msSinceLastFrame, currentTime ) {
		// let's make sure the record is properly loaded
		if( this._record.isReady === false ) {
			return;
		}

		// data contains the user's input. We'll be using it a lot, so let's get it once
		var data = this._record.get();

		// the turret rotation is set by the right pad. To actually point in the direction
		// the player intended, we need to offset it against the body rotation
		this._turret.rotation = data.turretRotation - data.bodyRotation;

		// the ship's orientation is determined by the left pad. We can just use it 1:1
		this._container.rotation = data.bodyRotation;

		// the ship's speed, expressed in pixels per millisecond. Ships accelerate
		// linearly as long as the player touches the pad until MAX_SPEED is reached.
		// Once the player stops touching the pad, the ship deccelerates until its
		// back to zero
		this._speed +=  ( msSinceLastFrame * ACCELERATION ) * ( data.moving ? 1 : -1 );

		// No going backwards - if we've stopped, we've stopped
		if( this._speed < 0 ) {
			this._speed = 0;
		}

		// cap the speed at max speed
		if( this._speed > MAX_SPEED ) {
			this._speed = MAX_SPEED;
		}

		// Ok, let's move the ship in position for the next frame. Container rotation determines
		// where it will go, speed determines how far it will go
		this._container.position.x += Math.sin( this._container.rotation )  * this._speed;
		this._container.position.y -= Math.cos( this._container.rotation )  * this._speed;

		// The text is not in the container (so that it doesn't rotate with the ship). Let's
		// move it individually
		this._text.position.x = this._container.position.x;
		this._text.position.y = this._container.position.y + 45;

		// Whenever the ship is hit, it flashes red. This removes the active flash
		if( this._hitHighlightStart && currentTime > this._hitHighlightStart + HIT_HIGHLIGHT_DURATION ) {
			this._body.tint = this.tint;
			this._turret.tint = this.tint;
			this._hitHighlightStart = null;
		}

		// If the ship is destroyed, let's check if the explosion is finished. As the explosion progresses
		// the ship gets increasingly more transparent
		if( this._isDestroyed ) {
			if( this._explosion.currentFrame + 1 === this._explosion.totalFrames ) {
				this._game.removePlayer( this.name );
			}
			this._container.alpha = ( 1 - ( this._explosion.currentFrame + 1 ) ) / this._explosion.totalFrames;
		}

		// Hey, we're actively shooting. There's a bit of a gap between bullets, if we're
		// ready to shoot the next one, let's work out where it starts and tell the bullet
		// manager to add one.
		if( data.shooting && currentTime > this._timeLastBulletFired + FIRE_INTERVAL ) {
			var alpha = data.turretRotation;
			var x = this._container.position.x + Math.sin( alpha ) * BARREL_LENGTH;
			var y = this._container.position.y - Math.cos( alpha ) * BARREL_LENGTH

			this._game.bulletManager.add( x, y, alpha, this );
			this._timeLastBulletFired = currentTime;
		}
	}
}