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

  var outlineModifier = new Modifier({
    origin: [.5, .5]
  });

  var appView = new AppView();

  mainContext.add(outlineModifier).add(appView);
  mainContext.setPerspective(1000);

});
