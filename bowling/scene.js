(function () {
    window.Scene = function (gl, options) {

        options = options || {};
        var colors = [
                    [0.9, 0.9, 0.9],
                    [0.0, 0.0, 1.0],
                    [1.0, 0.0, 0.0],
                    [0.0, 1.0, 0.0],
                    [1.0, 0.0, 1.0],
                    [0.0, 0.0, 0.0]];

        var colorArray = [];
        for (var i = 0; i < 6; i++){
            for (var j = 0; j < 6; j++) {
                colorArray.push(colors[i][0]);
                colorArray.push(colors[i][1]);
                colorArray.push(colors[i][2]);
            }
        }

        var side1 = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: 1.2, y: 1.5, z: 0.0},
                                           scale: {x: 0.2, y: 3.0, z: 1.0},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.55, g: 0.5, b: 0.45},
                                          });

         var side2 = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: -1.2, y: 1.5, z: 0.0},
                                           scale: {x: 0.2, y: 3.0, z: 1.0},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.55, g: 0.5, b: 0.45},
                                          });

        var alley = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: 0.0, y: -0.1, z: -62.0},
                                           scale: {x: 3.0, y: 0.1, z: 52.0},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.3, g: 0.2, b: 0.1},
                                           shininess: 4,
                                           children: [side1, side2]
                                          });

        var endRight = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: 3.6, y: 2.6, z: -111.0},
                                           scale: {x: 0.6, y: 2.8, z: 4.0},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.55, g: 0.5, b: 0.45},
                                          });

        var endLeft = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: -3.6, y: 2.6, z: -111.0},
                                           scale: {x: 0.6, y: 2.8, z: 4.0},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.55, g: 0.5, b: 0.45},
                                          });

        var endTop = window.Shapes.cube(gl, {mode: TRIANGLES,
                                           translate: {x: 0.0, y: 5.0, z: -111.0},
                                           scale: {x: 4.3, y: 0.5, z: 4.2},
                                           rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                           color: {r: 0.55, g: 0.5, b: 0.45},
                                          });



        var getPin = function (trans) {

          var pin = window.Shapes.lathe(gl, {mode: TRIANGLES,
                                             normalType: NORMAL,
                                             path: [[0.0, 0.43],
                                                    [0.03, 0.425],
                                                    [0.065, 0.40],
                                                    [0.095, 0.35],
                                                    [0.104, 0.30],
                                                    [0.10, 0.25],
                                                    [0.09, 0.20],
                                                    [0.075, 0.15],
                                                    [0.071, 0.12],
                                                    [0.075, 0.09],
                                                    [0.09, 0.05],
                                                    [0.117, 0.0],
                                                    [0.145, -0.06],
                                                    [0.17, -0.12],
                                                    [0.18, -0.17],
                                                    [0.183, -0.23],
                                                    [0.18, -0.28],
                                                    [0.17, -0.34],
                                                    [0.15, -0.44],
                                                    [0.135, -0.50],
                                                    [0.12, -0.55],
                                                    [0.10, -0.60],
                                                    [0.0, -0.60]],
                                             translate: trans,
                                             rotate: {angle: 0.0, x: 1.0, y: 0.0, z: 1.0},
                                             scale: {x: 0.8, y: 0.9, z: 0.8},
                                             color: {r: 0.98, g: 0.98, b: 0.98},
                                             shininess: 20.0
                                            });
          return pin;
        };

        var pinArray = [];
        var x;
        var y = 1.1;
        var z = -106;

        for (var i = 0; i < 4; i++) {
          x = -1.4;
          x = x - (i * 0.7)
          for (var j = 0; j < i + 1; j++) {
            x += 1.4;
            pinArray.push(getPin({x: x, y: y, z: z}));
          }

          z -= 1.0;
        }

        var pins = new Shape(gl, {children: pinArray});

        var ball1 = window.Shapes.sphere(gl, {mode: TRIANGLES,
                                               normalType: VERTEX_NORMAL,
                                               translate: {x: 3.6, y: 0.9, z: -11.0},
                                               scale: {x: 0.4, y: 0.4, z: 0.4},
                                               color: {r: 0.5, g: 0.05, b: 0.05},
                                               rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                               shininess: 30.0
                                               });
        var ball2 = window.Shapes.sphere(gl, {mode: TRIANGLES,
                                               normalType: VERTEX_NORMAL,
                                               translate: {x: 3.6, y: 0.9, z: -13.0},
                                               scale: {x: 0.4, y: 0.4, z: 0.4},
                                               color: {r: 0.5, g: 0.5, b: 0.05},
                                               rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                               shininess: 30.0
                                               });
        var ball3 = window.Shapes.sphere(gl, {mode: TRIANGLES,
                                               normalType: VERTEX_NORMAL,
                                               translate: {x: 3.6, y: 0.9, z: -15.0},
                                               scale: {x: 0.4, y: 0.4, z: 0.4},
                                               color: {r: 0.5, g: 0.05, b: 0.5},
                                               rotate: {angle: 0.0, x: 0.0, y: 1.0, z: 0.0},
                                               shininess: 30.0
                                               });
        options.children = [alley, endTop, endLeft, endRight, ball1, ball2, ball3, pins];
        var scene = new Shape(gl, options);
        return scene;
    };

})();
