/*
 * This JavaScript file defines a Shape object and associated functions.
 * The object itself is returned as the result of a function, allowing us
 * to encapsulate its code and module variables.
 *
 * This module's approach is non-destructive: methods always return new
 * Shape objects, and never modify the operands.  This is a design choice.
 *
 * This object is dependent on a gl context object and methods in glsl-utilities.js.
 */

var LINES = 1;
var TRIANGLES = 4;
var NORMAL = 0;
var VERTEX_NORMAL = 1;

var Shape = (function () {

    // Define the constructor.
    var shape = function (gl, options) {

        options = options || {};
        this.nothingToDraw = true;
        if (options.vertices && options.indices) {
            this.nothingToDraw = false;
        }
        this.vertices = options.vertices || [];
        this.indices = options.indices || [];
        this.normalType = options.normalType || NORMAL;
        this.normalArray =  options.normalArray || [];
        this.rotate = options.rotate || {angle: 0.0, x: 0.0, y: 1.0, z: 0.0};
        this.translate = options.translate || {x: 0.0, y: 0.0, z: 0.0};
        this.scale = options.scale || {x: 1.0, y: 1.0, z: 1.0};
        this.mode = options.mode || TRIANGLES;
        this.children = options.children || [];
        this.vertexArray = [];
        this.colorArray = options.colors || [];
        this.color = options.color || {r: 0.5, g: 0.5, b: 0.5};
        this.specularColorArray = options.specularColorArray || [];
        this.specularColor = options.specularColor || { r: 1.0, g: 1.0, b: 1.0 },
        this.shininess = options.shininess || 2.0;
        this.update();            //To do: refactor this function to update 
                                    //       stored gl data if shape data is changed
        this.buffer = GLSLUtilities.initVertexBuffer(gl, this.vertexArray);
        this.colorBuffer = GLSLUtilities.initVertexBuffer(gl, this.colorArray);
        this.specularBuffer = GLSLUtilities.initVertexBuffer(gl,
                this.specularColorArray);
        this.normalBuffer = GLSLUtilities.initVertexBuffer(gl,
                this.normalArray);

    },

    /*
     * Utility function for turning indexed vertices into a "raw" coordinate array
     * arranged as triangles.
     */

    toRawArray = function (s) {
        if (s.nothingToDraw) {
            return [];
        }
        if (s.mode == TRIANGLES) {
            return toRawTriangleArray(s);
        }
        else {
            return toRawLineArray(s);
        }
    },

    toRawTriangleArray = function (s) {
        var result = [],
            i,
            j,
            maxi,
            maxj;

        for (i = 0, maxi = s.indices.length; i < maxi; i += 1) {
            for (j = 0, maxj = s.indices[i].length; j < maxj; j += 1) {
                result = result.concat(
                    s.vertices[
                        s.indices[i][j]
                    ]
                );
            }
        }

        return result;
    },

    /*
     * Utility function for turning indexed vertices into a "raw" coordinate array
     * arranged as line segments.
     */
    toRawLineArray = function (s) {
        var result = [],
            i,
            j,
            maxi,
            maxj;

        for (i = 0, maxi = s.indices.length; i < maxi; i += 1) {
            for (j = 0, maxj = s.indices[i].length; j < maxj; j += 1) {
                result = result.concat(
                    s.vertices[
                        s.indices[i][j]
                    ],

                    s.vertices[
                        s.indices[i][(j + 1) % maxj]
                    ]
                );
            }
        }

        return result;
    },

    toNormalArray = function (s) {
        var result = [],
            i,
            j,
            maxi,
            maxj,
            p0,
            p1,
            p2,
            v0,
            v1,
            v2,
            normal;

        // For each face...
        for (i = 0, maxi = s.indices.length; i < maxi; i += 1) {
            // We form vectors from the first and second then second and third vertices.
            p0 = s.vertices[s.indices[i][0]];
            p1 = s.vertices[s.indices[i][1]];
            p2 = s.vertices[s.indices[i][2]];

            // Technically, the first value is not a vector, but v can stand for vertex
            // anyway, so...
            v0 = new Vector(p0[0], p0[1], p0[2]);
            v1 = new Vector(p1[0], p1[1], p1[2]).subtract(v0);
            v2 = new Vector(p2[0], p2[1], p2[2]).subtract(v0);
            normal = v1.cross(v2).unit();

            // We then use this same normal for every vertex in this face.
            for (j = 0, maxj = s.indices[i].length; j < maxj; j += 1) {
                result = result.concat(
                    [ normal.x(), normal.y(), normal.z() ]
                );
            }
        }

        return result;
    },

    /*
     * Another utility function for computing normals, this time just converting
     * every vertex into its unit vector version.  This works mainly for objects
     * that are centered around the origin.
     */
    toVertexNormalArray = function (s) {
        var result = [],
            i,
            j,
            maxi,
            maxj,
            p,
            normal;

        // For each face...
        for (i = 0, maxi = s.indices.length; i < maxi; i += 1) {
            // For each vertex in that face...
            for (j = 0, maxj = s.indices[i].length; j < maxj; j += 1) {
                p = s.vertices[s.indices[i][j]];
                
                normal = new Vector(p[0], p[1], p[2]).unit();
                result = result.concat(
                    [ normal.x(), normal.y(), normal.z() ]
                );
            }
        }

        return result;
    };

    shape.prototype.update = function () {

        this.vertexArray = toRawArray(this);

        if (this.normalType == NORMAL) {
            this.normalArray = toNormalArray(this);
        }
        else {
            this.normalArray = toVertexNormalArray(this);
        }

        if (this.colorArray.length == 0) {
            for (j = 0, maxj = this.vertexArray.length / 3;
                    j < maxj; j += 1) { 
                this.colorArray = this.colorArray.concat(
                    this.color.r,
                    this.color.g,
                    this.color.b
                );
            }
        }

        if (this.specularColorArray.length == 0) {
            for (j = 0, maxj = this.vertexArray.length / 3;
                    j < maxj; j += 1) { 
                this.specularColorArray = this.specularColorArray.concat(
                    this.specularColor.r,
                    this.specularColor.g,
                    this.specularColor.b
                );
            }
        }

    };
    

    shape.prototype.draw = function (gl, vertexPosition, vertexDiffuseColor, vertexSpecularColor, 
                                        normalVector, shininess, modelMatrix, parentTransform) {

        parentTransform = parentTransform || new Matrix();

        var translationMatrix = new Matrix({translate: this.translate}),
            rotationMatrix = new Matrix({rotate: this.rotate}),
            scaleMatrix = new Matrix({scale: this.scale});

        var thisModel = parentTransform.multiply(translationMatrix.multiply(rotationMatrix.multiply(
                        scaleMatrix)));

        if (!this.nothingToDraw) {
            // Set the varying colors.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
            gl.vertexAttribPointer(vertexDiffuseColor, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.specularBuffer);
            gl.vertexAttribPointer(vertexSpecularColor, 3, gl.FLOAT, false, 0, 0);

            // Set the shininess.
            gl.uniform1f(shininess, this.shininess);

            gl.uniformMatrix4fv(modelMatrix, gl.FALSE, new Float32Array( thisModel.sendToGl() ));

            // Set the varying normal vectors.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(normalVector, 3, gl.FLOAT, false, 0, 0);

            // Set the varying vertex coordinates.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(this.mode, 0, this.vertexArray.length / 3);
        }
        this.children.forEach( function(child) {
            child.draw(gl, vertexPosition, vertexDiffuseColor, vertexSpecularColor, 
                            normalVector, shininess, modelMatrix, thisModel)
        });
    };


    return shape;
})();
