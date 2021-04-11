import {ColorWheelType} from '../ColorWheelTypes';
import {VertexAttributeType} from '../ColorWheelTypes';
import {SphereCollide, hsv2rgb, TriangleCollide} from '../../Hsinpa/WebGL/WebglStatic';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorMinus, NormalizeByRange, VectorMaginitude, Lerp } from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import { CustomEventTypes, CustomIDString, DotConfig, HSVType } from '../ColorWheelTypes';
import WheelProcessorHelper from './WheelProcessorHelper';
import DotProcessor from './DotProcessor';

export interface PiePieceType {
    radian : number;
    x : number;
    y : number;
    scaleX : number;
    scaleY : number;
}

interface ColorPickBarPointsType {
    topLeft : IntVector2,
    topRight : IntVector2,
    botLeft : IntVector2,
    botRight : IntVector2,
    center : IntVector2
}

class ColorWheelProcessor {
    public colorWheelType : ColorWheelType;

    private colorWheel : ColorWheel;
    private cWheelHelper : WheelProcessorHelper;
    private _dotProcessor : DotProcessor;

    private webglCanvas: HTMLCanvasElement;

    private radian_offset : number;
    private hsv : HSVType;

    private dominateColor : number[];
    private cacheWheelVertex : VertexAttributeType;
    private cacheColorBarVertex : VertexAttributeType;
    private cacheColorBarPoints : ColorPickBarPointsType;

    public get dotProcessor() {
        return this._dotProcessor;
    }

    constructor(colorWheel : ColorWheel, webglCanvas: HTMLCanvasElement, colorWheelType : ColorWheelType, radian_offset : number) {
        this.cWheelHelper = new WheelProcessorHelper(colorWheel);
        this._dotProcessor = new DotProcessor(this.cWheelHelper);
        this.colorWheelType = colorWheelType;
        this.colorWheel = colorWheel;
        this.radian_offset = radian_offset;
        this.webglCanvas = webglCanvas;

        this.dominateColor =  [1,1,1,1];
        this.hsv = {radian : 1, saturation : 1, value : 1 }
        this.SetValueBarNumber(1);
        this._dotProcessor.AddDot(CustomIDString.DominateDot,colorWheelType.x, colorWheelType.y, this.dominateColor);

        this.webglCanvas.addEventListener(CustomEventTypes.MouseDownEvent, this.OnMouseClick.bind(this));
        this.webglCanvas.addEventListener(CustomEventTypes.MouseDragEvent, this.OnMouseDrag.bind(this));
    }

//#region Color Wheel
    ProcessWheel(steps : number) : VertexAttributeType{

        if (this.cacheWheelVertex == null) {
            this.cacheWheelVertex = {
                    position : [],
                    color : [],
                    uv : [],
                    count : 0
            }
        }

        this.cacheWheelVertex = this.cWheelHelper.GetSphereVertext(this.cacheWheelVertex, this.colorWheelType.x, this.colorWheelType.y, 
                                                            this.colorWheelType.radius, steps, this.GetColorArray.bind(this) );

        return this.cacheWheelVertex;
    }

    private GetColorArray(t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) : number[][] {

        return [hsv2rgb( this.GetNormalizedRadian(t1.radian), 0, this.hsv.value), // this is one is center
            hsv2rgb(this.GetNormalizedRadian(t2.radian), 1, this.hsv.value),
            hsv2rgb(this.GetNormalizedRadian(t3.radian), 1, this.hsv.value) ];
    }

    private GetNormalizedRadian(radian : number) {
        let maxPi = Math.PI*2;
        //Revert, so the color direction fits documentation
        return maxPi - ((radian + this.radian_offset) % maxPi);
    }
//#endregion

//#region Value Bar
    //Assume value bar always align left
    GetValueBarRect() : ColorPickBarPointsType {
        let widthRadius = 15 * 0.5, space = 10;
        let x = this.colorWheelType.x - this.colorWheelType.radius - space - (widthRadius);
        let top = this.colorWheelType.y + this.colorWheelType.radius,
            bottom = this.colorWheelType.y - this.colorWheelType.radius;

        return {
            center : {x : x, y : this.colorWheelType.y},
            topLeft : {x: x - widthRadius, y: top},
            topRight : {x: x + widthRadius, y: top},
            botLeft : {x: x - widthRadius, y: bottom},
            botRight : {x: x + widthRadius, y: bottom},
        }
    }

    ProcessValueBar() : VertexAttributeType{
        let lightCol = hsv2rgb(this.hsv.radian, this.hsv.saturation, 1), blackCol = [0,0,0,1];

        //Return Cache
        if (this.cacheColorBarVertex != null) {

            this.cacheColorBarVertex.color =  [blackCol, lightCol, blackCol, blackCol, lightCol, lightCol];

            return this.cacheColorBarVertex;
        }

        //Cache the screen position information
        this.cacheColorBarPoints = this.GetValueBarRect();

        let topLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.topLeft.x, this.cacheColorBarPoints.topLeft.y);
        let topRight : IntVector2 =this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.topRight.x, this.cacheColorBarPoints.topRight.y);
        let botLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.botLeft.x, this.cacheColorBarPoints.botLeft.y);
        let botRight : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.botRight.x, this.cacheColorBarPoints.botRight.y);

        let vertexType : VertexAttributeType = {
            position : [VectorToArray(botLeft), VectorToArray(topLeft), VectorToArray(botRight),
                        VectorToArray(botRight), VectorToArray(topLeft), VectorToArray(topRight)
            ],
            color : [blackCol, lightCol, blackCol, blackCol, lightCol, lightCol],
            uv : [],
            count : 6
        }

        vertexType.uv = vertexType.position;
        
        this.cacheColorBarVertex = vertexType;

        return this.cacheColorBarVertex;
    }

    public SetValueBarNumber(value : number) {
        this.hsv.value = value;

        let valueBar = this.GetValueBarRect();
        let screenY = (Lerp(valueBar.botLeft.y, valueBar.topLeft.y, value));
        this.dotProcessor.AddDot(CustomIDString.ColorValueBarDot, valueBar.center.x, screenY, DotConfig.DefaultColor);
    }
//#endregion

//#region Event Listener
public OnMouseClick(e : CustomEvent) {
    let mouse : IntVector2 = e.detail;
    this.OnMouseAction(mouse);
}

public OnMouseDrag(e : CustomEvent) {
    let mouse : IntVector2 = e.detail;
    this.OnMouseAction(mouse);
}

private OnMouseAction(mouse : IntVector2) {
    //If is inside color wheel
    let colorWheelClick = SphereCollide(this.colorWheelType.x, this.colorWheelType.y, this.colorWheelType.radius, mouse.x, mouse.y );
    if (colorWheelClick) {  
        this.dotProcessor.AddDot(CustomIDString.DominateDot, mouse.x, mouse.y, DotConfig.DefaultColor);
        this.SetRGBColorByMousePos(mouse.x, mouse.y);
        this.colorWheel.DrawREGLCavnas();
        return;
    }

    //If is inside pick color bar
    if (this.cacheColorBarPoints != null) {
        let trigCheck1 = TriangleCollide(mouse, this.cacheColorBarPoints.botLeft, this.cacheColorBarPoints.topLeft, this.cacheColorBarPoints.botRight );
        let trigCheck2 = TriangleCollide(mouse, this.cacheColorBarPoints.botRight, this.cacheColorBarPoints.topLeft, this.cacheColorBarPoints.topRight );

        //Either one is true, mean on click
        if (trigCheck1 || trigCheck2) {
            this.SetValueBarNumber(NormalizeByRange(mouse.y, this.cacheColorBarPoints.botLeft.y, this.cacheColorBarPoints.topLeft.y));
            this.colorWheel.DrawREGLCavnas();
        }
    }
}

private GetHSVByMousePos(x : number, y : number) : HSVType{
    let mouseVector : IntVector2 = {x : x , y : y};
    let wheelVector : IntVector2 = {x : this.colorWheelType.x  , y : this.colorWheelType.y};
    let direction =  (VectorMinus(mouseVector, wheelVector));
    direction.x /= this.colorWheelType.radius;
    direction.y /= this.colorWheelType.radius;

    let saturation = VectorMaginitude(direction);

    let radian = Math.atan2(direction.y, direction.x);

    return {
        saturation : saturation,
        radian : this.GetNormalizedRadian(radian),
        value : this.hsv.value // Leave it unchange
    }
}

//Assume is within color wheel
private SetRGBColorByMousePos(x : number, y : number) {
    this.hsv = this.GetHSVByMousePos(x, y);
    this.dominateColor = hsv2rgb(this.hsv.radian, this.hsv.saturation, this.hsv.value);
}
//#endregion
}

export default ColorWheelProcessor;