# Tutorial: Building a multiplayer space shooter
![Space shooter](TODO slim wide gif of space fighting)
Space - the final frontier. And a surprisingly good place to blow stuff up. In this tutorial we'll walk through the various steps of building a multiplayer space shooter - but with a twist: Rather than everyone playing away on their own computer, we'll bring back the spirit of good old living-room co-op - but for the modern age.

<video>TODO Video of people playing the game</video>

The game itself will run in a single browser window. Every player opens a special URL on their smartphone which turns it into a gamepad and allows their ship to join the game.

## What will we be using?
Let's keep things simple: We'll use [Pixi.js](TODO) for rendering and [deepstream.io](TODO)  as a multiplayer server.

![PIXI JS](TODO slim wide pixi js image)
- **Pixi.JS** is a 2D rendering library for browsers. It uses WebGL and leaves the heavy lifting to the GPU if possible, but falls back to canvas if not. Pixi is just that: a rendering library, giving you all the Stage, Sprite and Container objects you'd expect, but no game logic constructs - those are our job.

![Deepstream.io](TODO deepstream io banner)
- **deepstream.io** is a new type of server for realtime connectivity. It handles all sorts of persistent connections, e.g. TCP or Websocket for browsers and provides high level concepts like data-sync, pub-sub and request-response. But most importantly for this tutorial: It's fast.

## Requirements
We want this valvety smooth 60 FPS framerate - and we want our controls to play along. This means that every touch on a gamepad needs to be translated to an action on the screen in less than 16.6 milliseconds - something pixi.JS and deepstream are perfectly capable of.

But: Beware of network latency. Information needs time to travel through cables - for optic fibre about two/thirds the speed of light. This is fast, but if you host your application across the globe can still lead to lag.

## About this tutorial
This tutorial will take you trough the high level concepts and all the tricky bits of the implementation - for brevities sake though it skips a lot of project setup, css / styling and most of the more common aspects. To get an impression of how everything fits together, have a look at the [Github Repository]()

## Let's start with the structure
Let's start by creating three files:

- **game.js** will contain the main game object that creates the PIXI stage,
adds and removes spaceships to it and manages the game loop (more about that later)
- **spaceship.js** will represent a single player / spaceship
- **index.js** will start everything up

## Create a stage
PIXI is based on hierarchies of display objects such as sprites or movie clips. These objects can be grouped in containers. Every PIXI project starts with an outermost container that we'll call "stage".

To turn your object-hierarchie into an image, you need a "renderer". PIXI will try to use WebGL for rendering, but can fall back to good old canvas if necessary.

For our spaceshooter, we'll let PIXI decide what renderer to use, the only important things are: It needs to extend to the full size of the screen and shouldn't have a background color (so that we can place a spacy image behind)

To do this, add the following lines to your game class: 

```javascript
constructor( element ) {
        this.stage = new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {transparent: true}, false );
        element.appendChild( this.renderer.view );
}
```


## Adding a spaceship
Time to add a spaceship to our stage. Spaceship's are just a collection of small images, so called sprites. To create one, we'll tell PIXI to create a `PIXI.Sprite.fromImage( url )` and move it to its initial coordinates. By default, these coordinates specify the top-left corner of our sprite. Instead, we want them to specify the center, so we also need to set the sprite's `anchor` position to 0.5 for both x and y. This will also be used as a pivot-point when we rotate the sprite later on. Finally, we'll add the spaceship to the stage.

```javascript
class SpaceShip{
    constructor( game, x, y ) {
        this._game = game;
        this._body = PIXI.Sprite.fromImage( '/img/spaceship-body.png' );
        this._body.position.x = x;
        this._body.position.y = y;
        this._body.anchor.x = 0.5;
        this._body.anchor.y = 0.5;
        this._game.stage.addChild( this._body );
    }
}
```

## Rendering the stage
So - were's our spaceship? We've created a stage and a renderer so far, but we haven't told the renderer to render the stage yet. Let's do this now. Every time the browser is ready to draw a new frame, we want the renderer to kick in and render our stage. For this, we'll use `requestAnimationFrame( callback )`. This schedules a callback to be executed, the next time a frame can be drawn. We'll add this method twice in `game.js` - once to draw the initial frame and from within our `_tick()` method call itself for all eternity.

```javascript
// in game.js
constructor( element ) {
    ...
    requestAnimationFrame( this._tick.bind( this ) )
}

_tick() {
    this.renderer.render( this.stage );
    requestAnimationFrame( this._tick.bind( this ) );
}



- Setup the stage and add a spaceship
- Add a turret
- Build controls
- Start a deepstream server
- Connect controls to deepstream
- Connect game to deepstream
- Add a game loop
- Steer spaceship via pad (static name)
- Make names dynamic / add listening + name entry
- Add loading
- Add shooting and Bullet Manager
- Add hit detection
- Add explosion
- Game over and recycling
- 