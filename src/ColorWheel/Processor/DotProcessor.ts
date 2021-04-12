import {ColorWheelType} from '../ColorWheelTypes';
import {VertexAttributeType} from '../ColorWheelTypes';
import {SphereCollide, hsv2rgb} from '../../Hsinpa/WebGL/WebglStatic';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorMinus} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import { CustomEventTypes, ShapeType, ColorWheelConfig } from '../ColorWheelTypes';
import WheelProcessorHelper, {CreateVertexAttributeType} from './WheelProcessorHelper';
import {PiePieceType} from './ColorWheelProcessor';

interface DotType {
    _id : string,
    
    x : number,
    y : number,

    center_x : number,
    center_y : number,

    radius : number,
    vertex : VertexAttributeType
}

class DotProcessor {
    
    public radius : number;

    private _dotArray : DotType[]; 
    private _wheelProcessorHelper : WheelProcessorHelper;
    private _sphereSteps = 6; // dot is small, so keep this number small
    private _mainApp : ColorWheel;

    constructor(mainApp : ColorWheel, wheelProcessorHelper : WheelProcessorHelper ) {
        this._mainApp = mainApp;
        this.radius = 6;
        this._dotArray = [];
        this._wheelProcessorHelper = wheelProcessorHelper;
    }

    AddDot(id : string, x : number,  y : number, center_x : number, center_y : number, color : number[]) {
        let idIndex = this._dotArray.findIndex(x=>x._id == id);

        if (idIndex >= 0) {
            this.UpdateDot(id, x, y, color);
        } else {
            let newVertex = CreateVertexAttributeType(ShapeType.Sphere, true);
            let offsetClipSpace = this.GetOffset(x,y,center_x,center_y);

            let newDotType : DotType = {
                x : x, y : y, radius : this.radius,
                center_x : center_x, center_y : center_y, _id : id,
                vertex : this._wheelProcessorHelper.GetSphereVertext(newVertex, center_x, center_y, this.radius, this._sphereSteps, this.GetDotColors.bind(this) )
            }

            newDotType.vertex.mainColor = color;

            newDotType.vertex.positionOffset = [offsetClipSpace.x, offsetClipSpace.y];

            this._dotArray.push(newDotType);
        }
    }

    RemoveDot(id : string) {
        let idIndex = this._dotArray.findIndex(x=>x._id == id);
        if (idIndex >= 0) {
            this._dotArray.splice(idIndex, 1);
        }
    }

    UpdateDot(id : string, x : number, y : number, color : number[]) {
        let idIndex = this._dotArray.findIndex(x=>x._id == id);

        if (idIndex >= 0) {
            let updatedDot = this._dotArray[idIndex];

            let offset = this.GetOffset(x,y,updatedDot.center_x,updatedDot.center_y);

            updatedDot.x = x;
            updatedDot.y = y;

            updatedDot.vertex.positionOffset[0] = offset.x;
            updatedDot.vertex.positionOffset[1] = offset.y;
            
            updatedDot.vertex.mainColor = color;

            this._dotArray[idIndex] = updatedDot;
        }
    }

    Process() : VertexAttributeType[]{
        return this._dotArray.map(x=>x.vertex);
    }

    private GetDotColors(t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) : number[][] {
        return [ColorWheelConfig.WhiteColor, ColorWheelConfig.WhiteColor, ColorWheelConfig.WhiteColor];
    }

    private GetOffset(worldX : number, worldY : number, centerX : number, centerY : number) {
        let dotClipSpace = this._mainApp.ScreenPositionToClipSpace(worldX, worldY);
        let centerClipSpace = this._mainApp.ScreenPositionToClipSpace(centerX , centerY);
        return VectorMinus(dotClipSpace, centerClipSpace);
    }
}

export default DotProcessor