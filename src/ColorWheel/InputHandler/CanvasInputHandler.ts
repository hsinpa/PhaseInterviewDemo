import { IntVector2 } from '../../Hsinpa/UniversalType';
import { VectorDistance } from '../../Hsinpa/UtilityMethod';
import { CustomEventTypes } from '../ColorWheelTypes';

class InputHandler {
    
    private _webglCanvas : HTMLCanvasElement;

    private _isMouseDown : boolean;
    private _startMousePosition : IntVector2;
    private _dragRange : number = 5;
    private _delayEvent : number = 10; // 1000 = 1s
    private _lastEventTime : number = 0;

    constructor(webglCanvas: HTMLCanvasElement) {
        this._webglCanvas = webglCanvas;
    
        this._webglCanvas.addEventListener('mousedown', this.OnMouseDown.bind(this));
        this._webglCanvas.addEventListener('mouseup', this.OnMouseUp.bind(this));
        this._webglCanvas.addEventListener('mousemove', this.OnMouseMove.bind(this));
    }

    private OnMouseDown(e : MouseEvent) {
        this._startMousePosition = this.GetMousePosVector(e);
        this._isMouseDown = true;

        this._webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.MouseDownEvent,  { detail: this._startMousePosition }))
    }

    private OnMouseMove(e : MouseEvent) {
        
        if (!this._isMouseDown) return;

        if (e.timeStamp < this._lastEventTime) return;

        let mousePos = this.GetMousePosVector(e);

        this._webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.MouseDragEvent,  { detail: mousePos }))

        this._lastEventTime = e.timeStamp + this._delayEvent;
    }

    private OnMouseUp(e : MouseEvent) {
        this._isMouseDown = false;
        this._webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.MouseUpEvent,  { detail: this.GetMousePosVector(e) }))
    }

    private GetMousePosVector(e : MouseEvent) {
        //In order to match canvas coordinate system
        let clickYPos = this._webglCanvas.height - e.y;
        let clickXPos = e.x;
        
        return {x : clickXPos, y : clickYPos};
    }
}

export default InputHandler;