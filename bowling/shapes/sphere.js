(function () {

    window.Shapes = window.Shapes || {};  
    window.Shapes.sphere = function (gl, options) {

        options = options || {};

        radius = options.radius || 0.5;
        latBands = options.latBands || 15;
        longBands = options.longBands || 15;

        var verts = [];

        //Function for generating sphere vertices and indices
        //Modified from LearningWebGL --> http://learningwebgl.com/blog/?p=1253
        for (var latNumber = 0; latNumber <= latBands; latNumber++) {
          var theta = latNumber * Math.PI / latBands;
          var sinTheta = Math.sin(theta);
          var cosTheta = Math.cos(theta);

          for (var longNumber = 0; longNumber <= longBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longBands);
            var v = 1 - (latNumber / latBands);

            verts.push([radius * x, radius * y, radius * z]);
          }
        }

        var i = [];

        for (var latNumber = 0; latNumber < latBands; latNumber++) {
          for (var longNumber = 0; longNumber < longBands; longNumber++) {
            var first = (latNumber * (longBands + 1)) + longNumber;
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
