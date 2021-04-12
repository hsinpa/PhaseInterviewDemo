import {PolygonType} from '../ColorWheelTypes';
import {VertexAttributeType, ShapeType, CustomEventTypes} from '../ColorWheelTypes';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorNumScale} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import {TriangleCollide} from '../../Hsinpa/WebGL/WebglStatic';
import {Dictionary} from 'typescript-collections';

class PolygonProcessor {
    private rawPolygons : PolygonType[];
    private cachePolygonLookupTable : Dictionary<string, VertexAttributeType>;

    private index : number = 0;
    private count : number = 0;
    private colorWheel : ColorWheel;
    private webglCanvas: HTMLCanvasElement;

    constructor(colorWheel : ColorWheel, webglCanvas: HTMLCanvasElement, polygons : PolygonType[]) {
        this.colorWheel = colorWheel;
        this.webglCanvas = webglCanvas;
        this.rawPolygons = polygons;
        this.count = this.rawPolygons.length;
        this.cachePolygonLookupTable = new Dictionary<string, VertexAttributeType>();
        this.webglCanvas.addEventListener(CustomEventTypes.MouseDownEvent, this.OnMouseClick.bind(this));
    }

    //Process one per time
    Process() : VertexAttributeType {
        let polyType = this.rawPolygons[this.index];

        let vertexType : VertexAttributeType = {
            position : [],
            color : [],
            uv : [],
            enableBorder : false,
            type : ShapeType.Polygon,
            count : 0
        }

        let polygonCount = polyType.points.length;
        for (let i = 0; i < polygonCount; i++) {
            let localVertexPosition : IntVector2 = { x : polyType.points[i][0], y :polyType.points[i][1] } // Screen Coordinate
            let uv : IntVector2 = { x : (localVertexPosition.x + 1) * 0.5, y : (localVertexPosition.y + 1) * 0.5 } // Scale from -1~+1 to 0~1 
            let vertexPosition : IntVector2 = VectorNumScale(localVertexPosition, polyType.scale);

            //Offset
            vertexPosition.x += polyType.x;
            vertexPosition.y += polyType.y;

            vertexPosition = this.colorWheel.ScreenPositionToClipSpace(vertexPosition.x, vertexPosition.y); //Clip space

            vertexType.position.push(VectorToArray(vertexPosition));
            vertexType.color.push(polyType.color);
            vertexType.uv.push(VectorToArray(uv));
        }
        
        vertexType.count = polygonCount;
        
        this.index++;
        
        return vertexType;
    }

    IsNextProcessValid() : boolean {
        return this.index < this.count;
    }

    Reset() {
        this.index = 0;
    }

    private GetVertexById(id : string) {
        let cacheVertex = this.cachePolygonLookupTable.getValue(id);
        
        if (cacheVertex != null && cacheVertex != undefined) {
            return cacheVertex;
        }

        let vertexType : VertexAttributeType = {
            position : [],
            color : [],
            uv : [],
            enableBorder : false,
            type : ShapeType.Polygon,
            count : 0
        }

        return vertexType;
    }

    //#region Input Event
    public OnMouseClick(e : CustomEvent) {
        let mouse : IntVector2 = e.detail;


    }

    //#endregion

}
export default PolygonProcessor;
