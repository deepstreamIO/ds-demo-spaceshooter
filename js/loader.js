const deepstream = require( 'deepstream.io-client-js' );
const PIXI = require( 'pixi.js' );

class Loader{
	constructor() {
		this._connectionReady = false;
		this._imagesReady = false;
		this._callback = null;
		this._assetLoader = new PIXI.loaders.Loader();
		this._assetLoader.add( '/img/spaceship-body.png' );
		this._assetLoader.add( '/img/spaceship-turret.png' );
		this._assetLoader.add( '/img/bullet.png' );
		this._assetLoader.once( 'complete', this._onImagesLoaded.bind( this ) );
	}

	load( deepstreamUrl, callback ) {
		this._callback = callback;
		this._assetLoader.load();
		global.ds = deepstream( deepstreamUrl ).login( null, this._onLoggedIn.bind( this ) );
	}

	_onImagesLoaded() {
		this._imagesReady = true;
		this._checkReady();
	}

	_onLoggedIn() {
		this._connectionReady = true;
		this._checkReady();
	}

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