import {PolygonType} from '../ColorWheelTypes';
import {VertexAttributeType, ShapeType, CustomEventTypes} from '../ColorWheelTypes';
import ColorWheel from '../ColorWheel';
import ColorWheelProcessor from './ColorWheelProcessor';
import PolygonProcessor from './PolygonProcessor';

import {VectorToArray, VectorNumScale, ArrayToVector, RoundToDecimal} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import {rgb2hsv, rgbToHex} from '../../Hsinpa/WebGL/WebglStatic';

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

        this._webglCanvas.addEventListener(CustomEventTypes.OnDominateColorEvent, this.OnDominateColorChange.bind(this));
        
        this.SetDominateColorInfo(this._colorWheelProcessor.dominateColor);
    }

    private OnDominateColorChange(e : CustomEvent) {
        this.SetDominateColorInfo(e.detail);
    }

    private SetDominateColorInfo(color : number[]) {
        let colorInfoDomQuery = ".control_panel .color_info";
        let dom : HTMLBodyElement = document.querySelector(colorInfoDomQuery);
        
        let scaledR = Math.ceil(color[0]*255), scaleG = Math.ceil(color[1]*255), scaleB = Math.ceil(color[3]*255), scaleA = Math.ceil(color[3]*255);
        let coloInfoTemplate = `
        RGBA: rgb(${RoundToDecimal(color[0],2 )}, ${RoundToDecimal(color[1],2)},${RoundToDecimal(color[2],2)},${RoundToDecimal(color[3],2)})</br>
        RGBA: rgb(${scaledR}, ${scaleG},${scaleB}, ${scaleA})</br>
        HEX: ${rgbToHex(scaledR, scaleG, scaleB)}`;
        
        dom.innerHTML = coloInfoTemplate;
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

        //Color Wheel Mouse Event
        if (isColorWheelActive) {

            this.SynchorizeColors(this._colorWheelProcessor.dominateColor);

            this._mainApp.DrawREGLCavnas();
            return;
        }

        //Value Bar Mouse Event
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
                { radian : hsv[0], saturation : hsv[1], value: hsv[2]
             });
                            
            this._mainApp.DrawREGLCavnas();
            return;
        }
    }
}

export default InputProcessor;