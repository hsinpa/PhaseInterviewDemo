import WebGLCanvas from '../Hsinpa/WebGL/WebglCanvas';
import {ColorWheelConfig} from './ColorWheelTypes';
import WebglUtility from '../Hsinpa/WebGL/WebglUtility';
import REGL, {Regl} from 'regl';
import {CreateREGLCommandObj, ExecuteREGLCommand} from './ColorWheelRegl';

import PolygonProcessor from './Processor/PolygonProcessor';
import ColorWheelProcessor from './Processor/ColorWheelProcessor';
import InputProcessor from './Processor/InputProcessor';

import CanvasInputHandler from './InputHandler/CanvasInputHandler';


class ColorWheel extends WebGLCanvas{
    webglUtility : WebglUtility;
    reglDrawCommand : REGL.DrawCommand;
    reglFrame : REGL.Cancellable;

    polygonProcessor : PolygonProcessor;
    colorWheelProcessor : ColorWheelProcessor;
    inputProcessor : InputProcessor;
    inputHandler : CanvasInputHandler;

    constructor( config: ColorWheelConfig) {
        super(config.canvas_query, config.canvas_width, config.canvas_height);
        this.webglUtility = new WebglUtility();
        
        this.polygonProcessor = new PolygonProcessor(this, this._webglDom, config.polygons);
        this.colorWheelProcessor = new ColorWheelProcessor(this, this._webglDom,  config.colorWheel,4.0); 
        this.inputProcessor = new InputProcessor(this, this._webglDom, this.polygonProcessor, this.colorWheelProcessor); 
        
        this.inputHandler = new CanvasInputHandler(this._webglDom);

        this.InitProcess(config.vertex_path, config.frag_path);
    }

    async InitProcess(vertexFilePath : string, fragmentFilePath : string) {
        await this.SetupWebglPipeline(vertexFilePath, fragmentFilePath);

        //Draw the image in first frame
        this.DrawREGLCavnas();
    }

    async SetupWebglPipeline(vertexFilePath : string, fragmentFilePath : string) {
        this._reglContext  = await this.CreatREGLCanvas (this._webglDom);        
        let glslSetting = await this.webglUtility.PrepareREGLShader(vertexFilePath, fragmentFilePath);
        this.reglDrawCommand  = await CreateREGLCommandObj(this._reglContext, glslSetting.vertex_shader, glslSetting.fragment_shader);
    }

    DrawREGLCavnas() {
        this._reglContext.clear({
            color: [0, 0, 0, 1],
            depth: 1
        });

        //Process Control dot
        let dotVertexs = this.colorWheelProcessor.dotProcessor.Process();
        let dotCount = dotVertexs.length;
        for (let i = 0; i < dotCount; i++)
            ExecuteREGLCommand(this._reglContext, this.reglDrawCommand, dotVertexs[i]);

        //Process Color Wheel
        let wheelVertex = this.colorWheelProcessor.ProcessWheel(48);
        ExecuteREGLCommand(this._reglContext, this.reglDrawCommand, wheelVertex);

        //Process Color Bar
        let colorBarVertex = this.colorWheelProcessor.ProcessValueBar();
        ExecuteREGLCommand(this._reglContext, this.reglDrawCommand, colorBarVertex);

        //Process All custom polygon shape
        this.polygonProcessor.Reset();
        while (this.polygonProcessor.IsNextProcessValid()) {
            let polygonVertex = this.polygonProcessor.Process();
            ExecuteREGLCommand(this._reglContext, this.reglDrawCommand, polygonVertex);
        }
    }
}

export default ColorWheel;