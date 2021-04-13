  precision mediump float;
  
  uniform float u_time;
  uniform float u_enableBorder;
  uniform int u_shapeType;

  uniform int u_enableRadialGradient;
  uniform int u_enableLinearGradient;

  uniform vec4 u_mainColor;
  uniform vec4 u_subColor;

  varying vec2 v_uv;
  varying vec4 v_color;
  
  float GetVectorDistToCenter(vec2 uv) {
    return sqrt(pow(uv.x, 2.0) + pow(uv.y, 2.0));
  }

  bool IsSphereBorder(float x, float y, float radius) {
    return GetVectorDistToCenter(vec2(x, y)) > 0.5;
  }

  float CustomIntegerOperation(float a, float b) {
    return a - (b * floor(a/b));
  }

  vec4 GetRadialGradient(vec2 uv, vec4 mainColor, vec4 subColor) {
    float diff = GetVectorDistToCenter(v_uv * 2.0 - 1.0);
    return mix(mainColor, subColor, diff);
  }

  vec4 GetLinearGradient(vec2 uv, vec4 mainColor, vec4 subColor) {
    return mix(mainColor, subColor, v_uv.x + v_uv.y * 0.5);
  }


  void main () {
    vec4 returnColor = v_color * u_mainColor;

    if (u_enableRadialGradient == 1 && u_shapeType == 1) {
      returnColor = GetRadialGradient(v_uv, returnColor, u_subColor);
    }

    if (u_enableLinearGradient == 1 && u_shapeType == 1) {
      returnColor = GetLinearGradient(v_uv, returnColor, u_subColor);
    }

    if (u_enableBorder == 1.0) {
      if (u_shapeType == 0 && IsSphereBorder(v_uv.x, v_uv.y, 0.8)) {
        returnColor = vec4(0.0, 0.0, 0.0, 1.0);
      }

      if (u_shapeType == 1) {
        float stripX = 0.1 - CustomIntegerOperation(v_uv.x, 0.1);
        float stripY = 0.1 - CustomIntegerOperation(v_uv.y, 0.1);

        if (stripX < 0.01 || stripY < 0.01) {
          vec4 stripColor = (vec4(1.0,1.0,1.0,1.0)- v_color) * 0.4;
          returnColor = vec4(stripColor.r, stripColor.g, stripColor.b, 0.5);
        }
      }
    }

    gl_FragColor = returnColor;
    //gl_FragColor = v_color;
  }