var Game = require( './game' );
var SpaceShip = require( './objects/spaceship' );
var deepstream = require( 'deepstream.io-client-js' );
var ds = deepstream( 'localhost:6020' ).login( null, () => {
	var game = new Game( document.body );
	game.add( new SpaceShip( 300, 300, ds.record.getRecord( 'player/wolfram' ) ) );
});


