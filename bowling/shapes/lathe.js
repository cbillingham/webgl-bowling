(function () {

    window.Shapes = window.Shapes || {};  
    window.Shapes.lathe = function (gl, options) {

        options = options || {};

        longBands = options.longBands || 25;

        path = options.path || [];

        var verts = [];

        //Function for generating sphere vertices and indices
        //Modified from LearningWebGL --> http://learningwebgl.com/blog/?p=1253
        for (var currentPoint = 0; currentPoint < path.length; currentPoint++) {
          var y = path[currentPoint][1];

          for (var longNumber = 0; longNumber <= longBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);
            var radius = path[currentPoint][0];

            var x = radius * cosPhi;
            var z = radius * sinPhi;
            var u = 1 - (longNumber / longBands);
            var v = 1 - (currentPoint / currentPoint);

            verts.push([x, y, z]);
          }
        }

        var i = [];

        for (var currentPoint = 0; currentPoint < path.length - 1; currentPoint++) {
          for (var longNumber = 0; longNumber < longBands; longNumber++) {
            var first = (currentPoint * (longBands + 1)) + longNumber;
            var second = first + longBands + 1;
            i.push([first, second, first + 1]);
            i.push([second, second + 1, first + 1]);
          }
        }

        options.indices = i;
        options.vertices = verts;
        return new Shape(gl, options);
    };


})();
