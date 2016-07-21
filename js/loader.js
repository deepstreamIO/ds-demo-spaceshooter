const deepstream = require( 'deepstream.io-client-js' );
const PIXI = require( 'pixi.js' );

/**
 * This class loads all required images into
 * PIXI's texture cache so that they're available when
 * needed within the game
 *
 * In parallel it also establishes a connection to the deepstream server
 */
class Loader{

	/**
	 * Creates the loader and adds the initial set of bitmap images
	 *
	 * @private
	 * @returns {void}
	 */
	constructor() {
		this._connectionReady = false;
		this._imagesReady = false;
		this._callback = null;

		// Create the image loader and add the initial assets
		this._assetLoader = new PIXI.loaders.Loader();
		this._assetLoader.add( '/img/spaceship-body.png' );
		this._assetLoader.add( '/img/spaceship-turret.png' );
		this._assetLoader.add( '/img/bullet.png' );

		// Add the image sequence for the explosion MovieClip
		this._addExplosionFrames();

		// Once all images are loaded, check if we're good to go
		this._assetLoader.once( 'complete', this._onImagesLoaded.bind( this ) );
	}

	/**
	 * Starts the loading process
	 *
	 * @param   {String}   deepstreamUrl host:port for the deepstream server
	 * @param   {Function} callback      Will be invoked once everything has been loaded
	 *
	 * @public
	 * @returns {void}
	 */
	load( deepstreamUrl, callback ) {
		this._callback = callback;
		this._assetLoader.load();
		global.ds = deepstream( deepstreamUrl ).login( null, this._onLoggedIn.bind( this ) );
	}

	/**
	 * Explosions are movie-clips that iterate through a sequence of images. Each images
	 * has to be loaded individually
	 *
	 * @private
	 * @returns {void}
	 */
	_addExplosionFrames() {
		// Add loading zeros to numbers below 10
		var pad = ( n ) => { return n > 9 ? n : '0' + n; };
		var i, url;

		// Rather than passing the result arround, we'll simple expose the array
		// of frame urls as a global
		global.EXPLOSION_FRAMES = [];
		for( var i = 1; i < 24; i++ ) {
			url = '/img/explosion/explosion_frame_' + pad( i ) + '.png';
			this._assetLoader.add( url );
			global.EXPLOSION_FRAMES.push( url );
		}
	}

	/**
	 * Callback once all images have loaded
	 *
	 * @private
	 * @returns {void}
	 */
	_onImagesLoaded() {
		this._imagesReady = true;
		this._checkReady();
	}

	/**
	 * Callback once the connection to the deepstream server
	 * is established and authenticated
	 *
	 * @private
	 * @returns {void}
	 */
	_onLoggedIn() {
		this._connectionReady = true;
		this._checkReady();
	}

	/**
	 * Invokes the callback once both images and deepstream
	 * connection are ready
	 *
	 * @private
	 * @returns {void}
	 */
	_checkReady() {
		if(
			this._connectionReady &&
			this._imagesReady
		) {
			this._callback();
		}
	}
}

module.exports = new Loader();