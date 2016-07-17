const deepstream = require( 'deepstream.io-client-js' );
const PIXI = require( 'pixi' );
const IMAGES = [
	'/img/spaceship-body.png',
	'/img/spaceship-turret.png',
	'/img/bullet.png'
];

class Loader{
	constructor( deepstreamUrl, callback ) {
		this._loggedIn = false;
		this._listLoaded = false;
		this._imagesLoaded = false;
		this._callback = null;
		this._ds = null;
		this._assetLoader = new PIXI.AssetLoader( IMAGES );
		this._assetLoader.onComplete = this._onImagesLoaded.bind( this );
	}

	load( deepstreamUrl, callback ) {
		this._callback = callback;
		this._assetLoader.load();
		this._ds = deepstream( deepstreamUrl ).login( null, this._onLoggedIn.bind( this ) );
		global.ds = this._ds;
	}
	_onImagesLoaded() {
		this._imagesLoaded = true;
		this._checkReady();
	}

	_onLoggedIn() {
		this._loggedIn = true;
		this._ds.record.getList( 'players' ).whenReady( this._onListLoaded.bind( this ) );
	}

	_onListLoaded() {
		this._listLoaded = true;
		this._checkReady();
	}

	_checkReady() {
		if(
			this._listLoaded &&
			this._loggedIn &&
			this._imagesLoaded
		) {
			this._callback();
		}
	}
}

module.exports = new Loader();