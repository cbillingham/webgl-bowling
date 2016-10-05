/*
 * For maximum modularity, we place everything within a single function that
 * takes the canvas that it will need.
 */
(function (canvas) {

    // Because many of these variables are best initialized then immediately
    // used in context, we merely name them here.  Read on to see how they
    // are used.
    var gl, // The WebGL context.

        // The shader program to use.
        shaderProgram,

        // Utility variable indicating whether some fatal has occurred.
        abort = false,

        // Important state variables.  Yep, they are growing!
        modelMatrix,
        viewMatrix,
        xRotationMatrix,
        yRotationMatrix,
        projectionMatrix,
        vertexPosition,
        vertexDiffuseColor,
        vertexSpecularColor,
        shininess,

        // Camera variables
        // Free-form camera, no lookAt function here. Wanted to implement
        // a first person shooter type camera where the user input allows for
        // camera rotation and movement (To Do: implement lookAt and allow for user to change modes)

        camera = {position: [0.0, 3.0, 1.0],
                  pitch: -2.0,
                  yaw: 0.0,
                  roll: 0.0
                  },

        // For emphasis, we separate the variables that involve lighting.
        normalVector,
        lightPosition,
        lightDiffuse,
        lightSpecular,
        globalLight,

        // An individual "draw object" function.
        drawObject,

        // The big "draw scene" function.
        drawScene,

        // Transient state variables for event handling.
        xDragStart,
        yDragStart,
        xRotationStart,
        yRotationStart,

        // Reusable loop variables.
        i,
        maxi,
        j,
        maxj;



    // Grab the WebGL rendering context.
    gl = GLSLUtilities.getGL(canvas);
    if (!gl) {
        alert("No WebGL context found...sorry.");

        // No WebGL, no use going on...
        return;
    }

    // Set up settings that will not change.  This is not "canned" into a
    // utility function because these settings really can vary from program
    // to program.
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Build the objects to display.
    var scene = window.Scene(gl);

    // Initialize the shaders.
    shaderProgram = GLSLUtilities.initSimpleShaderProgram(
        gl,
        $("#vertex-shader").text(),
        $("#fragment-shader").text(),

        // Very cursory error-checking here...
        function (shader) {
            abort = true;
            alert("Shader problem: " + gl.getShaderInfoLog(shader));
        },

        // Another simplistic error check: we don't even access the faulty
        // shader program.
        function (shaderProgram) {
            abort = true;
            alert("Could not link shaders...sorry.");
        }
    );

    // If the abort variable is true here, we can't continue.
    if (abort) {
        alert("Fatal errors encountered; we cannot continue.");
        return;
    }

    // All done --- tell WebGL to use the shader program from now on.
    gl.useProgram(shaderProgram);

    // Hold on to the important variables within the shaders.
    vertexPosition = gl.getAttribLocation(shaderProgram, "vertexPosition");
    gl.enableVertexAttribArray(vertexPosition);
    vertexDiffuseColor = gl.getAttribLocation(shaderProgram, "vertexDiffuseColor");
    gl.enableVertexAttribArray(vertexDiffuseColor);
    vertexSpecularColor = gl.getAttribLocation(shaderProgram, "vertexSpecularColor");
    gl.enableVertexAttribArray(vertexSpecularColor);
    normalVector = gl.getAttribLocation(shaderProgram, "normalVector");
    gl.enableVertexAttribArray(normalVector);

    // Finally, we come to the typical setup for transformation matrices:
    // model-view and projection, managed separately.
    modelMatrix = gl.getUniformLocation(shaderProgram, "modelMatrix");
    cameraTranslateMatrix = gl.getUniformLocation(shaderProgram, "cameraTranslateMatrix");
    cameraPitchMatrix = gl.getUniformLocation(shaderProgram, "cameraPitchMatrix");
    cameraYawMatrix = gl.getUniformLocation(shaderProgram, "cameraYawMatrix");
    cameraRollMatrix = gl.getUniformLocation(shaderProgram, "cameraRollMatrix");
    projectionMatrix = gl.getUniformLocation(shaderProgram, "projectionMatrix");

    // Note the additional variables.
    lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
    lightDiffuse = gl.getUniformLocation(shaderProgram, "lightDiffuse");
    lightSpecular = gl.getUniformLocation(shaderProgram, "lightSpecular");
    shininess = gl.getUniformLocation(shaderProgram, "shininess");
    globalLight = gl.getUniformLocation(shaderProgram, "globalLight");

    /*
     * Displays the scene.
     */
    window.drawScene = function () {
        // Clear the display.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        //Set the viewMatrix
        // JD: Raw camera appreciated here, but note it is mathematically equivalent to lookAt.
        //     You just need to convert the yaw, pitch, and roll angles into the vertex toward
        //     which the camera is "looking" (i.e., the 4th to 6th parameters). Once you figure
        //     out that conversion (straightforward but satisfying if you are able to work it
        //     out yourself), then you're done.
        var camTranslate = new Matrix({translate: {x: -camera.position[0],y: -camera.position[1],z: -camera.position[2]}});
        var camYaw = new Matrix({rotate: {angle: -camera.yaw, x: 0.0, y: 1.0, z: 0.0}});
        var camPitch = new Matrix({rotate: {angle: -camera.pitch, x: 1.0, y: 0.0, z: 0.0}});
        var camRoll = new Matrix({rotate: {angle: -camera.roll, x: 0.0, y: 0.0, z: 1.0}});
        gl.uniformMatrix4fv(cameraTranslateMatrix, gl.FALSE, new Float32Array(
                camTranslate.sendToGl()
        ));
        gl.uniformMatrix4fv(cameraPitchMatrix, gl.FALSE, new Float32Array(
                camPitch.sendToGl()
        ));
        gl.uniformMatrix4fv(cameraYawMatrix, gl.FALSE, new Float32Array(
                camYaw.sendToGl()
        ));
        gl.uniformMatrix4fv(cameraRollMatrix, gl.FALSE, new Float32Array(
                camRoll.sendToGl()
        ));

        // Display the objects.
        scene.draw(gl, vertexPosition, vertexDiffuseColor, vertexSpecularColor, normalVector,
                    shininess, modelMatrix);

        // All done.
        gl.flush();
    };

    /*
     * Performs rotation calculations.
     */
    rotateScene = function (event) {
        camera.pitch = yRotationStart + ( -yDragStart + event.clientY)/20;
        camera.yaw = xRotationStart + ( -xDragStart + event.clientX)/20;
        window.drawScene();
    };

    toRad = function (deg) {
        return (Math.PI * deg / 180);
    }

    var proj = new Matrix({perspective: {l: -2 * (canvas.width / canvas.height),
            r: 2 * (canvas.width / canvas.height), b: -2, t: 2, n: 6, f: 200} });
    gl.uniformMatrix4fv(projectionMatrix, gl.FALSE, new Float32Array( proj.sendToGl() ));


    gl.uniform4fv(lightPosition, [500.0, 500.0, 100.0, 1.0]);
    gl.uniform3fv(lightDiffuse, [1.0, 1.0, 1.0]);
    gl.uniform3fv(lightSpecular, [1.0, 1.0, 1.0]);
    gl.uniform3fv(globalLight, [0.2, 0.2, 0.2]);

    //Animation - set up keyframes
    sprites = [
        {
            obj: scene.children[4], //ball1 - Note: there must be a better way to do this
            keyframes: [
                {
                    frame: 0, //currentState {x: 3.6, y: 0.9, z: -11.0}
                    tx: scene.children[4].translate.x,
                    ty: scene.children[4].translate.y,
                    tz: scene.children[4].translate.z,
                    ease: KeyframeTweener.quadEaseInOut
                    
                },

                {
                    frame: 72,
                    tx: 0.01,
                    ty: 4.0,
                    tz: -7.0,
                    ease: KeyframeTweener.quadEaseInOut
                    
                },

                {
                    frame: 100,
                    tx: 0.01,
                    ty: 3.0,
                    tz: -5.0,
                    rx: 0.0,
                    ry: 1.0,
                    rz: 0.0,
                    rotate: 0.0,
                    ease: KeyframeTweener.quadEaseout
                    
                },

                {
                    frame: 110,
                    tx: 0.01,
                    ty: 1.0,
                    tz: -8.0,
                    rx: 0.0,
                    ry: 1.0,
                    rz: 0.0,
                    rotate: 90.0,
                    ease: KeyframeTweener.quadEaseInOut
                    
                },

                {
                    frame: 118,
                    tx: 0.01,
                    ty: 0.4,
                    tz: -16.0,
                    rx: 1.0,
                    ry: 1.0,
                    rz: 0.0,
                    rotate: 720.0,
                    ease: KeyframeTweener.quadEaseInOut
                    
                },

                {
                    frame: 200,
                    tx: 0.01,
                    ty: 0.4,
                    tz: -108.0,
                    ry: 1.0,
                    rx: 1.0,
                    rz: 0.0,
                    rotate: 36000.0,
                    ease: KeyframeTweener.linear
                    
                },

                {
                    frame: 220,
                    tx: -1.1,
                    ty: 0.4,
                    tz: -112.0,
                    rx: 0.0,
                    ry: 1.0,
                    rz: 0.0,
                    rotate: 3400.0,
                    ease: KeyframeTweener.quadEaseIn
                },

                {
                    frame: 230,
                    tx: -2.3,
                    ty: 0.4,
                    tz: -112.0,
                    rx: 0.0,
                    ry: 1.0,
                    rz: 0.0,
                    rotate: 3200.0,
                    ease: KeyframeTweener.quadEaseIn
                },
            ]
        },
    ];

    for (var i = 0; i < scene.children[7].children.length; i++) {
        var startFrame;
        if (i > 5) {
            startFrame = 205;
        }
        else if (i > 2) {
            startFrame = 203;
        }
        else if (i > 0) {
            startFrame = 201;
        }
        else {
            startFrame = 199;
        }

        var sprite = {

            obj: scene.children[7].children[i], //pin1
            keyframes: [
                {
                    frame: 0, 
                    tx: scene.children[7].children[i].translate.x,
                    ty: scene.children[7].children[i].translate.y,
                    tz: scene.children[7].children[i].translate.z,
                    ease: KeyframeTweener.quadEaseIn
                    
                },

                {
                    frame: startFrame, 
                    tx: scene.children[7].children[i].translate.x,
                    ty: scene.children[7].children[i].translate.y,
                    tz: scene.children[7].children[i].translate.z,
                    rx: Math.random(),
                    ry: Math.random(),
                    rz: Math.random(),
                    ease: KeyframeTweener.linear
                    
                },

                {
                    frame: startFrame + 6 + Math.random()*2,
                    tx: -2.4 + Math.random()*4.8,
                    tz: -112.0 + Math.random()*4,
                    ty: 0.8 + Math.random()*0.4,
                    rx: Math.random(),
                    ry: Math.random(),
                    rz: Math.random(),
                    rotate: 90,
                    ease: KeyframeTweener.linear
                    
                },

                {
                    frame: 218,
                    tx: -2.4 + Math.random()*4.8,
                    tz: -116.0 + Math.random()*4,
                    ty: 0.3,
                    rx: Math.random(),
                    ry: Math.random(),
                    rz: Math.random(),
                    rotate: 200,
                    ease: KeyframeTweener.quadEaseIn
                    
                },

                {
                    frame: 225,
                    rotate: 270,
                    ease: KeyframeTweener.quadEaseIn
                    
                },
            ]
        };

        sprites.push(sprite);
    }

    // Instead of animation, we do interaction: let the mouse control rotation.
    $(canvas).mousedown(function (event) {
        xDragStart = event.clientX;
        yDragStart = event.clientY;
        xRotationStart = camera.yaw;
        yRotationStart = camera.pitch;
        $(canvas).mousemove(rotateScene);
    }).mouseup(function (event) {
        $(canvas).unbind("mousemove");
    });

    kd.SPACE.press(function () {
        KeyframeTweener.initialize({
            sprites: sprites,
            finalKeyFrame: 1000
        });
    });


    // Using KeyDrown API to quickly refresh the keyboard 
    // input for smoother flight controlled by arrow keys
    kd.run(function () {
        kd.tick();
    });

    kd.UP.down(function () {
        pitchChange = toRad(camera.pitch);
        yawChange = toRad(camera.yaw);
        camera.position[0] -= (Math.sin(yawChange) / 4);
        camera.position[1] += (Math.sin(pitchChange) / 4);
        camera.position[2] -= (Math.cos(yawChange) / 4);
        window.drawScene();
    });

    kd.DOWN.down(function () {
        pitchChange = toRad(camera.pitch);
        yawChange = toRad(camera.yaw);
        camera.position[0] += (Math.sin(yawChange) / 4);
        camera.position[1] -= (Math.sin(pitchChange) / 4);
        camera.position[2] += (Math.cos(yawChange) / 4);
        window.drawScene();
    });

    kd.LEFT.down(function () {
        camera.yaw += 0.3;
        window.drawScene();
    });

    kd.W.down(function () {
        camera.position[1] += 0.1;
        window.drawScene();
    });

    kd.D.down(function () {
        yawChange = toRad(camera.yaw);
        camera.position[0] += (Math.cos(yawChange) / 4);
        camera.position[2] -= (Math.sin(yawChange) / 4);
        window.drawScene();
    });

    kd.A.down(function () {
        yawChange = toRad(camera.yaw);
        camera.position[0] -= (Math.cos(yawChange) / 4);
        camera.position[2] += (Math.sin(yawChange) / 4);
        window.drawScene();
    });

    kd.S.down(function () {
        camera.position[1] -= 0.1;
        window.drawScene();
    });

    kd.RIGHT.down(function () {
        camera.yaw -= 0.3;
        window.drawScene();
    });

    // Draw the initial scene.
    window.drawScene();

}(document.getElementById("bowling")));
