define(function(require, exports, module) {

    var Surface = require('famous/core/Surface');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var View = require('famous/core/View');
    var ToggleButton = require('famous/widgets/ToggleButton');
    var SequentialLayout = require('famous/views/SequentialLayout')
    var HeaderFooterLayout = require('famous/views/HeaderFooterLayout');
    var GenericSync = require('famous/inputs/GenericSync');
    var TouchSync = require('famous/inputs/TouchSync');
    var PinchSync = require('famous/inputs/PinchSync');
    var ScrollSync = require('famous/inputs/ScrollSync');
    var MouseSync = require('famous/inputs/MouseSync');
    var Timer = require('famous/utilities/Timer');

    var SpringTransition = require('famous/transitions/SpringTransition');
    var SnapTransition = require('famous/transitions/SnapTransition');
    var Engine = require("famous/core/Engine");
    var TransitionableTransform = require('famous/transitions/TransitionableTransform');
    var FM = require("famous/math/Matrix");
    var Transitionable = require('famous/transitions/Transitionable');
    var Easing = require('famous/transitions/Easing');
    var TweenTransition = require('famous/transitions/TweenTransition');

    TweenTransition.registerCurve('outCubic', Easing.outCubic);


    Transitionable.registerMethod('spring', SpringTransition);
    Transitionable.registerMethod('snap', SnapTransition);

    var Polyhedron = require('./polyhedron');
    var TransitionablePolyhedron       = require('./transitionable-polyhedron');
    var Cube       = require('./cube');
    var TransitionableCube       = require('./transitionable-cube');
    var Cube2       = require('./cube2');
    var Utils = require('utils');


    function AppView() {

        View.apply(this, arguments);

        if ((window.devicePixelRatio > 1 && window.innerWidth < 1000)) {
            this.pixelRatio = 2;
        } else {
            this.pixelRatio = 1
        }

        this.minZoom = 8000;
        this.maxZoom = -200 * this.pixelRatio;

        this.maxLeft = -500 / this.pixelRatio;
        this.maxRight = 4800 / this.pixelRatio;

        this.maxUp = -250;
        this.maxDown = 6000 / this.pixelRatio;

        // Stores the centered position of the camera with all cards in view.
        if (this.pixelRatio == 1) {
            this.centerPos = [((640 * 8) / 2) - (640 / 2), ((840 * 4) / 2) - (840 / 2), 4000];
        } else {
            this.centerPos = [((320 * 4) / 2) - (320 / 2), ((420 * 8) / 2) - (420 / 2), 6000];
        }

        //this.poly = new TransitionablePolyhedron({
        this.poly = new TransitionablePolyhedron({
          pixelRatio: this.pixelRatio,
          scale: .15
        });
        
        this.cube = new TransitionableCube({
            scale: 1,
            size: 150
        });

        this.add(this.cube);
        this.cube.rotate();
        
        this.add(this.poly);
        var self = this;
        setTimeout(function(){
          self.poly.rotate();
        }, 500)

        setInterval( function(){
          self.poly.translate()
          self.cube.translate()
        }, 5000)

        
    }


    AppView.prototype = Object.create(View.prototype);
    AppView.prototype.constructor = AppView;

    AppView.DEFAULT_OPTIONS = {};

    /*
    function setCameraMatrix(spin, rotate, pos, override) {

        pos[0] = Math.max(this.maxLeft, Math.min(pos[0], this.maxRight));
        pos[1] = Math.max(this.maxUp, Math.min(pos[1], this.maxDown));
        pos[2] = Math.max(this.maxZoom, Math.min(pos[2], this.minZoom));



        var spinMatrix = Transform.rotate(-spin[0], -spin[1], -spin[2]);
        var invRotateMatrix = Transform.multiply(Transform.multiply(Transform.rotateZ(rotate[2]), Transform.rotateY(rotate[1])), Transform.rotateX(rotate[0]));
        var translateMatrix = Transform.translate(pos[0], pos[1], pos[2]);
        var invTranslateMatrix = Transform.translate(-pos[0], -pos[1], -pos[2]);

        return Transform.multiply(Transform.multiply(Transform.multiply(Transform.multiply(invTranslateMatrix, invRotateMatrix), translateMatrix), spinMatrix), invTranslateMatrix);

    }

    function _createCamera(viewMod) {

        this.spin = [Utils.degToRadians(0), Utils.degToRadians(0), Utils.degToRadians(0)];
        this.rotate = [Utils.degToRadians(0), Utils.degToRadians(0), Utils.degToRadians(0)];

        if (this.pixelRatio == 1) {
            this.pos = [this.centerPos[0], this.centerPos[1], 9000];
        } else {
            this.pos = [this.centerPos[0], this.centerPos[1], 4000];
        }

        this.cameraCurrentRenderMatrix;

        this.cameraTransitionableTransform = new TransitionableTransform();

        var cameraModifier = new Modifier({
            origin: [.5, .5],
            transform: this.cameraTransitionableTransform
        });

        this.cameraTransitionableTransform.set(setCameraMatrix.call(this, this.spin, this.rotate, this.pos));

        this.spinTransitionableTransform = new TransitionableTransform();

        this.ballPositionTransitionableTransform = new TransitionableTransform();

        this.rotateTransitionableTransform = new TransitionableTransform();


        var initialTime = Date.now();

        function getSpinTransform() {
            this.ballSpinStateMatrix = Transform.rotateX(-.001 * (Date.now() - initialTime));
            return this.ballSpinStateMatrix;
        }

        this.ballSpinModifier = new Modifier({
            origin: [.5, .5],
            transform: getSpinTransform.bind(this)
        });



        this.ballPositionMod = new Modifier({
            origin: [.5, .5],
            transform: this.ballPositionTransitionableTransform
        });

        if (this.pixelRatio == 2) {
            var ballZPos = 2000;
        } else {
            var ballZPos = 100;
        }



        this.ballPositionTransitionableTransform.set(
            //Transform.translate(this.centerPos[0], this.centerPos[1] - 3000, ballZPos)
            Transform.translate(this.centerPos[0], this.centerPos[1] - 0, ballZPos)
        );


        
        this.ballPositionTransitionableTransform.set(Transform.translate(this.centerPos[0], this.centerPos[1] + 300, ballZPos), {
            duration: 2500 ,
            curve: 'outCubic'
        }, function() {

            // Switches to transitionable to finish out rotation
            this.spinTransitionableTransform.set(this.ballSpinStateMatrix);
            this.ballSpinModifier.setTransform(this.spinTransitionableTransform);

            // Rotates back to 0 and transforms to cards.
            this.spinTransitionableTransform.set(Transform.rotateX(0), {
                duration: 1000
            }, function() {

                return;    
                this.ballPositionTransitionableTransform.set(Transform.translate(0, 0, 0), {
                    duration: 1500
                })
                this.ballSpinModifier.setOpacity(1, {
                    duration: 1000
                });

                this.pos[2] = this.centerPos[2];

                this.cameraTransitionableTransform.set(setCameraMatrix.call(this, this.spin, this.rotate, this.pos, true), {
                    curve: 'easeOut',
                    duration: 2000
                }, function() {

                    //this.cardView.preloadBackImages();
                }.bind(this));
            }.bind(this));
        }.bind(this));

        


        this.ballSpinModifier.setOpacity(.9);

        //this._add(cameraModifier).add(this.ballPositionMod).add(this.ballSpinModifier).add(viewMod);
        this._add(cameraModifier).add(this.ballPositionMod).add(viewMod);
        //this._add(cameraModifier).add(this.ballPositionMod).add(this.ballSpinModifier).add(viewMod);
    }
    */


    module.exports = AppView;

});