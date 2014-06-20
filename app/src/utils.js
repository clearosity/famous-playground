define(function(require, exports, module) {

  var Utils = function(){}

  Utils.prototype.degToRadians = function(deg) {
    var radians = (deg * Math.PI) / 180;
    return radians;
  }

  return new Utils();

});

