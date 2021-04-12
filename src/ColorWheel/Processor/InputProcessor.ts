import {PolygonType} from '../ColorWheelTypes';
import {VertexAttributeType, ShapeType, CustomEventTypes} from '../ColorWheelTypes';
import ColorWheel from '../ColorWheel';
import ColorWheelProcessor from './ColorWheelProcessor';
import PolygonProcessor from './PolygonProcessor';

import {VectorToArray, VectorNumScale, ArrayToVector} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import {rgb2hsv} from '../../Hsinpa/WebGL/WebglStatic';

class InputProcessor {

    private _mainApp : ColorWheel;
    private _webglCanvas : HTMLCanvasElement;
    private _polygonProcessor : PolygonProcessor;
    private _colorWheelProcessor : ColorWheelProcessor;

    constructor(mainApp : ColorWheel, webglCanvas: HTMLCanvasElement, polygonProcessor : PolygonProcessor, colorWheelProcessor : ColorWheelProcessor) {
        this._mainApp = mainApp;
        this._webglCanvas = webglCanvas;
        this._polygonProcessor = polygonProcessor;
        this._colorWheelProcessor = colorWheelProcessor;
    
        this._webglCanvas.addEventListener(CustomEventTypes.MouseDownEvent, this.OnMouseClick.bind(this));
        this._webglCanvas.addEventListener(CustomEventTypes.MouseDragEvent, this.OnMouseDrag.bind(this));
        this._webglCanvas.addEventListener(CustomEventTypes.DeselectPolygonEvent, this.OnPolygonDeselect.bind(this));
    }

    private SynchorizeColors(color : number[]) {
        if (this._polygonProcessor.selectPolygon != null) {
            this._polygonProcessor.ChangePolygonColor(this._polygonProcessor.selectPolygon.id, color);
        }
    }

    private OnMouseClick(e : CustomEvent) {
        let mouse : IntVector2 = e.detail;
        this.OnMouseEvent(mouse, false);
    }
    
    private OnMouseDrag(e : CustomEvent) {
        let mouse : IntVector2 = e.detail;
        this.OnMouseEvent(mouse, true);
    }

    private OnPolygonDeselect(e : CustomEvent) {
        this._mainApp.DrawREGLCavnas();
    }

    private OnMouseEvent(mouse : IntVector2, dragEvent : boolean) {

        let isColorWheelActive = this._colorWheelProcessor.CheckAndExecuteColorWheelCollision(mouse);

        if (isColorWheelActive) {

            this.SynchorizeColors(this._colorWheelProcessor.dominateColor);

            this._mainApp.DrawREGLCavnas();
            return;
        }

        let isValueBarActive = this._colorWheelProcessor.CheckAndExecuteValueBarCollision(mouse);
        if (isValueBarActive) {
            this.SynchorizeColors(this._colorWheelProcessor.dominateColor);

            this._mainApp.DrawREGLCavnas();
            return;
        }

        //Only handle click event later on
        if (dragEvent) return;

        let isPolygonActive = this._polygonProcessor.CheckAndExecutePolygonCollision(mouse);
        if (isPolygonActive) {

            let hsv = rgb2hsv(this._polygonProcessor.selectPolygon.color[0],
                this._polygonProcessor.selectPolygon.color[1],
                this._polygonProcessor.selectPolygon.color[2]);

            this._colorWheelProcessor.SetColorWheelByHSV(
                { radian : hsv[0],saturation : hsv[1], value: hsv[2]
             });
             
            console.log(hsv);
                
            this._mainApp.DrawREGLCavnas();
            return;
        }
    }
}

export default InputProcessor;