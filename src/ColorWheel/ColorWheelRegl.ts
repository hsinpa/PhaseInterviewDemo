import REGL, {Regl} from 'regl';
import {VertexAttributeType} from './ColorWheelTypes';

export interface CustomReglPropType {
    time : number;
    vertex : number[][],
    color : number[][], // Vertex Color
    uv : number[][],

    mainColor : number[],
    subColor : number[],
    positionOffset : number[], //Vector2
    vertexCount : number,
    enableBorder : number,
    enableRadialGradient : number,
    enableLinearGradient : number,
    shapeType : number,
    scale : number
}

export function ExecuteREGLCommand(regl : Regl, drawCommand : REGL.DrawCommand, vertexAttrType : VertexAttributeType) {    
    drawCommand({
        vertex : (vertexAttrType.position),
        color : (vertexAttrType.vertexColor),
        uv : (vertexAttrType.uv),

        enableBorder : (vertexAttrType.enableBorder) ? 1 : 0,
        enableRadialGradient :  (vertexAttrType.enableRadialGradient) ? 1 : 0,
        enableLinearGradient :  (vertexAttrType.enableLinearGradient) ? 1 : 0,

        shapeType : vertexAttrType.type,
        mainColor : vertexAttrType.mainColor,
        subColor : vertexAttrType.subColor,
        positionOffset : vertexAttrType.positionOffset,
        vertexCount : vertexAttrType.count
    });
}

export function CreateREGLCommandObj(regl : Regl, vertex : string, fragment : string) {
    return regl({
        frag: fragment,
        vert: vertex,

        attributes: {
            a_position: regl.prop<CustomReglPropType, "vertex">("vertex"),
            a_color: regl.prop<CustomReglPropType, "color">("color"),
            a_uv :  regl.prop<CustomReglPropType, "uv">("uv"),
        },

        uniforms: {
            time: regl.prop<CustomReglPropType, "time">("time"),
            u_offset : regl.prop<CustomReglPropType, "positionOffset">("positionOffset"),

            u_enableBorder: regl.prop<CustomReglPropType, "enableBorder">("enableBorder"),
            u_enableRadialGradient: regl.prop<CustomReglPropType, "enableRadialGradient">("enableRadialGradient"),
            u_enableLinearGradient: regl.prop<CustomReglPropType, "enableLinearGradient">("enableLinearGradient"),

            u_shapeType: regl.prop<CustomReglPropType, "shapeType">("shapeType"),
            u_mainColor: regl.prop<CustomReglPropType, "mainColor">("mainColor"),
            u_subColor: regl.prop<CustomReglPropType, "subColor">("subColor"),
        },

        count: regl.prop<CustomReglPropType, "vertexCount">("vertexCount")
    });
}