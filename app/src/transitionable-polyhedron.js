define(function(require, exports, module) {

  var Surface = require('famous/core/Surface');
  var ContainerSurface = require('famous/surfaces/ContainerSurface');
  var Modifier = require('famous/core/Modifier');
  var Transform = require('famous/core/Transform');
  var View = require('famous/core/View');
  var ImageSurface = require('famous/surfaces/ImageSurface');
  var EventHandler = require('famous/core/EventHandler');
  var TransitionableTransform = require('famous/transitions/TransitionableTransform');
  var Transitionable = require('famous/transitions/Transitionable');

  var Utils = require('./utils');

  var TransitionableView = require('./transitionable-view');


  var Polyhedron = function(options){
    TransitionableView.apply(this, arguments);

    this.options = options || {};

    if (!this.options.pixelRatio) {
      this.options.pixelRatio = 1;
    }

    this.sideLength = 240 / this.options.pixelRatio;

    this.pentagonWidth = (this.sideLength * Math.cos(Utils.degToRadians(72)) * 2) + this.sideLength;
    this.pentagonHeight = (Math.sin(Utils.degToRadians(72)) *
                              this.sideLength) + (Math.cos(Utils.degToRadians(180 - 108 - (180 - (72 + 90))))
                              * this.sideLength);

    this.hexagonWidth = this.sideLength * 2;
    this.hexagonHeight = (Math.sin(Utils.degToRadians(180 - 120)) * this.sideLength) * 2;


    this._initSurfaces();
    this._positionSurfaces();
  }

  Polyhedron.prototype = Object.create(TransitionableView.prototype);

  Polyhedron.prototype.constructor = Polyhedron;



  /*
  Polyhedron.prototype.rotate = function(){
    var initialTime = Date.now();

    function getSpinTransform() {
        var ballSpinStateMatrix = Transform.multiply( Transform.rotate( -.002 * (Date.now() - initialTime),  -.002 * (Date.now() - initialTime), -.002 * (Date.now() - initialTime)), Transform.scale(0.15, 0.15, 0.15));
        return ballSpinStateMatrix;
    }
    this.parentMod.setTransform(getSpinTransform);
  }
  */


  Polyhedron.prototype._initSurfaces = function(){
    this.surfaces = [];
    this.pentagonSurfaces = [];
    this.hexagonSurfaces = [];
    this.pentIndexes = [];
    this.hexIndexes = [];

    this.transitionableTransforms = [];
    this.mods = [];

    for (var i = 0; i < 32; i++) {
      var surface;

      if(i < 12){
        this.pentIndexes.push(i);

        surface = new ImageSurface({
          size: [this.pentagonWidth, this.pentagonHeight],
          content: '/content/images/pentagon-grey.png',
          classes: ['backfaceVisibility'],
          properties: {
            textAlign: 'center',
            background: '',
            color: '#fff',
            webkitBackfaceVisibility: '',
            zIndex: 1
          },
          opacity: .0
        });

        this.pentagonSurfaces.push( surface );

      }else{
        this.hexIndexes.push(i);

        surface = new ImageSurface({
          size: [this.hexagonWidth, this.hexagonHeight],
          content: '/content/images/hexagon-grey.png',
          classes: ['backfaceVisibility'],
          properties: {
            textAlign: 'center',
            background: '',
            color: '#fff',
            webkitBackfaceVisibility: '',
            zIndex: 1
          }

        });

        this.hexagonSurfaces.push( surface );
      }

      this.surfaces.push( surface );


      this.transitionableTransforms.push(new TransitionableTransform());

      var offsetX = (i % (8 / this.options.pixelRatio)) * (640 / this.options.pixelRatio);
      var offsetY = Math.floor(i / (8 / this.options.pixelRatio)) * (840 / this.options.pixelRatio);

      var offsetX = (i % (8 / this.options.pixelRatio)) * (640 / this.options.pixelRatio);
      var offsetY = Math.floor(i / (8 / this.options.pixelRatio)) * (840 / this.options.pixelRatio);

      this.surfaces[i].flatPosition = [offsetX, offsetY];

      this.mods.push(new Modifier({
        origin: [.5, 0],
        transform: this.transitionableTransforms[i]
      }));

      this.transitionableTransforms[i].set(Transform.translate(this.surfaces[i].flatPosition[0], this.surfaces[i].flatPosition[1], 0));

      this.add(this.mods[i]).add(this.surfaces[i]);
    }

  }


  Polyhedron.prototype._positionSurfaces = function(radius){

    var soccerBallRadius = 2.47801866 * this.sideLength // http://www.answers.com/topic/truncated-icosahedron

    var originOffset = (this.sideLength * .5) / Math.sin(Utils.degToRadians(36));
    var TOU = 20.07675128; // Angle to edge of pentagon from origin and T.
    var pentagonToOriginRadius = originOffset / Math.tan(Utils.degToRadians(TOU));

    var flowerTransform = Transform.multiply(
        Transform.translate(0, -pentagonToOriginRadius, 0),
        Transform.multiply(
            Transform.rotateY(Utils.degToRadians(-72)),
            Transform.multiply(
                Transform.rotateZ(Utils.degToRadians(0)),
                Transform.multiply(
                    Transform.rotateX(Utils.degToRadians(90)),
                    Transform.translate(0, -originOffset, 0) // Offset for origin
                )
            )
        )

    );

    this.soccerBallTransitionables = [];

    var tmpHexArr = this.hexIndexes.slice(0);
    var tmpPentArr = this.pentIndexes.slice(0);

    this._addFaces(this.sideLength, flowerTransform, {
        0: tmpPentArr.shift(),
        1: tmpHexArr.shift(),
        2: tmpHexArr.shift(),
        3: tmpHexArr.shift(),
        4: tmpHexArr.shift(),
        5: tmpHexArr.shift()
    });


    // Calculations for neighboring pentagon rotation
    var TOA = Math.asin(2 / Math.sqrt(5)) * (180 / Math.PI);

    var OAT = OTA = (180 - TOA) / 2;

    var vertexHypotenous = (radius / Math.sin(Utils.degToRadians(OTA))) * Math.sin(Utils.degToRadians(TOA))
    var vertexX = Math.cos(Utils.degToRadians(90 - OTA)) * vertexHypotenous;

    var originalMatrix = Transform.multiply(
        Transform.translate(0, -pentagonToOriginRadius, 0),
        Transform.multiply(
            Transform.rotateY(Utils.degToRadians(-180)),
            Transform.multiply(
                Transform.rotateZ(Utils.degToRadians(0)),
                Transform.multiply(
                    Transform.rotateX(Utils.degToRadians(90)),
                    Transform.translate(0, -originOffset, 0) // Offset for origin
                )
            )
        )

    );

    var secondFlowerTransform = Transform.multiply(
        Transform.rotateY(Utils.degToRadians(0)), Transform.multiply(
            Transform.rotateX(Utils.degToRadians(TOA)), originalMatrix));


    this._addFaces(this.sideLength, secondFlowerTransform, {
        0: tmpPentArr.shift(),
        2: tmpHexArr.shift(),
        3: tmpHexArr.shift(),
        4: tmpHexArr.shift()
    });

    var thirdFlowerTransform = Transform.multiply(
        Transform.rotateY(Utils.degToRadians(-72)),
        Transform.multiply(
            Transform.rotateX(Utils.degToRadians(TOA)),
            originalMatrix
        )

    );

    thirdFlowerTransform = Transform.multiply(Transform.rotateY(Utils.degToRadians(144)), thirdFlowerTransform);

    this._addFaces(this.sideLength, thirdFlowerTransform, {
        0: tmpPentArr.shift(),
        2: tmpHexArr.shift(),
        3: tmpHexArr.shift()
    });

    var forthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(-72)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(0)),
                    originalMatrix))));

    this._addFaces(this.sideLength, forthFlowerTransform, {
        0: tmpPentArr.shift(),
        3: tmpHexArr.shift(),
        4: tmpHexArr.shift()
    });

    var fifthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(-72 * 2)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(0)),
                    originalMatrix))));

    this._addFaces(this.sideLength, fifthFlowerTransform, {
        0: tmpPentArr.shift(),
        3: tmpHexArr.shift(),
        4: tmpHexArr.shift()
    });


    var sixthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(-72 * 3)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(0)),
                    originalMatrix))));

    this._addFaces(this.sideLength, sixthFlowerTransform, {
        0: tmpPentArr.shift(),
        3: tmpHexArr.shift(),
        // 4: 27
    });

    // OUT OF PLACE
    var seventhFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians((72 * 3) - 36)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA * 1.84)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(180)),
                    originalMatrix))));

    this._addFaces(this.sideLength, seventhFlowerTransform, {
        0: tmpPentArr.shift(),
        1: tmpHexArr.shift(),
        5: tmpHexArr.shift()
    });


    var eigthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(-36)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA * 1.84)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(180)),
                    originalMatrix))));

    this._addFaces(this.sideLength, eigthFlowerTransform, {
        0: tmpPentArr.shift(),
        1: tmpHexArr.shift(),
        5: tmpHexArr.shift()
    });

    var ninthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(36)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA * 1.84)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(180)),
                    originalMatrix))));

    this._addFaces(this.sideLength, ninthFlowerTransform, {
        0: tmpPentArr.shift(),
        5: tmpHexArr.shift()
    });


    var tenthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(36 + 72)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA * 1.84)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(180)),
                    originalMatrix))));

    this._addFaces(this.sideLength, tenthFlowerTransform, {
        0: tmpPentArr.shift()
    });


    var eleventhFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(36 + (72 * 3))),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians(TOA * 1.84)),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(180)),
                    originalMatrix))));

    this._addFaces(this.sideLength, eleventhFlowerTransform, {
        0: tmpPentArr.shift()
    });

    var twelthFlowerTransform = Transform.multiply(
        Transform.translate(0, 0, 0), Transform.multiply(

            Transform.rotateY(Utils.degToRadians(36 + 72)),
            Transform.multiply(
                Transform.rotateX(Utils.degToRadians((TOA * 1.84 + TOA))),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(288)),
                    originalMatrix))));

    this._addFaces(this.sideLength, twelthFlowerTransform, {
        0: tmpPentArr.shift()
    });

  }


  Polyhedron.prototype._addFaces = function(sideLength, originTransform, petalIndexes) {
    var pentagonDihedralAngle = -37.38; // Angle between faces of pentagon and hexagon in a truncated icosohedron

    var pentagonInnerAngle = 108;
    var pentagonOuterAngle = 180 - pentagonInnerAngle;

    var pentagonWidth = this.pentagonWidth = (sideLength * Math.cos(Utils.degToRadians(pentagonOuterAngle)) * 2) + sideLength;
    var pentagonHeight = this.pentagonHeight = (Math.sin(Utils.degToRadians(pentagonOuterAngle)) * sideLength) + (Math.cos(Utils.degToRadians(pentagonOuterAngle - (90 - pentagonOuterAngle))) * sideLength);

    var xRotation = 0,
        yRotation = 0,
        zRotation = 0,
        zTranslate;

    var zOffset = 0;
    var xOffset = 0;
    var yOffset = 0;
    var zTranslate = 0;

    if (!petalIndexes) {
        return false;
    }

    for (var x in petalIndexes) {

        if (x == 0) {

            xOffset = 0;
            yOffset = 0;
            zTranslate = 0;

            xRotation = 0;
            yRotation = 0;
            zRotation = 0;

        } else if (x == 3) { // Bottom

            xOffset = 0;
            yOffset = pentagonHeight;
            zTranslate = 0;

            xRotation = pentagonDihedralAngle;
            yRotation = 0;
            zRotation = 0;

        } else if (x == 2) { // Bottom Right 

            xOffset = (sideLength / 2) + ((pentagonWidth - sideLength) / 4);
            yOffset = pentagonHeight - (Math.sin(Utils.degToRadians(pentagonOuterAngle)) * sideLength) / 2
            zTranslate = 0

            xRotation = pentagonDihedralAngle;
            yRotation = 0;
            zRotation = -pentagonOuterAngle;

        } else if (x == 4) { // Bottom Left

            xOffset = -((sideLength / 2) + ((pentagonWidth - sideLength) / 4));
            yOffset = pentagonHeight - (Math.sin(Utils.degToRadians(pentagonOuterAngle)) * sideLength) / 2;
            zTranslate = 0

            xRotation = pentagonDihedralAngle;
            yRotation = 0;
            zRotation = pentagonOuterAngle;

        } else if (x == 1) { // Top Right

            xOffset = pentagonWidth / 4;
            yOffset = (pentagonHeight - (Math.sin(Utils.degToRadians(pentagonOuterAngle)) * sideLength)) / 2;
            zTranslate = 0;

            xRotation = pentagonDihedralAngle;
            yRotation = 0;
            zRotation = -pentagonOuterAngle * 2;

        } else if (x == 5) { // Top Left

            xOffset = -pentagonWidth / 4;
            yOffset = (pentagonHeight - (Math.sin(Utils.degToRadians(pentagonOuterAngle)) * sideLength)) / 2;
            zTranslate = 0;

            xRotation = pentagonDihedralAngle;
            yRotation = 0;
            zRotation = pentagonOuterAngle * 2;


        }

        var PetalTransform = Transform.multiply(
            originTransform,
            Transform.multiply(
                Transform.translate(xOffset, yOffset, zTranslate),
                Transform.multiply(
                    Transform.rotateY(Utils.degToRadians(yRotation)),
                    Transform.multiply(
                        Transform.rotateZ(Utils.degToRadians(zRotation)),
                        Transform.rotateX(Utils.degToRadians(xRotation))
                    )
                )
            ));

        this.transitionableTransforms[petalIndexes[x]].set(PetalTransform);

        this.mods[petalIndexes[x]].setOpacity(1);
    }
  }


  return Polyhedron;

});
