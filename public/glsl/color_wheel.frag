  precision mediump float;
  
  uniform float u_time;
  uniform float u_enableBorder;
  uniform int u_shapeType;

  varying vec2 v_uv;
  varying vec4 v_color;
  

  bool IsSphereBorder(float x, float y, float radius) {
    return sqrt(pow(x, 2.0) + pow(y, 2.0)) > 0.5;
  }

  float CustomIntegerOperation(float a, float b) {
    return a - (b * floor(a/b));
  }

  void main () {

    vec4 returnColor = v_color;

    if (u_enableBorder == 1.0) {

      if (u_shapeType == 0 && IsSphereBorder(v_uv.x, v_uv.y, 0.8)) {
        returnColor = vec4(0.0, 0.0, 0.0, 1.0);
      }

      if (u_shapeType == 1) {
        float stripX = 0.1 - CustomIntegerOperation(v_uv.x, 0.1);
        float stripY = 0.1 - CustomIntegerOperation(v_uv.y, 0.1);

        if (stripX < 0.01 || stripY < 0.01) {
          vec4 stripColor = (vec4(1.0,1.0,1.0,1.0)- v_color) * 0.4;
          returnColor = vec4(stripColor.r, stripColor.g, stripColor.b, 1.0);
        }
      }
    }

    gl_FragColor = returnColor;
    //gl_FragColor = v_color;
  }