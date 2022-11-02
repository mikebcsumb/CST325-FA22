precision mediump float;

uniform sampler2D uTexture;
uniform float uAlpha;

// todo #3 - receive texture coordinates and verify correctness by 
// using them to set the pixel color 
varying vec2 texCoords;

void main(void) {
    // todo #5
    vec4 col = texture2D(uTexture, texCoords);
    //gl_FragColor = texture2D(uTexture, texCoords);
    col.w = uAlpha;
    gl_FragColor = col;


    // todo #3
    //gl_FragColor = vec4(texCoords.x, texCoords.y, 0.0, uAlpha);
}

// EOF 00100001-10
