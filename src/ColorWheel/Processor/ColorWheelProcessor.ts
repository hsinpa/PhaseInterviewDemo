import {ColorWheelType} from '../ColorWheelTypes';
import {VertexAttributeType} from '../ColorWheelTypes';
import {SphereCollide, hsv2rgb, TriangleCollide, rgb2hsv} from '../../Hsinpa/WebGL/WebglStatic';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorMinus, NormalizeByRange, VectorMaginitude, Lerp } from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import { CustomEventTypes, CustomIDString, ColorWheelConfig, HSVType, ShapeType, ColorWheelMode } from '../ColorWheelTypes';
import WheelProcessorHelper, {CreateVertexAttributeType} from './WheelProcessorHelper';
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

    private cacheWheelVertex : VertexAttributeType;
    private cacheColorBarVertex : VertexAttributeType;
    private cacheColorBarPoints : ColorPickBarPointsType;

    private _dominateColor : number[]; // RGBA Format
    private _supportColor : number[] = [1,1,1,1]; // RGBA Format

    private _mode : ColorWheelMode;

    public get dominateColor() {
        return this._dominateColor;
    }

    public get supportColor() {
        return this._supportColor;
    }

    public set wheelDisplayColor(color : number[]) {
        if (this._mode == ColorWheelMode.Normal) {
            this._dominateColor = color;
            this.webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.OnDominateColorEvent,  { detail: this._dominateColor }))
        } else if (this._mode == ColorWheelMode.Gradient) {
            this._supportColor = color;
            this.webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.OnSupportColorEvent,  { detail: this._supportColor }))
        }
    }

    public get wheelDisplayColor() {
        return (this._mode == ColorWheelMode.Normal) ? this._dominateColor : this._supportColor;
    }

    public get dotProcessor() {
        return this._dotProcessor;
    }

    public get ActiveDotID() : string {
        return this._mode == ColorWheelMode.Normal ?  CustomIDString.DominateDot : CustomIDString.GradientDot;
    }

    public get mode() {
        return this._mode;
    }

    constructor(colorWheel : ColorWheel, webglCanvas: HTMLCanvasElement, colorWheelType : ColorWheelType, radian_offset : number) {
        this._mode = ColorWheelMode.Normal;

        this.cWheelHelper = new WheelProcessorHelper(colorWheel);
        this._dotProcessor = new DotProcessor(colorWheel, this.cWheelHelper);
        this.colorWheelType = colorWheelType;
        this.colorWheel = colorWheel;
        this.radian_offset = radian_offset;
        this.webglCanvas = webglCanvas;

        this.wheelDisplayColor =  [1,1,1,1];
        this.hsv = {radian : 1, saturation : 0, value : 1 }
        this.SetColorWheelByHSV(this.ActiveDotID,  this.hsv);
        //this.SetColorWheelByHSV(CustomIDString.GradientDot,  this.hsv);
    }

//#region Color Wheel
    ProcessWheel(steps : number) : VertexAttributeType{

        if (this.cacheWheelVertex != null) {
            this.cacheWheelVertex.mainColor = [this.hsv.value, this.hsv.value, this.hsv.value, 1];

            return this.cacheWheelVertex;
        }

        this.cacheWheelVertex = CreateVertexAttributeType(ShapeType.Sphere, false);

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
    private GetValueBarRect() : ColorPickBarPointsType {
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
        let lightCol = hsv2rgb(this.hsv.radian, this.hsv.saturation, 1);

        //Return Cache
        if (this.cacheColorBarVertex != null) {

            this.cacheColorBarVertex.mainColor = lightCol;
            //this.cacheColorBarVertex.vertexColor =  [blackCol, lightCol, blackCol, blackCol, lightCol, lightCol];

            return this.cacheColorBarVertex;
        }

        //Cache the screen position information
        this.cacheColorBarPoints = this.GetValueBarRect();

        let topLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.topLeft.x, this.cacheColorBarPoints.topLeft.y);
        let topRight : IntVector2 =this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.topRight.x, this.cacheColorBarPoints.topRight.y);
        let botLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.botLeft.x, this.cacheColorBarPoints.botLeft.y);
        let botRight : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(this.cacheColorBarPoints.botRight.x, this.cacheColorBarPoints.botRight.y);

        let vertexType = CreateVertexAttributeType(ShapeType.Sphere, false);
        vertexType.position = [VectorToArray(botLeft), VectorToArray(topLeft), VectorToArray(botRight),
                               VectorToArray(botRight), VectorToArray(topLeft), VectorToArray(topRight)];

        vertexType.vertexColor = [ ColorWheelConfig.BlackColor , ColorWheelConfig.WhiteColor, ColorWheelConfig.BlackColor, 
                                    ColorWheelConfig.BlackColor, ColorWheelConfig.WhiteColor, ColorWheelConfig.WhiteColor];
        vertexType.count = 6;

        vertexType.uv = vertexType.position;
        
        this.cacheColorBarVertex = vertexType;

        return this.cacheColorBarVertex;
    }

    public SetValueBarNumber(value : number) {
        this.hsv.value = value;

        let valueBar = this.GetValueBarRect();
        let screenY = (Lerp(valueBar.botLeft.y, valueBar.topLeft.y, value));

        this.dotProcessor.AddDot(CustomIDString.ColorValueBarDot, valueBar.center.x, screenY, valueBar.center.x, valueBar.center.y, 
                                ColorWheelConfig.DotControlColor, ColorWheelConfig.MainDotSize);
    }
//#endregion

//#region Event Listener

public CheckAndExecuteColorWheelCollision(mouse : IntVector2) : boolean {
    let colorWheelClick = SphereCollide(this.colorWheelType.x, this.colorWheelType.y, this.colorWheelType.radius, mouse.x, mouse.y );

    return colorWheelClick;
}

public CheckAndExecuteValueBarCollision(mouse : IntVector2) : boolean {
    if (this.cacheColorBarPoints != null) {
        let trigCheck1 = TriangleCollide(mouse, this.cacheColorBarPoints.botLeft, this.cacheColorBarPoints.topLeft, this.cacheColorBarPoints.botRight );
        let trigCheck2 = TriangleCollide(mouse, this.cacheColorBarPoints.botRight, this.cacheColorBarPoints.topLeft, this.cacheColorBarPoints.topRight );

        //Either one is true, mean on click
        if (trigCheck1 || trigCheck2) {
            this.SetValueBarNumber(NormalizeByRange(mouse.y, this.cacheColorBarPoints.botLeft.y, this.cacheColorBarPoints.topLeft.y));
            this.wheelDisplayColor = hsv2rgb(this.hsv.radian, this.hsv.saturation, this.hsv.value);

            return true;
        }
    }
    return false;
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
SetColorWheelByMousePos(dotID : string, x : number, y : number) {
    let hsvArray = rgb2hsv(this.wheelDisplayColor[0],this.wheelDisplayColor[1], this.wheelDisplayColor[2]);
    this.hsv.value = hsvArray[2];//Only need to change value
    this.hsv = this.GetHSVByMousePos(x, y);

    let dotColor = dotID == CustomIDString.DominateDot ? ColorWheelConfig.DotControlColor : ColorWheelConfig.SubDotControlColor;
    let dotSize = dotID == CustomIDString.DominateDot ? ColorWheelConfig.MainDotSize : ColorWheelConfig.SupportDotSize;

    this.dotProcessor.AddDot(dotID, x, y, this.colorWheelType.x, this.colorWheelType.y, dotColor, dotSize);

    this.wheelDisplayColor = hsv2rgb(this.hsv.radian, this.hsv.saturation, this.hsv.value);

    this.SetValueBarNumber(this.hsv.value);
}

SetColorWheelByHSV(dotID : string, hsv : HSVType) {
    this.hsv = hsv;
    
    this.SetValueBarNumber(this.hsv.value);

    let dotColor = dotID == CustomIDString.DominateDot ? ColorWheelConfig.DotControlColor : ColorWheelConfig.SubDotControlColor;
    let dotSize = dotID == CustomIDString.DominateDot ? ColorWheelConfig.MainDotSize : ColorWheelConfig.SupportDotSize;

    let x = ((Math.cos(this.GetNormalizedRadian(this.hsv.radian))) * this.colorWheelType.radius * this.hsv.saturation) + this.colorWheelType.x, 
        y = ((Math.sin(this.GetNormalizedRadian(this.hsv.radian))) * this.colorWheelType.radius * this.hsv.saturation) + this.colorWheelType.y ;

    this._dotProcessor.AddDot(dotID, x, y, this.colorWheelType.x, this.colorWheelType.y, dotColor, dotSize);

    this.wheelDisplayColor = hsv2rgb(this.hsv.radian, this.hsv.saturation, this.hsv.value);
}

SetMode(mode : ColorWheelMode) {
    this._mode = mode;
}
//#endregion
}

export default ColorWheelProcessor;