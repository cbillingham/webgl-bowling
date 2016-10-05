/*
 * Unit tests for our shape object.
 */
$(function () {

    var gl = GLSLUtilities.getGL(window.canvas);
    if (!gl) {
        alert("No WebGL context found...sorry.");

        // No WebGL, no use going on...
        return;
    }

    // This suite checks instantiation basics.
    test("Creation and Data Access", function () {
        var s = new Shape(gl),
            s1 = window.Shapes.icosahedron(gl),
            s2 = window.Shapes.cube(gl, {mode: TRIANGLES,
                                         color: {r: 1.0, g: 0.5, b: 0.0},
                                         translate: {x: 1, z: 1, y: 1},
                                         rotate: {angle: 60, x: 1, z: 1, y: 1},
                                         scale: {x: 0.5, z: 0.5, y: 0.5}
                                        });

        equal(s.nothingToDraw, true, "Test generic empty node shape");
        equal(s.mode, TRIANGLES, "Test default mode");
        equal(s.translate.x, 0, "Test default translate");
        equal(s.rotate.angle, 0, "Test default rotate");
        equal(s.rotate.y, 1, "Test default rotate");
        equal(s.scale.z, 1, "Test default scale");
        equal(s.color.r, 0.5, "Test default color");
        equal(s.children.length, 0, "Test default children");

        s = new Shape(gl, {children: [s1, s2]});

        equal(s.children.length, 2, "Test adding children");
        equal(s.children[0].nothingToDraw, false, "Test shape with draw data");
        equal(s.children[0].vertices[1][0], 0.525731112119133606, "Check vertices");
        equal(s.children[0].indices[0][1], 4, "Check indices");
        equal(s.children[1].mode, TRIANGLES, "Check user-defined mode");
        equal(s.children[1].color.r, 1.0, "Check user-defined color");
        equal(s.children[1].scale.x, 0.5, "Check user-defined scale");
        equal(s.children[1].rotate.angle, 60, "Check user-defined rotate");
        equal(s.children[1].translate.y, 1, "Check user-defined translate");

    });

    test("Converting vertices and indices to raw array", function () {
        var s1 = window.Shapes.icosahedron(gl),
            s2 = window.Shapes.cube(gl, {mode: TRIANGLES,
                                         color: {r: 1.0, g: 0.5, b: 0.0},
                                         translate: {x: 1, z: 1, y: 1},
                                         rotate: {angle: 60, x: 1, z: 1, y: 1},
                                         scale: {x: 0.5, z: 0.5, y: 0.5}
                                        });

        equal(s1.vertexArray[0], 0.525731112119133606, "Test raw vertex array conversion 1");
        equal(s1.vertexArray[10], 0.8506508083520399, "Test raw vertex array conversion 2");
        equal(s1.vertexArray[64], 0.5257311121191336, "Test raw vertex array conversion 3");
        equal(s1.colorArray[0], 0.5, "Test raw color array conversion 1");
        equal(s2.colorArray[22], 0.5, "Test raw color array conversion 2");
        equal(s2.colorArray[65], 0.0, "Test raw color array conversion 3");

    });

});