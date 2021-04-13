import {ColorWheelConfig, ColorWheelMode, CustomEventTypes, CustomIDString, PolygonType, VertexAttributeType} from '../ColorWheelTypes';
import ColorWheel from '../ColorWheel';
import ColorWheelProcessor from './ColorWheelProcessor';
import PolygonProcessor from './PolygonProcessor';
import {InputState} from '../InputHandler/CanvasInputHandler';

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
        this._webglCanvas.addEventListener(CustomEventTypes.OnColorEvent, this.OnWheelColorChange.bind(this));
        
        this.SetWheelColorInfo(CustomIDString.DominateColorTitle, this._colorWheelProcessor.dominateColor);
        this.RegisterGradientCheckboxEvent();
    }

    private RegisterGradientCheckboxEvent() {
        let linearGradientDomQuery : HTMLInputElement = document.querySelector(".control_panel .linear_gradient");
        let radialGradientDomQuery : HTMLInputElement = document.querySelector(".control_panel .radial_gradient");
        radialGradientDomQuery.addEventListener("change",this.OnGradientCheckboxEvent.bind(this) );
        linearGradientDomQuery.addEventListener("change",this.OnGradientCheckboxEvent.bind(this) );

    }

    private OnGradientCheckboxEvent(e: any) {
        let polyVertexType = this._polygonProcessor.FindPolygonVertexByID(this._polygonProcessor.selectPolygon.id);

        let hasNewChange = false;

        if (e.target.name == "radial_gradient" && polyVertexType.enableRadialGradient != e.target.checked) {
            polyVertexType.enableRadialGradient = e.target.checked;
            hasNewChange = true;
        }

        if (e.target.name == "linear_gradient" && polyVertexType.enableLinearGradient != e.target.checked) {
            polyVertexType.enableLinearGradient = e.target.checked;
            hasNewChange = true;
        }
        
        if (!polyVertexType.enableRadialGradient && !polyVertexType.enableLinearGradient)
            this._colorWheelProcessor.dotProcessor.RemoveDot(CustomIDString.GradientDot);

        this.SetPolygonColorInfo(polyVertexType);

        if (hasNewChange)
            this._mainApp.DrawREGLCavnas();
    }

    private OnWheelColorChange(e : CustomEvent) {
        this.SetWheelColorInfo(e.detail.title, e.detail.color);
    }

    private SetWheelColorInfo(colorTitle : string, color : number[]) {
        let colorInfoDomQuery = ".control_panel .color_info";
        let dom : HTMLBodyElement = document.querySelector(colorInfoDomQuery);
        
        let scaledR = Math.ceil(color[0]*255), scaleG = Math.ceil(color[1]*255), scaleB = Math.ceil(color[3]*255), scaleA = Math.ceil(color[3]*255);
        let coloInfoTemplate = `
        <h4>${colorTitle}</h4>
        <p>
        RGBA: rgb(${RoundToDecimal(color[0],2 )}, ${RoundToDecimal(color[1],2)},${RoundToDecimal(color[2],2)},${RoundToDecimal(color[3],2)})</br>
        RGBA: rgb(${scaledR}, ${scaleG},${scaleB}, ${scaleA})</br>
        HEX: ${rgbToHex(scaledR, scaleG, scaleB)}</p>`;
        
        dom.innerHTML = coloInfoTemplate;
    }

    private ShowGradientHTMLTable(isShow : boolean, linearGradient : boolean = false, radialGradient : boolean = false) {
        let gradientHolderDomQuery : HTMLBodyElement = document.querySelector(".control_panel .gradient_panel");
        let linearGradientDomQuery : HTMLInputElement = document.querySelector(".control_panel .linear_gradient");
        let radialGradientDomQuery : HTMLInputElement = document.querySelector(".control_panel .radial_gradient");

        gradientHolderDomQuery.style.display = (isShow) ? "inline" : "none";

        if (isShow) {
            linearGradientDomQuery.checked = linearGradient;
            radialGradientDomQuery.checked = radialGradient;
        }
    }

    private SynchorizeColors(color : number[], supportColor : number[]) {
        if (this._polygonProcessor.selectPolygon != null) {
            this._polygonProcessor.ChangePolygonColor(this._polygonProcessor.selectPolygon.id, color, supportColor);
        }
    }

    private OnMouseClick(e : CustomEvent) {
        let mouse : IntVector2 = e.detail;
        this.OnMouseEvent(mouse, InputState.MouseDown);
    }
    
    private OnMouseDrag(e : CustomEvent) {
        let mouse : IntVector2 = e.detail;
        this.OnMouseEvent(mouse, InputState.MouseDrag);
    }

    private OnPolygonDeselect(e : CustomEvent) {
        this.ShowGradientHTMLTable(false);

        this._colorWheelProcessor.SetColorWheelByRGB(CustomIDString.DominateDot, this._colorWheelProcessor.dominateColor);
        this._colorWheelProcessor.SetMode(ColorWheelMode.Normal);
        this._colorWheelProcessor.dotProcessor.RemoveDot(CustomIDString.GradientDot);
        this._mainApp.DrawREGLCavnas();
    }

    private OnMouseEvent(mouse : IntVector2, inputState : InputState) {

        //Value Bar Mouse Event
        let isValueBarActive = this._colorWheelProcessor.CheckAndExecuteValueBarCollision(mouse);
        if (isValueBarActive) {
            this.SynchorizeColors(this._colorWheelProcessor.dominateColor, this._colorWheelProcessor.supportColor);

            this._mainApp.DrawREGLCavnas();
            return;
        }

        //Support Dot
        let isSupportDotActive = this._colorWheelProcessor.dotProcessor.CheckDotCollision(CustomIDString.GradientDot, mouse.x, mouse.y);
        if (isSupportDotActive && inputState == InputState.MouseDown) {
            this._colorWheelProcessor.SetMode(ColorWheelMode.Gradient);
            this._colorWheelProcessor.SetColorWheelByMousePos(CustomIDString.GradientDot, mouse.x, mouse.y);
            //console.log("Click on support dot");
            this._mainApp.DrawREGLCavnas();
            return;
        }

        let isColorWheelActive = this._colorWheelProcessor.CheckAndExecuteColorWheelCollision(mouse);        
        //Color Wheel Mouse Event
        if (isColorWheelActive) {
            let colorMode = (this._colorWheelProcessor.mode == ColorWheelMode.Gradient && inputState == InputState.MouseDrag) ? ColorWheelMode.Gradient : ColorWheelMode.Normal;
            
            this._colorWheelProcessor.SetMode(colorMode);

            this._colorWheelProcessor.SetColorWheelByMousePos(this._colorWheelProcessor.ActiveDotID, mouse.x, mouse.y);

            this.SynchorizeColors(this._colorWheelProcessor.dominateColor, this._colorWheelProcessor.supportColor);

            this._mainApp.DrawREGLCavnas();
            return;
        }

        //Only handle click event later on
        if (inputState == InputState.MouseDrag) return;

        let isPolygonActive = this._polygonProcessor.CheckAndExecutePolygonCollision(mouse);
        if (isPolygonActive) {
            let polyVertexType = this._polygonProcessor.FindPolygonVertexByID(this._polygonProcessor.selectPolygon.id);

            this.SetPolygonColorInfo(polyVertexType);
        
            this.ShowGradientHTMLTable(true, polyVertexType.enableLinearGradient, polyVertexType.enableRadialGradient);
            this._mainApp.DrawREGLCavnas();
            return;
        }
    }

    SetPolygonColorInfo(polyVertexType : VertexAttributeType) {
        let isGradientEnable = polyVertexType.enableLinearGradient || polyVertexType.enableRadialGradient;

        if (isGradientEnable) {
            this._colorWheelProcessor.SetMode(ColorWheelMode.Gradient); // In order to update gradient color in color wheel
            let gradientHSV = rgb2hsv(polyVertexType.subColor[0],
                polyVertexType.subColor[1],
                polyVertexType.subColor[2]);
            
            this._colorWheelProcessor.SetColorWheelByHSV(CustomIDString.GradientDot,
                { radian : gradientHSV[0], saturation : gradientHSV[1], value: gradientHSV[2]
                });        
        } else {
            this._colorWheelProcessor.dotProcessor.RemoveDot(CustomIDString.GradientDot);
        }

        let hsv = rgb2hsv(this._polygonProcessor.selectPolygon.color[0],
            this._polygonProcessor.selectPolygon.color[1],
            this._polygonProcessor.selectPolygon.color[2]);   

        this._colorWheelProcessor.SetMode(ColorWheelMode.Normal);
        this._colorWheelProcessor.SetColorWheelByHSV(CustomIDString.DominateDot,
            { radian : hsv[0], saturation : hsv[1], value: hsv[2]
         });
    }
}

export default InputProcessor;