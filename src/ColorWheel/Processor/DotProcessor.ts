import {ColorWheelType} from '../ColorWheelTypes';
import {VertexAttributeType} from '../ColorWheelTypes';
import {SphereCollide, hsv2rgb} from '../../Hsinpa/WebGL/WebglStatic';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorNumScale} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import { CustomEventTypes } from '../ColorWheelTypes';
import WheelProcessorHelper from './WheelProcessorHelper';
import {PiePieceType} from './ColorWheelProcessor';

interface DotType {
    _id : string,
    x : number,
    y : number,
    radius : number,
    vertex : VertexAttributeType
}

class DotProcessor {
    
    public radius : number;

    private _dotArray : DotType[]; 
    private _wheelProcessorHelper : WheelProcessorHelper;
    private _sphereSteps = 12; // dot is small, so keep this number small
    private _cacheColor : number[]; // Current for the last update dot, do not use it directly

    constructor(wheelProcessorHelper : WheelProcessorHelper ) {
        this.radius = 6;
        this._dotArray = [];
        this._cacheColor = [1,1,1,1]; //default white
        this._wheelProcessorHelper = wheelProcessorHelper;
    }

    AddDot(id : string, x : number,  y : number, color : number[]) {
        let idIndex = this._dotArray.findIndex(x=>x._id == id);
        this._cacheColor = color;




        if (idIndex >= 0) {
            this.UpdateDot(id, x, y, color);
        } else {

            let newVertex : VertexAttributeType = {
                    position : [],
                    color : [],
                    uv : [],
                    count : 0
            }
            
            let newDotType : DotType = {
                x : x, y : y, radius : this.radius, _id : id,
                vertex : this._wheelProcessorHelper.GetSphereVertext(newVertex, x, y, this.radius, this._sphereSteps, this.GetDotColors.bind(this) )
            }
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
        this._cacheColor = color;

        if (idIndex >= 0) {
            let updatedDot = this._dotArray[idIndex];
            updatedDot.x = x;
            updatedDot.y = y;
            updatedDot.vertex = this._wheelProcessorHelper.GetSphereVertext(updatedDot.vertex, x, y, this.radius, this._sphereSteps, this.GetDotColors.bind(this) );
            this._dotArray[idIndex] = updatedDot;
        }
    }

    Process() : VertexAttributeType[]{
        return this._dotArray.map(x=>x.vertex);
    }

    private GetDotColors(t1 : PiePieceType, t2 : PiePieceType, t3 : PiePieceType) : number[][] {
        return [this._cacheColor,this._cacheColor,this._cacheColor];
    }
}

export default DotProcessor