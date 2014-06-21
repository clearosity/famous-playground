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

  var TransitionableView = require('./transitionable-view');


  //For rotation. Famo.us uses radians for angles
  var convert = Math.PI/180;

  //Cube side colors
  var colors = ['red', 'yellow', 'blue', 'green', 'purple', 'black'];


  var Cube = function(options){
    options = options || {};

    this.size = options.size || 100;

    TransitionableView.apply(this, [options]);

    this._surfaces = [];
    
    this._parentMods = [];

    this._createSurfaces();

    this._positionSurfaces();

  };

  Cube.prototype = Object.create(TransitionableView.prototype);

  Cube.prototype.constructor = Cube;


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
          webkitBackfaceVisibility: "visible",
          mozBackfaceVisibility: "visible"
        }
      });

      this._parentMods[i] = new Modifier({
        origin: [0.5,0.5],
        opacity: 0.5
      });

      //each surface gets applied to a parentModifier and that modifier will be respnsible for the surface's arrangement
      //to form a cube
      this.add(this._parentMods[i]).add(this._surfaces[i]);
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
      this._parentMods[i].transformFrom(matrix[i]);
    }

  }



  module.exports = Cube;

});
