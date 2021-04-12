export interface ColorWheelConfig {
    canvas_query : string,
    canvas_height : number,
    canvas_width : number,
    vertex_path : string,
    frag_path : string,

    colorWheel : ColorWheelType,
    polygons : PolygonType[]
}

export interface ColorWheelType {
    x : number;
    y : number;
    radius : number
}

export interface PolygonType {
    id : string,
    x : number;
    y : number;
    scale : number;
    ignoreRaycast : boolean,
    color : number[];
    gradientColor : number[],
    points : number[][];
}

export interface VertexAttributeType {
    position : number[][]; // Vector2
    vertexColor :  number[][]; // Vector4,
    uv :  number[][]; // Vector2
    
    enableBorder : boolean,
    enableLinearGradient : boolean,
    enableRadialGradient : boolean,

    type : number, // ShapeType
    mainColor : number[],
    subColor : number[],
    positionOffset : number[],
    count : number
}

export interface HSVType {
    radian : number,
    saturation : number,
    value : number
}

export let CustomEventTypes = {
    MouseDownEvent : "event@mousedown",
    MouseDragEvent : "event@mouseDrag",
    MouseUpEvent : "event@mouseUp",
    MouseCtrlClick : "event@clickclick",
    DeselectPolygonEvent : "event@polygonDeselect",
    OnDominateColorEvent : "event@dominateColorChange",
    OnSupportColorEvent : "event@supportColorChange",
}

export let CustomIDString = {
    DominateDot : "id@dot_dominate",
    GradientDot : "id@dot_gradient",
    ColorValueBarDot : "id@dot_valuebar",
}

export let ColorWheelConfig = {
    DotControlColor : [0.9,0.9,0.9, 1],
    SubDotControlColor : [0.6,0.6,0.6, 1],

    WhiteColor : [1,1,1,1],
    BlackColor : [0,0,0,1],

    MainDotSize : 6,
    SupportDotSize : 5,
}

export let ShapeType = {
    Sphere : 0.0,
    Polygon : 1.0
}

export enum ColorWheelMode {
    Normal, Gradient
}