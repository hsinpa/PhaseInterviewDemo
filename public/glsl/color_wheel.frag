  precision mediump float;
  
  uniform float time;
  varying vec2 v_uv;
  varying vec4 v_color;

  void main () {
    gl_FragColor = v_color;
  }