precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uCameraPosition;
uniform sampler2D uTexture;

varying vec2 vTexcoords;
varying vec3 vWorldNormal;
varying vec3 vWorldPosition;

void main(void) {
    // diffuse contribution
    // todo #1 normalize the light direction and store in a separate variable
    vec3 normalLight = normalize(uLightDirection);
    // todo #2 normalize the world normal and store in a separate variable
    vec3 newWorldNormal = normalize(vWorldNormal);

    // todo #3 calculate the lambert term
    float lamb = max (dot(normalLight, newWorldNormal), 0.0);
    // specular contribution
    // todo #4 in world space, calculate the direction from the surface point to the eye (normalized)
    vec3 eyeVec = normalize(vec3(uCameraPosition.x - vWorldPosition.x, uCameraPosition.y - vWorldPosition.y, uCameraPosition.z - vWorldPosition.z));

    // todo #5 in world space, calculate the reflection vector (normalized) r = -l + 2(l . n )n
    float distance = 2.0 * max(dot(uLightDirection, newWorldNormal), 0.0);
    vec3 temp = newWorldNormal * distance;
    //vec3 temp = vec3(newWorldNormal.x * distance, newWorldNormal.y * distance, newWorldNormal.z * distance);
    vec3 reflection = normalize(vec3(-uLightDirection.x + temp.x, -uLightDirection.y + temp.y, -uLightDirection.z + temp.z));
    // todo #6 calculate the phong term Phong = (r . v)^n
    float sum = max(dot(reflection, eyeVec), 0.0);
    float phong = pow(sum, 64.0);
    
    //error is in negative values

    // combine
    // todo #7 apply light and material interaction for diffuse value by using the texture color as the material
    
    // todo #8 apply light and material interaction for phong, assume phong material color is (0.3, 0.3, 0.3)


    vec3 albedo = texture2D(uTexture, vTexcoords).rgb;

    vec3 ambient = albedo * 0.1;
    vec3 diffuseColor = albedo * lamb;
    vec3 specularColor = albedo * phong;

    // todo #9
    // add "diffuseColor" and "specularColor" when ready
    vec3 finalColor = ambient + diffuseColor + specularColor;


    //gl_FragColor = vec4(lamb, lamb, lamb, 1.0);
    
    //gl_FragColor = vec4(eyeVec, 1.0);

    //gl_FragColor = vec4(reflection, 1.0);

    //gl_FragColor = vec4(phong, phong, phong, 1.0);

    //gl_FragColor = vec4(diffuseColor, 1.0);

    //gl_FragColor = vec4(specularColor, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
}

// EOF 00100001-10