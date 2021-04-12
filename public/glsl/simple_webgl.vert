precision mediump float;
  
attribute vec2 a_position;
attribute vec4 a_color;
attribute vec2 a_uv;

varying vec2 v_uv;
varying vec4 v_color;

uniform vec2 u_offset; //Assume clip space

mat2 Scale(float scale) {
    return mat2(scale, 0.0,
                0.0, scale);
}

void main () {

  vec2 offsetPosition = a_position + u_offset;

  gl_Position =  vec4( offsetPosition, 0.0, 1.0);
  // v_uv = vec2( (a_position + 1.0 )* 0.5 ); // For Image processing effect

  v_uv = a_uv;
  v_color = a_color;
}