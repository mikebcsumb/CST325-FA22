function Camera(input) {
    // The following two parameters will be used to automatically create the cameraWorldMatrix in this.update()
    this.cameraYaw = 0;
    this.cameraPosition = new Vector3();

    this.cameraWorldMatrix = new Matrix4();

    // -------------------------------------------------------------------------
    this.getViewMatrix = function() {
        return this.cameraWorldMatrix.clone().inverse();
    }

    // -------------------------------------------------------------------------
    this.getForward = function() {
        // todo #6 - pull out the forward direction from the world matrix and return as a vector
        var e = this.cameraWorldMatrix.elements;
        //         - recall that the camera looks in the "backwards" direction
        //last colun? 3rd column? z direction
        //console.log(e)
        // https://www.scratchapixel.com/lessons/mathematics-physics-for-computer-graphics/lookat-function 
        return new Vector3(e[8], e[9], e[10]);
    }
    // -------------------------------------------------------------------------
    this.update = function(dt) {
        var currentForward = this.getForward();
        //console.log(this.cameraPosition.z)
        //console.log(currentForward.z)


        if (input.up) {
            // todo #7 - move the camera position a little bit in its forward direction
            //-z is forward
        //console.log("input up")

            this.cameraPosition.z = -(currentForward.z*0.1)
        //console.log(this.cameraPosition.z)

        }

        if (input.down) {
            // todo #7 - move the camera position a little bit in its backward direction
        //console.log("input down")

            this.cameraPosition.z = currentForward.z*0.1
            //console.log(this.cameraPosition.z)

        }

        if (input.left) {
            // todo #8 - add a little bit to the current camera yaw
            this.cameraYaw += 0.5;
        }

        if (input.right) {
            // todo #8 - subtract a little bit from the current camera yaw
            this.cameraYaw += -0.5;

        }

        // todo #7 - create the cameraWorldMatrix from scratch based on this.cameraPosition
        //this.cameraWorldMatrix.makeIdentity();
        let translation = new Matrix4().makeTranslation(this.cameraPosition);
        let rotation = new Matrix4().makeRotationY(this.cameraYaw);

        this.cameraWorldMatrix.multiply(translation).multiply(rotation);
       // this.cameraWorldMatrix.multiply(rotation).multiply(translation);
       //console.log(this.cameraWorldMatrix.elements)

        // todo #8 - create a rotation matrix based on cameraYaw and apply it to the cameraWorldMatrix
        //this.cameraWorldMatrix = translation.makeRotationX(this.cameraYaw);
        this.cameraPosition = new Vector3();
        this.cameraYaw = 0;

        // (order matters!)
    }
}

// EOF 00100001-10