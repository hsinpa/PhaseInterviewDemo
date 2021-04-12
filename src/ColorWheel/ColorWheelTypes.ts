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
    points : number[][];
}

export interface VertexAttributeType {
    position : number[][]; // Vector2
    color :  number[][]; // Vector4,
    uv :  number[][]; // Vector2
    enableBorder : boolean,
    type : number, // ShapeType
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
}

export let CustomIDString = {
    DominateDot : "id@dot_dominate",
    GradientDot : "id@dot_gradient",
    ColorValueBarDot : "id@dot_valuebar",
}

export let DotConfig = {
    DefaultColor : [0.9,0.9,0.9, 1]
}

export let ShapeType = {
    Sphere : 0.0,
    Polygon : 1.0
}