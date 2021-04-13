import ColorWheel from '../ColorWheel';
import {PiePieceType, ColorPickBarPointsType} from './ColorWheelProcessor';
import {VertexAttributeType, ShapeType, ColorWheelConfig} from '../ColorWheelTypes';
import {VectorToArray} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';

type CustomGetWheelColor = (t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) => number[][];

class WheelProcessorHelper {

    private colorWheel : ColorWheel;

    constructor(colorWheel : ColorWheel) {
        this.colorWheel = colorWheel;
    }

    GetSphereVertext(vertexType : VertexAttributeType,
        x : number, y : number, radius : number, steps : number,  GetColorArrayFunc : CustomGetWheelColor) {
        let max = Math.PI*2;
        let step = max / steps;

        let centerPiece : PiePieceType= {radian : 0, x : 0, y : 0, 
                                        scaleX : x, 
                                        scaleY : y }
        
        vertexType.position.length = 0
        vertexType.vertexColor.length = 0
        vertexType.uv.length = 0
        vertexType.count = 0;

        for (let i = 0; i < steps; i++) {
            let s = step * i;

            let t1 = centerPiece;
            let t2 = this.GetPiePieceTypeByRadian(s, x, y, radius);
            let t3 = this.GetPiePieceTypeByRadian(0,  x, y, radius); //Default : first step

            //Not Last steps
            if (i < steps -1) {
                t3 = this.GetPiePieceTypeByRadian(step * (i + 1),  x, y, radius);
            }

            vertexType.position = vertexType.position.concat(this.GetVertexArray(t1, t3, t2));
            vertexType.uv = vertexType.uv.concat(this.GetUVArray(t1, t3, t2));
            vertexType.vertexColor = vertexType.vertexColor.concat(GetColorArrayFunc(t1, t3, t2));
        }
        vertexType.count = vertexType.position.length;

        return vertexType;
    }

    private GetPiePieceTypeByRadian(radian : number, world_x : number, world_y : number, radius : number) : PiePieceType {
        let x = Math.cos(radian), y = Math.sin(radian);
        return {
            radian : radian,
            x : x,
            y : y,
            scaleX : world_x + (x * radius),
            scaleY : world_y + (y * radius)
        };
    }

    private GetVertexArray(t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) : number[][] {
        return [
            VectorToArray(this.colorWheel.ScreenPositionToClipSpace(t1.scaleX, t1.scaleY)),
            VectorToArray(this.colorWheel.ScreenPositionToClipSpace(t2.scaleX, t2.scaleY)),
            VectorToArray(this.colorWheel.ScreenPositionToClipSpace(t3.scaleX, t3.scaleY))
        ]
    }

    private GetUVArray(t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) : number[][] {
        return [[t1.x, t1.y], [t2.x, t2.y], [t3.x, t3.y]];
    }

    public GetValueBarVertex(colorPickBarPointsType : ColorPickBarPointsType) {
        let topLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(colorPickBarPointsType.topLeft.x, colorPickBarPointsType.topLeft.y);
        let topRight : IntVector2 =this.colorWheel.ScreenPositionToClipSpace(colorPickBarPointsType.topRight.x, colorPickBarPointsType.topRight.y);
        let botLeft : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(colorPickBarPointsType.botLeft.x, colorPickBarPointsType.botLeft.y);
        let botRight : IntVector2 = this.colorWheel.ScreenPositionToClipSpace(colorPickBarPointsType.botRight.x, colorPickBarPointsType.botRight.y);

        let vertexType = CreateVertexAttributeType(ShapeType.Sphere, false);
        vertexType.position = [VectorToArray(botLeft), VectorToArray(topLeft), VectorToArray(botRight),
                               VectorToArray(botRight), VectorToArray(topLeft), VectorToArray(topRight)];

        vertexType.vertexColor = [ ColorWheelConfig.BlackColor , ColorWheelConfig.WhiteColor, ColorWheelConfig.BlackColor, 
                                    ColorWheelConfig.BlackColor, ColorWheelConfig.WhiteColor, ColorWheelConfig.WhiteColor];
        vertexType.count = 6;

        vertexType.uv = vertexType.position;

        return vertexType;
    }

}

export function CreateVertexAttributeType(type : number, enableBorder : boolean) : VertexAttributeType {

    let newVertex : VertexAttributeType = {
        position : [],
        vertexColor : [],
        uv : [],

        enableBorder : enableBorder,
        enableRadialGradient : false,
        enableLinearGradient : false,

        type : type, 
        //Default white color
        mainColor : [1,1,1,1],
        subColor : [1,1,1,1],

        //Default no offset
        positionOffset : [0,0],
        count : 0
    }

    return newVertex;
}

export default WheelProcessorHelper;  