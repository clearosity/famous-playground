define(function(require, exports, module) {
  //All the required classes used in this file

  var Engine = require('famous/core/Engine');
  var StateModifier = require('famous/modifiers/StateModifier');
  var Surface = require('famous/core/Surface');
  var Transform = require('famous/core/Transform');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Modifier = require('famous/core/Modifier');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var View = require('famous/core/View');

  var Timer = require('famous/utilities/Timer');

  //For rotation. Famo.us uses radians for angles
  var convert = Math.PI/180;

  //Cube side colors
  var colors = ['red', 'yellow', 'blue', 'green', 'purple', 'black'];


  var Cube = function(options){
    View.apply(this, arguments);

    options = options || {};

    this.size = options.size || 100;
    this._origin = options.origin || {x: 0.5, y: 0.5};


    this.parentMod = new Modifier({
      origin: [.5, .5],
      size: [this.size,this.size]
    });

    this.parentNode = this.add( this.parentMod );

    this._surfaces = [];
    
    this._parentMod = [];

    this._createSurfaces();

    this._positionSurfaces();

  };

  Cube.prototype = Object.create(View.prototype);

  Cube.prototype.constructor = Cube;


  Cube.prototype.rotate = function(){
    var initialTime = Date.now();

    function getSpinTransform() {
      return Transform.rotate( -.002 * (Date.now() - initialTime), -.002 * (Date.now() - initialTime), 0);
    }
    this.parentMod.setTransform(getSpinTransform);
  }



  Cube.prototype._createSurfaces = function(){

    //create surfaces and their properties
    for (i = 0; i < 6; i++) {
      this._surfaces[i] = new Surface({
        size: [this.size*2, this.size*2],
        properties: {
          backgroundColor: colors[i],
          color:'white',
          textAlign:'center',
          backfaceVisibility: "visible",
          webkitBackfaceVisibility: "visible"
        }
      });

      this._parentMod[i] = new Modifier({
        origin: [0.5,0.5],
        opacity: 0.5
      });

      //each surface gets applied to a parentModifier and that modifier will be respnsible for the surface's arrangement
      //to form a cube
      this.parentNode.add(this._parentMod[i]).add(this._surfaces[i]);
    }

  }


  Cube.prototype._positionSurfaces = function(){
    //2D array of x, y, and z rotation points
    var rotate = [
      [0, 0, 0],
      [0, 90, 0],
      [0, -90, 0],
      [0, 180, 0],
      [90, 0, 0],
      [-90, 0, 0]
    ];

    //2D array of x, y and z translation values
    var xlate = [
      [0, 0, this.size],
      [this.size, 0, 0],
      [-this.size, 0, 0],
      [0, 0, -this.size],
      [0, this.size, 0],
      [0, -this.size, 0]
    ];

    var matrix = [];
    var xlt;
    var rot;

    //Magic number 6 for sides of a cube
    for (i =0; i < 6; i++) {
      xlt = xlate[i];
      rot = rotate[i];

      //Transform.multiple takes two transforms, "multplies" them together 
      //to return a matrix with both the transforms in it

      matrix.push(Transform.multiply(
      Transform.translate(xlt[0], xlt[1], xlt[2]),
      Transform.rotate(rot[0]*convert, rot[1]*convert, rot[2]*convert)));

      //applies the final transform matrix to the parentModifier at index 'i', which relates to a side of the cube
      this._parentMod[i].transformFrom(matrix[i]);
    }

  }



  module.exports = Cube;

});
