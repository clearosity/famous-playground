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
  var _ = require('underscore');
  var Timer = require('famous/utilities/Timer');

  //For rotation. Famo.us uses radians for angles
  var convert = Math.PI/180;

  //Cube side colors
  var colors = ['red', 'yellow', 'blue', 'green', 'purple', 'black'];


  var TransitionableView = function(options){
    View.apply(this, arguments);

    this._options = options || {};
    this._options.origin = this._options.origin || [0.5, 0.5];
    this._options.size = this._options.size || [100, 100];

    this._parentMod = new Modifier(this._options);

    this._translateTransform = new TransitionableTransform();
    var opts = _.extend({}, this._options, {
      transform: this._translateTransform
    })

    this._translateMod = new Modifier(opts);

    this._rotateTransform = new TransitionableTransform();
    this._scale = this._options.scale || 1;

    var opts = _.extend({}, this._options, {
      transform: Transform.scale(this._scale, this._scale, this._scale)
    })
    this._rotateMod = new Modifier(opts);

    this._parentNode = View.prototype.add.call( this, this._parentMod )
                          .add( this._translateMod ).add(this._rotateMod);

  };

  TransitionableView.prototype = Object.create(View.prototype);

  TransitionableView.prototype.constructor = TransitionableView;


  TransitionableView.prototype.add = function(renderNode){
    return this._parentNode.add( renderNode );
  }


  TransitionableView.prototype.random = function(min, max){
    return Math.random() * (max - min + 1) + min;
  }


  TransitionableView.prototype.translate = function(){
    this._out = !this._out;

    var x = this._out ? 0 : this.random(-500, 500);
    var y = this._out ? 0 : this.random(-500, 500);
    var z = this._out ? 0 : this.random(-500, 500);

    this._translateTransform.set( Transform.translate(x, y, z), {
      duration: 1000,
      curve: 'outCubic'
    }, function() {
      console.log("here")
    });

  }



  TransitionableView.prototype.rotate = function(){
    if(this._rotating) return;

    var self = this;

    this._rotateTransform.set(Transform.rotateX(0));

    this._rotateMod.setTransform( this._rotateTransform );

    var initialTime = Date.now();

    self._rotateMod.setTransform( function(){
      self._rotateMatrix = Transform.multiply( Transform.rotate(-.003 * (Date.now() - initialTime), -.003 * (Date.now() - initialTime), 0),
                              Transform.scale(self._scale, self._scale, self._scale))
      return self._rotateMatrix;
    });

    var to = this.random(2000, 5000);

    setTimeout(function(){
      self.haltRotate();
    }, to)

    this._rotating = true;

  }

  TransitionableView.prototype.haltRotate = function(){
    if(!this._rotating) return;

    this._rotateTransform.set(this._rotateMatrix);
    this._rotateMod.setTransform( this._rotateTransform );
    
    var self = this;
    this._rotateTransform.set(
      Transform.multiply( Transform.rotate(0, 0, 0),
                              Transform.scale(self._scale, self._scale, self._scale)), {
        duration: 1000,
        curve: 'outCubic'
    }, function() {
      self._rotating = false;
      self.rotate();
    });

  }




  module.exports = TransitionableView;

});
