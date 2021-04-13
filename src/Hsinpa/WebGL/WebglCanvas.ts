
import REGL, {Regl} from 'regl';
import {IntVector2} from '../UniversalType';

const reglPromise = import('regl');

abstract class WebglCanvas {
    protected _webglDom : HTMLCanvasElement;
    protected _reglContext : Regl;

    protected screenHeight : number;
    protected screenWidth : number;

    public IsProgramValid : boolean = false;

    constructor(webglQuery : string, canvasWidth : number, canvasHeight : number) {
        this._webglDom = document.querySelector(webglQuery);

        this.IsProgramValid = this._webglDom != null;

        if (this.IsProgramValid) {
            this.RegisterDomEvent();    
            this.SetCanvasSize(canvasWidth, canvasHeight);
        }
    }

    protected RegisterDomEvent() {
        window.addEventListener('resize', () => {
            //this.SetCanvasSize(window.innerWidth, window.innerHeight);
        });
    }

    protected async CreatREGLCanvas(webglDom : HTMLCanvasElement) {
        let regl = await reglPromise;

        return regl.default({
            canvas : webglDom,
            //attributes : {preserveDrawingBuffer : true}
        });
    }

    protected SetCanvasSize(canvasWidth : number, canvasHeight : number) {
        //this.SetCanvasToSceenSize(this._webglDom);
        this.screenHeight = canvasHeight;
        this.screenWidth = canvasWidth;
        this._webglDom.width = canvasWidth;
        this._webglDom.height = canvasHeight;
    }

    // Clip position is -1 to +1
    public ScreenPositionToClipSpace(x : number, y : number) : IntVector2{
        let scaleX = (x / this.screenWidth) * 2 - 1;
        let scaleY = (y / this.screenHeight) * 2 - 1;

        return {x : scaleX, y: scaleY};    
    }

    public ClipSpaceToScreenPosition(x : number, y : number) : IntVector2{
        let scaleX = (x + 1 * 0.5) * this.screenWidth;
        let scaleY = (y + 1 * 0.5 ) * this.screenWidth;

        return {x : scaleX, y: scaleY};    
    }

    //Don't read this in update loop
    public ReadPixel(x : number, y : number) : number[] {
        return Array.from( this._reglContext.read({
            x: x,
            y: y,
            width: 1,
            height: 1,
            data: new Uint8Array(4)
        })).map(x=> x / 255);
    }
}

export default WebglCanvas;