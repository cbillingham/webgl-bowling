/*
 * A simple keyframe-tweening animation module for 2D
 * canvas elements.
 */


var KeyframeTweener = {
    // The module comes with a library of common easing functions.
    linear: function (currentTime, start, distance, duration) {
        var percentComplete = currentTime / duration;
        return distance * percentComplete + start;
    },

    quadEaseIn: function (currentTime, start, distance, duration) {
        var percentComplete = currentTime / duration;
        return distance * percentComplete * percentComplete + start;
    },

    quadEaseOut: function (currentTime, start, distance, duration) {
        var percentComplete = currentTime / duration;
        return -distance * percentComplete * (percentComplete - 2) + start;
    },

    quadEaseInAndOut: function (currentTime, start, distance, duration) {
        var percentComplete = currentTime / (duration / 2);
        return (percentComplete < 1) ?
                (distance / 2) * percentComplete * percentComplete + start :
                (-distance / 2) * ((percentComplete - 1) * (percentComplete - 3) - 1) + start;
    },


    // The big one: animation initialization.  The settings parameter
    // is expected to be a JavaScript object with the following
    // properties:
    //
    // - renderingContext: the 2D canvas rendering context to use
    // - width: the width of the canvas element
    // - height: the height of the canvas element
    // - sprites: the array of sprites to animate
    // - frameRate: number of frames per second (default 24)
    //
    // In turn, each sprite is a JavaScript object with the following
    // properties:
    //
    // - draw: the function that draws the sprite
    // - keyframes: the array of keyframes that the sprite should follow
    //
    // Finally, each keyframe is a JavaScript object with the following
    // properties.  Unlike the other objects, defaults are provided in
    // case a property is not present:
    //
    // - frame: the global animation frame number in which this keyframe
    //          it to appear
    // - ease: the easing function to use (default is KeyframeTweener.linear)
    // - tx, ty: the location of the sprite (default is 0, 0)
    // - sx, sy: the scale factor of the sprite (default is 1, 1)
    // - rotate: the rotation angle of the sprite (default is 0)
    //
    // Initialization primarily calls setInterval on a custom-built
    // frame-drawing (and updating) function.
    initialize: function (settings) {
        // We need to keep track of the current frame.
        var currentFrame = 0,

            // Avoid having to go through settings to get to the
            // rendering context and sprites.
            sprites = settings.sprites,
            finalKeyframe = settings.finalKeyframe,
            save;

        var intervalID = window.setInterval(function () {
            // Some reusable loop variables.
            var i,
                j,
                maxI,
                maxJ,
                ease,
                startKeyframe,
                endKeyframe,
                txStart,
                txDistance,
                tyStart,
                tyDistance,
                tzStart,
                tzDistance,
                sxStart,
                sxDistance,
                syStart,
                syDistance,
                szStart,
                szDistance,
                rxStart,
                rxDistance,
                ryStart,
                ryDistance,
                rzStart,
                rzDistance,
                rotateStart,
                rotateDistance,
                currentTweenFrame,
                duration;
            var optionsDistance = {};
            var extras = {};

            if (currentFrame > finalKeyframe) {
                window.clearInterval(IntervalId);
            }

            // For every sprite, go to the current pair of keyframes.
            // Then, draw the sprite based on the current frame.
            for (i = 0, maxI = sprites.length; i < maxI; i += 1) {
                for (j = 0, maxJ = sprites[i].keyframes.length - 1; j < maxJ; j += 1) {
                    // We look for keyframe pairs such that the current
                    // frame is between their frame numbers.

                    if ((sprites[i].keyframes[j].frame <= currentFrame) &&
                            (currentFrame <= sprites[i].keyframes[j + 1].frame)) {
                        // Point to the start and end keyframes.
                        startKeyframe = sprites[i].keyframes[j];
                        endKeyframe = sprites[i].keyframes[j + 1];

                        // Set up our start and distance values, using defaults
                        // if necessary.
                        ease = startKeyframe.ease || KeyframeTweener.linear;
                        txStart = startKeyframe.tx || sprites[i].obj.translate.x;
                        txDistance = (endKeyframe.tx || sprites[i].obj.translate.x) - txStart;
                        tyStart = startKeyframe.ty || sprites[i].obj.translate.y;
                        tyDistance = (endKeyframe.ty || sprites[i].obj.translate.y) - tyStart;
                        tzStart = startKeyframe.tz || sprites[i].obj.translate.z;
                        tzDistance = (endKeyframe.tz || sprites[i].obj.translate.z) - tzStart;
                        sxStart = startKeyframe.sx || sprites[i].obj.scale.x;
                        sxDistance = (endKeyframe.sx || sprites[i].obj.scale.x) - sxStart;
                        syStart = startKeyframe.sy || sprites[i].obj.scale.y;
                        syDistance = (endKeyframe.sy || sprites[i].obj.scale.y) - syStart;
                        szStart = startKeyframe.sz || sprites[i].obj.scale.z;
                        szDistance = (endKeyframe.sz || sprites[i].obj.scale.z) - szStart;
                        rxStart = startKeyframe.rx || sprites[i].obj.rotate.x;
                        rxDistance = (endKeyframe.rx || sprites[i].obj.rotate.x) - rxStart;
                        ryStart = startKeyframe.ry || sprites[i].obj.rotate.y;
                        ryDistance = (endKeyframe.ry || sprites[i].obj.rotate.y) - ryStart;
                        rzStart = startKeyframe.rz || sprites[i].obj.rotate.z;
                        rzDistance = (endKeyframe.rz || sprites[i].obj.rotate.z) - rzStart;
                        rotateStart = (startKeyframe.rotate || sprites[i].obj.rotate.angle );
                        rotateDistance = (endKeyframe.rotate || sprites[i].obj.rotate.angle) - rotateStart;
                        currentTweenFrame = currentFrame - startKeyframe.frame;
                        duration = endKeyframe.frame - startKeyframe.frame + 1;

                        // Build our transform according to where we should be.
                        (sprites[i].obj).translate = {
                            x: ease(currentTweenFrame, txStart, txDistance, duration),
                            y: ease(currentTweenFrame, tyStart, tyDistance, duration),
                            z: ease(currentTweenFrame, tzStart, tzDistance, duration)
                        };
                        (sprites[i].obj).scale = {
                            x: ease(currentTweenFrame, sxStart, sxDistance, duration),
                            y: ease(currentTweenFrame, syStart, syDistance, duration),
                            z: ease(currentTweenFrame, szStart, szDistance, duration)
                        };
                        (sprites[i].obj).rotate = {
                            angle: ease(currentTweenFrame, rotateStart, rotateDistance, duration),
                            x: ease(currentTweenFrame, rxStart, rxDistance, duration),
                            y: ease(currentTweenFrame, ryStart, ryDistance, duration),
                            z: ease(currentTweenFrame, rzStart, rzDistance, duration)
                        };
                        // Draw the scene
                        window.drawScene();

                    }
                }
            }

            // Move to the next frame.
            currentFrame += 1;
        }, 1000 / (settings.frameRate || 24));

        //reset back to normal state - TO DO: need to refactor this code so bowling alley resets
        /*
        for (i = 0, maxI = sprites.length; i < maxI; i += 1) {
            sprites[i].obj.translate.x = sprites[i].save.tx;
            sprites[i].obj.translate.y = sprites[i].save.ty;
            sprites[i].obj.translate.z = sprites[i].save.tz;
            sprites[i].obj.scale.x = sprites[i].save.sx;
            sprites[i].obj.scale.y = sprites[i].save.sy;
            sprites[i].obj.scale.z = sprites[i].save.sz;
            sprites[i].obj.rotate.x = sprites[i].save.rx;
            sprites[i].obj.rotate.y = sprites[i].save.ry;
            sprites[i].obj.rotate.z = sprites[i].save.rz;
            sprites[i].obj.rotate.angle = sprites[i].save.rotate;
        }
        window.drawScene();*/  
    }
};
