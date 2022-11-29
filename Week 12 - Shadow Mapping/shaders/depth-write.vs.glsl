
attribute vec3 aVertexPosition;
uniform mat4 uWorldMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
varying float vDepth;

void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uWorldMatrix * vec4(aVertexPosition, 1.0);
  // todo #3 convert clip space depth into NDC and rescale from [-1, 1] to [0, 1]
  float oldRange = 1.0 - (-1.0);
  float newRange = 1.0 - 0.0;
  float newValue = (((gl_Position.z - (-1.0)) * newRange) / oldRange);
  //float newValue = (gl_Position.z  / gl_Position.w) * 0.5 + 0.5;

  vDepth = newValue;//gl_Position.z;  // temporarily set to gl_Position.z
}
// EOF 00100001-10