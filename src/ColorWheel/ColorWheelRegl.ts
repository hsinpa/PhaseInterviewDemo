import REGL, {Regl} from 'regl';
import {VertexAttributeType} from './ColorWheelTypes';

export interface CustomReglPropType {
    time : number;
    vertex : number[][];
    color : number[][];
    uv : number[][];
    vertexCount : number,
    enableBorder : number,
    shapeType : number,
    scale : number
}

export function ExecuteREGLCommand(regl : Regl, drawCommand : REGL.DrawCommand, vertexAttrType : VertexAttributeType) {
    // console.log("vertexAttrType.position " + vertexAttrType.position.length);
    // console.log("vertexAttrType.color " + vertexAttrType.color.length);
    // console.log("vertexAttrType.uv " + vertexAttrType.uv.length);
    // console.log("vertexAttrType.count " + vertexAttrType.count);

    drawCommand({
        vertex : regl.buffer(vertexAttrType.position),
        color : regl.buffer(vertexAttrType.color),
        uv : regl.buffer(vertexAttrType.uv),
        enableBorder : (vertexAttrType.enableBorder) ? 1 : 0,
        shapeType : vertexAttrType.type,
        vertexCount : vertexAttrType.count
    });
}

export function CreateREGLCommandObj(regl : Regl, vertex : string, fragment : string) {
    return regl({
        frag: fragment,
        vert: vertex,

        blend : {
            enable: true,
            func: {
              srcRGB: 'src alpha',
              srcAlpha: 1,
              dstRGB: 'src alpha',
              dstAlpha: 0
            },
            equation: {
              rgb: 'add',
              alpha: 'add'
            },
            color: [0, 0, 0, 0]
        },

        attributes: {
            a_position: regl.prop<CustomReglPropType, "vertex">("vertex"),
            a_color: regl.prop<CustomReglPropType, "color">("color"),
            a_uv :  regl.prop<CustomReglPropType, "uv">("uv"),
        },

        uniforms: {
            time: regl.prop<CustomReglPropType, "time">("time"),
            u_enableBorder: regl.prop<CustomReglPropType, "enableBorder">("enableBorder"),
            u_shapeType: regl.prop<CustomReglPropType, "shapeType">("shapeType"),
        },

        count: regl.prop<CustomReglPropType, "vertexCount">("vertexCount")
    });
}