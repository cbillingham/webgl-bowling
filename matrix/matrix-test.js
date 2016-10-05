/*
 * Unit tests for our matrix object.
 */
$(function () {

    // This suite checks instantiation basics.
    test("Creation and Data Access", function () {
        var m = new Matrix(),
            m1 =  new Matrix({rows: 6, columns: 9}),
            m2 =  new Matrix({elements:
                                [[0,1,2,3],
                                 [4,5,6,7]]});

        equal(m.rows(), 4, "Matrix row size check 1");
        equal(m.columns(), 4, "Matrix column size check 1");
        equal(m1.rows(), 6, "Matrix row size check 2");
        equal(m1.columns(), 9, "Matrix column size check 2");
        equal(m2.rows(), 2, "Matrix row size check 3");
        equal(m2.columns(), 4, "Matrix column size check 3");
        equal(m.elements[0][0], 1, "Matrix element access check 1");
        equal(m.elements[2][0], 0, "Matrix element access check 2");
        equal(m.elements[3][3], 1, "Matrix element access check 3");
        equal(m2.elements[0][0], 0, "Matrix element access check 4");
        equal(m2.elements[1][0], 4, "Matrix element access check 5");
        equal(m2.elements[1][3], 7, "Matrix element access check 6");

    });

    test("Addition and Subtraction", function () {

        var m = new Matrix(),
            m1 =  new Matrix({rows: 6, columns: 9}),
            m2 =  new Matrix({elements: 
                                [[0,0,0,0],
                                 [0,0,0,0],
                                 [0,0,0,0],
                                 [0,0,0,0]]});

        m3 = m2.add(m);

        equal(m3.rows(), 4, "Check to make sure result is same dimensions");
        equal(m3.columns(), 4, "Check to make sure result is same dimensions");
        equal(m3.elements[0][0], 1, "Matrix addition check 1");
        equal(m3.elements[2][0], 0, "Matrix addition check 2");
        equal(m3.elements[3][3], 1, "Matrix addition check 3");

        m3 = m3.add(m);

        equal(m3.elements[0][0], 2, "Matrix second addition check 1");
        equal(m3.elements[3][1], 0, "Matrix second addition check 2");
        equal(m3.elements[2][2], 2, "Matrix second addition check 3");

        m4 = m2.subtract(m).subtract(m);

        equal(m4.elements[0][0], -2, "Matrix subtraction check 1");
        equal(m4.elements[2][0], 0, "Matrix subtraction check 2");
        equal(m4.elements[3][3], -2, "Matrix subtraction check 3");

        // We can actually check for a *specific* exception, but
        // we won't go that far for now.
        throws(
            function () {
                return m.add(m1);
            },
            "Check for matrices of different sizes"
        );
    });

    test("Multiplication", function () {

        var m = new Matrix(),
            m1 =  new Matrix({rows: 6, columns: 9}),
            m2 =  new Matrix({elements: 
                                [[0,0,0,0],
                                 [0,0,0,0],
                                 [0,0,0,0],
                                 [0,0,0,0]]}),
            m3 = new Matrix({elements:
                                [[0,1,2,3],
                                 [4,5,6,7]]});

        // We can actually check for a *specific* exception, but
        // we won't go that far for now.
        throws(
            function () {
                return m.multiply(m1);
            },
            "Check for matrices of different sizes"
        );

        m4 = m.multiply(m2);

        equal(m4.rows(), 4, "Check to make sure result is correct dimension");
        equal(m4.columns(), 4, "Check to make sure result is correct dimensions");
        equal(m4.elements[0][0], 0, "Matrix multiply check 1");
        equal(m4.elements[2][0], 0, "Matrix multiply check 2");
        equal(m4.elements[3][3], 0, "Matrix multiply check 3");

        m4 = m3.multiply(m);

        equal(m4.rows(), 2, "Check to make sure result is correct dimension");
        equal(m4.columns(), 4, "Check to make sure result is correct dimensions");
        equal(m4.elements[0][0], 0, "Matrix multiply check 1");
        equal(m4.elements[0][1], 1, "Matrix multiply check 2");
        equal(m4.elements[0][2], 2, "Matrix multiplycheck 3");

    });

    test("Send to GL", function () {

        m = new Matrix({elements:
                                [[0,1,2,3],
                                 [4,5,6,7]]});

        x = m.sendToGl();

        equal(x.length, 8, "Check length of resulting array");
        equal(x[0], 0, "Matrix gl test reordering 1");
        equal(x[1], 4, "Matrix gl test reordering 2");
        equal(x[2], 1, "Matrix gl test reordering 3");
        equal(x[6], 3, "Matrix gl test reordering 4");

    });

    //TO DO: make test suite for testing graphic specific matrix constructors

});