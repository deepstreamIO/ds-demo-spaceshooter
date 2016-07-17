const Game = require( './game' );
const loader = require( './loader' );

loader.load( 'localhost:6020', () => {
	new Game( document.body );
});