import { IntVector2 } from '../../Hsinpa/UniversalType';
import { CustomEventTypes } from '../ColorWheelTypes';
import EventSystem from '../../Hsinpa/EventSystem';

export enum InputState {
    MouseDown, MouseDrag, MouseUp
}

class InputHandler {
    
    private _webglCanvas : HTMLCanvasElement;

    private _isMouseDown : boolean;
    private _startMousePosition : IntVector2;
    private _delayEvent : number = 10; // 1000 = 1s
    private _lastEventTime : number = 0;

    private eventSystem : EventSystem;

    constructor(webglCanvas: HTMLCanvasElement, eventSystem : EventSystem) {
        this._webglCanvas = webglCanvas;
        this.eventSystem = eventSystem;
    
        this._webglCanvas.addEventListener('mousedown', this.OnMouseDown.bind(this));
        this._webglCanvas.addEventListener('mouseup', this.OnMouseUp.bind(this));
        this._webglCanvas.addEventListener('mousemove', this.OnMouseMove.bind(this));
    }

    private OnMouseDown(e : MouseEvent) {
        this._startMousePosition = this.GetMousePosVector(e);
        this._isMouseDown = true;

        this.eventSystem.Notify(CustomEventTypes.MouseDownEvent, {mousePosition : this._startMousePosition});
    }

    private OnMouseMove(e : MouseEvent) {
        
        if (!this._isMouseDown) return;

        if (e.timeStamp < this._lastEventTime) return;

        let mousePos = this.GetMousePosVector(e);

        this.eventSystem.Notify(CustomEventTypes.MouseDragEvent, {mousePosition : mousePos});

        this._lastEventTime = e.timeStamp + this._delayEvent;
    }

    private OnMouseUp(e : MouseEvent) {
        this._isMouseDown = false;
        
        this.eventSystem.Notify(CustomEventTypes.MouseUpEvent, {mousePosition : this.GetMousePosVector(e)});
    }

    private GetMousePosVector(e : MouseEvent) {
        //In order to match canvas coordinate system
        let clickYPos = this._webglCanvas.height - e.y;
        let clickXPos = e.x;
        
        return {x : clickXPos, y : clickYPos};
    }
}

export default InputHandler;