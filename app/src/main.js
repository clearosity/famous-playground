/* globals define */
define(function(require, exports, module) {
  'use strict';
  // import dependencies
  var Engine = require('famous/core/Engine');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var ImageSurface = require('famous/surfaces/ImageSurface');

  var AppView = require('./app-view');

  // create the main context
  var mainContext = Engine.createContext();



  var initialTime = Date.now();
  var centerSpinModifier = new Modifier({
    origin: [0.5, 0.5],
    /*
    transform : function() {
      return Transform.rotateY(.002 * (Date.now() - initialTime));
    }*/
  });

  var outlineModifier = new Modifier({
    origin: [.5, .5],
    transform: Transform.translate(0, 0, 0)
  });

  var appView = new AppView();

  mainContext.add(outlineModifier).add(appView);
  mainContext.setPerspective(1000);

});
