var Game = require( './game' );
var SpaceShip = require( './objects/spaceship' );

var game = new Game( document.body );
game.add( new SpaceShip( 50, 50 ) );

