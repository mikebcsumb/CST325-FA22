/*
 * An object type representing an implicit sphere.
 *
 * @param center A Vector3 object representing the position of the center of the sphere
 * @param radius A Number representing the radius of the sphere.
 * 
 * Example usage:
 * var mySphere = new Sphere(new Vector3(1, 2, 3), 4.23);
 * var myRay = new Ray(new Vector3(0, 1, -10), new Vector3(0, 1, 0));
 * var result = mySphere.raycast(myRay);
 * 
 * if (result.hit) {
 *   console.log("Got a valid intersection!");
 * }
 */

var Sphere = function(center, radius) {
  // Sanity checks (your modification should be below this where indicated)
  if (!(this instanceof Sphere)) {
    console.error("Sphere constructor must be called with the new operator");
  }

  // this.center = center;
  // this.radius = radius;

  // todo - make sure this.center and this.radius are replaced with default values if and only if they
  // are invalid or undefined (i.e. center should be of type Vector3 & radius should be a Number)
  // - the default center should be the zero vector
  // - the default radius should be 1
  // YOUR CODE HERE

  if(radius == undefined || typeof radius != 'number'){
    this.radius = 1;
  } else {
    this.radius = radius;
  }
  if(center == undefined || !(center instanceof Vector3)){
    this.center = new Vector3(0,0,0);
  } else{
      this.center = center;
  }

  // Sanity checks (your modification should be above this)
  //I looked up how to find instance of and typeof before i looked at the below code...
  if (!(this.center instanceof Vector3)) {
    console.error("The sphere center must be a Vector3");
  }

  if ((typeof(this.radius) != 'number')) {
    console.error("The radius must be a Number");
  }
};

Sphere.prototype = {
  
  //----------------------------------------------------------------------------- 
  raycast: function(r1) {
    // todo - determine whether the ray intersects has a VALID intersection with this
	//        sphere and if so, where. A valid intersection is on the is in front of
	//        the ray and whose origin is NOT inside the sphere

    // Recommended steps
    // ------------------
    // 0. (optional) watch the video showing the complete implementation of plane.js
    //    You may find it useful to see a different piece of geometry coded.

    // 1. review slides/book math
    
    // 2. identity the vectors needed to solve for the coefficients in the quadratic equation

    // 3. calculate the discriminant
    
    // 4. use the discriminant to determine if further computation is necessary 
    //    if (discriminant...) { ... } else { ... }

    // 5. return the following object literal "result" based on whether the intersection
    //    is valid (i.e. the intersection is in front of the ray AND the ray is not inside
    //    the sphere)
    //    case 1: no VALID intersections
    //      var result = { hit: false, point: null }
    //    case 2: 1 or more intersections
    //      var result = {
    //        hit: true,
    //        point: 'a Vector3 containing the CLOSEST VALID intersection',
    //        normal: 'a vector3 containing a unit length normal at the intersection point',
    //        distance: 'a scalar containing the intersection distance from the ray origin'
    //      }

    // must save this since the ray changes each time.
    console.log(`r1.origin: ${r1.origin.x}, ${r1.origin.y}, ${r1.origin.z}`) 
    console.log(`r1.direction: ${r1.direction.x}, ${r1.direction.y}, ${r1.direction.z}`) 
    console.log(`sphere radius: ${this.radius},  center: ${this.center.x}, ${this.center.y}, ${this.center.z}`) 
    
    oMinusC = r1.origin.subtract(this.center);
    let a = r1.direction.dot(r1.direction);
    //console.log(`a: ${a}`);
    let b = r1.direction.clone().multiplyScalar(2).dot(oMinusC);
    //console.log(`b: ${b}`);
    let c = (oMinusC).dot(oMinusC)-1;
    //console.log(`c: ${c}`);

    // //temp test for quiz...
    // tempD=new Vector3(0,1,0);
    
    // tempO=new Vector3(2,1,0);
    // tempC=new Vector3(2.5,4,0);

    // oMinusC = tempO.subtract(tempC);

    // //no issues here if direction is normalized
    // let a = tempD.dot(tempD);
    
    // console.log(`a: ${a}`);
    // let b = (tempD.multiplyScalar(2)).dot(oMinusC);
    // console.log(`tempD.x: ${tempD.x} tempD.y ${tempD.y} tempD.z: ${tempD.z} `);
    // console.log(`b: ${b}`);
    // let c = oMinusC.dot(oMinusC)-1;
    // console.log(`c: ${c}`);

    let discriminant = (b * b) - 4 * (a * c);
    console.log(`discriminant: ${discriminant}`);
    console.log(`discriminant.sqrt: ${Math.sqrt(discriminant)}`);

    //discriminant *= -1;
    //console.log(`discriminant.sqrt: ${Math.sqrt(discriminant)}`);

    var root1, root2;
    if (discriminant > 0) {
      root1 = (-b + Math.sqrt(discriminant)) / (2 * a);
      root2 = (-b - Math.sqrt(discriminant)) / (2 * a);
        // result
        //console.log(`The roots of quadratic equation are ${root1} and ${root2}`);
      if (root1 > 0 && root1 < root2){
        //root1 is the alpha,
        var hitPoint = r1.origin.clone().multiplyScalar(root1);
        // console.log(hitPoint);
        // console.log(hitPoint.normalize());

        return {
          hit: true,
          point: hitPoint,
          normal: hitPoint.normalize(),
          distance: root1
        };

      } else if (root2 > 0 && root1 > root2){
        //root2 is the alpha
        var hitPoint = r1.origin.clone().multiplyScalar(root2);
        // console.log(hitPoint);
        // console.log(hitPoint.normalize());
			
        return {
				hit: true,
				point: hitPoint,
				normal: hitPoint.normalize(),
				distance: root2
			};
      } 
    }
      
      // condition for real and equal roots
      //means there is only one point. 
    else if (discriminant == 0) {
      root1 = root2 = -b / (2 * a);
      var hitPoint = r1.direction.clone();
      console.log(`r1.direction: ${r1.direction.x}, ${r1.direction.y}, ${r1.direction.z}`) 
    console.log(`hitPoint ${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}`);
    hitPoint = hitPoint.multiplyScalar(root2)
    console.log(`hitPoint ${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}`);
    hitPoint = hitPoint.add(r1.origin)
    console.log(`hitPoint ${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}`);

      newNormal = hitPoint.fromTo(this.center, hitPoint);
      //hitPoint.normalize()
    console.log(`hitPoint ${hitPoint.x}, ${hitPoint.y}, ${hitPoint.z}`);
    console.log(`newNormal ${newNormal.x}, ${newNormal.y}, ${newNormal.z}`);

    return {
      hit: true,
      point: newNormal,
      normal: newNormal.normalize(),
      distance: root2
    };
      
          // result
    }
    // An object created from a literal that we will return as our result
    // Replace the null values in the properties below with the right values
    //TODO 
    // if (root1 > 0){
    //   var result = {
    //     hit: true,      // should be of type Boolean
    //     point: null,    // should be of type Vector3
    //     normal: this.normal,   // should be of type Vector3
    //     distance: null, // should be of type Number (scalar)
    //   };
    // }
    var result = {
      hit: false,      // should be of type Boolean
      point: null,    // should be of type Vector3
      normal: null,   // should be of type Vector3
      distance: null, // should be of type Number (scalar)
    };

    return result;
  }
}

// EOF 00100001-10