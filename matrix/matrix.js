/*
 * This JavaScript file defines a Matrix object and associated functions.
 * The object itself is returned as the result of a function, allowing us
 * to encapsulate its code and module variables.
 *
 * This module's approach is non-destructive: methods always return new
 * Matrix objects, and never modify the operands.  This is a design choice.
 *
 * This module is designed for matrices of any number of dimensions.  The
 * implementations are generalized but not optimal for certain sizes of
 * matrices pertaining to 3D graphics.
 */
var Matrix = (function () {
    // Define the constructor.
    var matrix = function (options) {

        options = options || {rows:4, columns:4};

        var r = options.rows,
            c = options.columns;

        this.elements = (function () {
            if (options.elements) {
                var elements = options.elements;
                return elements;
            }
            else if (options.translate) {
                return getTranslateMatrix(options.translate);
            }
            else if (options.rotate) {
                return getRotationMatrix(options.rotate);
            }
            else if (options.scale) {
                return getScaleMatrix(options.scale);
            }
            else if (options.ortho) {
                return getOrthoMatrix(options.ortho);
            }
            else if (options.perspective) {
                return getPerspectiveMatrix(options.perspective);
            }
            else {
                var elements = [];
                for (var i = 0; i < r; i++) {
                    elements[i] = [];
                    for (var j = 0; j < c; j++) {
                        elements[i][j] = (j == i) ? 1 : 0;
                    }
                }
                return elements;
            }
        })();
    },
    
    // A private method for checking dimensions,
    // throwing an exception when different.

    checkSameDimensions = function (m1, m2) {
        if (m1.rows() !== m2.rows() || m1.columns() !== m2.columns()) {
            throw "Matrices have different dimensions";
        }
    },

    checkAltDimensions = function (m1, m2) {
        if (m1.columns() !== m2.rows()) {
            throw "Matrices have different dimensions and cannot be multiplied";
        }
    },

    // Private methods for constructing unique graphics matrices
    getTranslateMatrix = function (translate) {
        return  [[1.0, 0.0, 0.0, translate.x],
                 [0.0, 1.0, 0.0, translate.y],
                 [0.0, 0.0, 1.0, translate.z],
                 [0.0, 0.0, 0.0, 1.0]];
    },

    getScaleMatrix = function (scale) {
        return  [[scale.x, 0.0, 0.0, 0.0],
                 [0.0, scale.y, 0.0, 0.0],
                 [0.0, 0.0, scale.z, 0.0],
                 [0.0, 0.0, 0.0, 1.0]];
    },

    getRotationMatrix = function (rotate) {
        var angle = rotate.angle,
            x = rotate.x,
            y = rotate.y,
            z = rotate.z;

        var axisLength = Math.sqrt((x * x) + (y * y) + (z * z)),
                s = Math.sin(angle * Math.PI / 180.0),
                c = Math.cos(angle * Math.PI / 180.0),
                oneMinusC = 1.0 - c,

                // We can't calculate this until we have normalized
                // the axis vector of rotation.
                x2, // "2" for "squared."
                y2,
                z2,
                xy,
                yz,
                xz,
                xs,
                ys,
                zs;

            // Normalize the axis vector of rotation.
            x /= axisLength;
            y /= axisLength;
            z /= axisLength;

            // *Now* we can calculate the other terms.
            x2 = x * x;
            y2 = y * y;
            z2 = z * z;
            xy = x * y;
            yz = y * z;
            xz = x * z;
            xs = x * s;
            ys = y * s;
            zs = z * s;

            return [
                [(x2 * oneMinusC) + c, (xy * oneMinusC) - zs,
                    (xz * oneMinusC) + ys, 0.0],
                [(xy * oneMinusC) + zs, (y2 * oneMinusC) + c,
                    (yz * oneMinusC) - xs, 0.0],
                [(xz * oneMinusC) - ys, (yz * oneMinusC) + xs,
                    (z2 * oneMinusC) + c, 0.0],
                [0.0, 0.0, 0.0, 1.0]
            ];
    },

    getOrthoMatrix = function (ortho) {

        var width = ortho.r - ortho.l,
            height = ortho.t - ortho.b,
            depth = ortho.f - ortho.n;

        return  [[2.0/width, 0.0, 0.0, -(ortho.r + ortho.l)/width],
                 [0.0, 2.0/height, 0.0, -(ortho.t + ortho.b)/height],
                 [0.0, 0.0, -2.0/depth, -(ortho.f + ortho.n)/depth],
                 [0.0, 0.0, 0.0, 1.0]];
    },

    getPerspectiveMatrix = function (proj) {
        
        var width = proj.r - proj.l,
            height = proj.t - proj.b,
            depth = proj.f - proj.n;

        return  [[2.0 * proj.n / width, 0.0, (proj.r + proj.l)/width, 0.0],
                 [0.0, 2.0 * proj.n / height, (proj.t + proj.b)/height, 0.0],
                 [0.0, 0.0, -(proj.f + proj.n)/depth, -2.0 * proj.n * proj.f / depth],
                 [0.0, 0.0, -1.0, 0.0]];
    };



    // Basic methods.
    matrix.prototype.rows = function () {
        return this.elements.length;
    };

    matrix.prototype.columns = function () {
        return this.elements[0].length;
    };

    // Addition and subtraction.
    matrix.prototype.add = function (m) {
        var result = new Matrix({rows: this.rows(), columns: this.columns()}),
            maxRows,
            maxColumns;

        // Dimensionality check.
        checkSameDimensions(this, m);

        for (i = 0, maxRows = this.rows(); i < maxRows; i++) {
            for (var j = 0, maxColumns = this.columns(); j < maxColumns; j++) {
                result.elements[i][j] = this.elements[i][j] + m.elements[i][j];
            }
        }

        return result;
    };

    matrix.prototype.subtract = function (m) {
        var result = new Matrix({rows: this.rows(), columns: this.columns()}),
            maxRows,
            maxColumns;

        // Dimensionality check.
        checkSameDimensions(this, m);

        for (i = 0, maxRows = this.rows(); i < maxRows; i++) {
            for (var j = 0, maxColumns = this.columns(); j < maxColumns; j++) {
                result.elements[i][j] = this.elements[i][j] - m.elements[i][j];
            }
        }

        return result;
    };

    // Matrix multiplication
    matrix.prototype.multiply = function (m) {
        var result = new Matrix({rows: this.rows(), columns: m.columns()}),
            maxRows,
            maxColumns,
            maxMults,
            x;

        // Dimensionality check.
        checkAltDimensions(this, m);

        for (i = 0, maxRows = this.rows(); i < maxRows; i++) {
            for (j = 0, maxColumns = m.columns(); j < maxColumns; j++) {
                x = 0;
                for (k = 0, maxMults = this.columns(); k < maxMults; k++) {
                    x += this.elements[i][k] * m.elements[k][j];
                }
                result.elements[i][j] = x;
            }
        }

        return result;
    };

    // Method used to set up graphics matrix into gl column-first format
    matrix.prototype.sendToGl = function () {

        var result = [],
            maxRows,
            maxColumns;


        for (i = 0, maxColumns = this.columns(); i < maxColumns; i++) {
            for (j = 0, maxRows = this.rows(); j < maxRows; j++) {
                result.push(this.elements[j][i]);
            }
        }

        return result;
    };

    return matrix;
})();