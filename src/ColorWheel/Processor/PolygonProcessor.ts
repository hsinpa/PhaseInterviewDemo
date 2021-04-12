import {PolygonType} from '../ColorWheelTypes';
import {VertexAttributeType, ShapeType, CustomEventTypes} from '../ColorWheelTypes';
import ColorWheel from '../ColorWheel';
import {VectorToArray, VectorNumScale, ArrayToVector} from '../../Hsinpa/UtilityMethod';
import { IntVector2 } from '../../Hsinpa/UniversalType';
import {TriangleCollide} from '../../Hsinpa/WebGL/WebglStatic';
import {Dictionary} from 'typescript-collections';
import {CreateVertexAttributeType} from './WheelProcessorHelper';

class PolygonProcessor {
    private rawPolygons : PolygonType[];
    private cachePolygonLookupTable : Dictionary<string, VertexAttributeType>;

    private index : number = 0;
    private count : number = 0;
    private colorWheel : ColorWheel;
    private webglCanvas: HTMLCanvasElement;

    private _selectedPolygon : PolygonType;

    public get selectPolygon() {
        return this._selectedPolygon;
    }

    constructor(colorWheel : ColorWheel, webglCanvas: HTMLCanvasElement, polygons : PolygonType[]) {
        this.colorWheel = colorWheel;
        this.webglCanvas = webglCanvas;
        this.rawPolygons = polygons;
        this.count = this.rawPolygons.length;
        this.cachePolygonLookupTable = new Dictionary<string, VertexAttributeType>();
    }

    //Process one per time
    Process() : VertexAttributeType {
        let polyType = this.rawPolygons[this.index];
        this.index++;

        let cacheVertex = this.cachePolygonLookupTable.getValue(polyType.id);
        
        if (cacheVertex != null) {
            cacheVertex.mainColor = polyType.color;
            return cacheVertex;
        }

        let enableBorder = this.selectPolygon != null && this.selectPolygon.id == polyType.id;

        let vertexType = CreateVertexAttributeType(ShapeType.Polygon, enableBorder);
        
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

            vertexType.vertexColor.push(polyType.color);

            vertexType.uv.push(VectorToArray(uv));
        }
        
        vertexType.count = polygonCount;
                
        return vertexType;
    }

    IsNextProcessValid() : boolean {
        return this.index < this.count;
    }

    Reset() {
        this.index = 0;
    }

    private LocalVertexPosToWorld(rawLocalPos : number[], offset_x : number, offset_y : number, scale : number) : IntVector2{
        let worldX = (rawLocalPos[0] * scale) + offset_x;
        let worldY = (rawLocalPos[1] * scale) + offset_y;

        return {x : worldX, y : worldY}
    }

    //#region Input Event
    public DeselectPolygon() {
        let deselected_id = this._selectedPolygon.id;

        this._selectedPolygon = null;

        this.webglCanvas.dispatchEvent(new CustomEvent(CustomEventTypes.DeselectPolygonEvent,  { detail: deselected_id }));
    }

    public SelectPolygon(polygon : PolygonType) {
        this._selectedPolygon = polygon;
    }

    public ChangePolygonColor(poly_id : string, color : number[]) {
        let index = this.rawPolygons.findIndex(x=>x.id == poly_id);

        if (index < 0) return;

        this.rawPolygons[index].color = color;
    }

    public CheckAndExecutePolygonCollision(mouse : IntVector2) : boolean {
        let collidePolygon = this.FindCollidePolygon(mouse);
        if (collidePolygon != null) {
            //console.log(`Click on Polygon id ${collidePolygon.id}`);

            if (this.selectPolygon == null ||
                (this.selectPolygon != null && collidePolygon.id != this.selectPolygon.id)) {
                this.SelectPolygon(collidePolygon);
            }
        } else {
            //Only response when its already select
            if (this.selectPolygon != null)
                this.DeselectPolygon();            
        }

        return collidePolygon != null;
    }

    private FindCollidePolygon(mousePos : IntVector2) : PolygonType{
        let polygonCount = this.rawPolygons.length;
        for (let i = 0 ; i < polygonCount; i++) {
            if (this.rawPolygons[i].ignoreRaycast) continue;

            let isCollide = this.CheckCollision(this.rawPolygons[i], mousePos);

            if (isCollide)
                return this.rawPolygons[i];
        }

        return null;
    }

    private CheckCollision(polygon : PolygonType, mousePos : IntVector2) : boolean{

        for (let i = 0; i < polygon.points.length; i += 3) {
            
            let t1 = this.LocalVertexPosToWorld(polygon.points[i], polygon.x, polygon.y, polygon.scale);
            let t2 = this.LocalVertexPosToWorld(polygon.points[i + 1], polygon.x, polygon.y, polygon.scale);
            let t3 = this.LocalVertexPosToWorld(polygon.points[i + 2], polygon.x, polygon.y, polygon.scale);

            let isWithin = TriangleCollide(mousePos, t1, t2, t3);

            if (isWithin) return true;
        }

        return false;
    }

    //#endregion

}
export default PolygonProcessor;
