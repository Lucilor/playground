import {Point} from "@lucilor/utils";
import {DrawerConfig, Drawer} from "@src/app/components/drawer/drawer";
import {
    BufferGeometry,
    LineBasicMaterial,
    Float32BufferAttribute,
    Vector2,
    Vector3,
    LineSegments,
    Line,
    ShapeGeometry,
    ArcCurve,
    Shape,
    Mesh,
    MeshBasicMaterial,
    Plane,
    Clock
} from "three";
import {BezierCurve} from "./bezier-curve";
import {fitCurve} from "./fit-curve";

export interface BezierDrawerConfig extends DrawerConfig {
    duration: number;
    maxErrors: number;
    hidePoints: boolean;
}

export class BezierDrawer extends Drawer {
    curves: BezierCurve[] = [];
    get curve() {
        if (this.curves.length < 1) {
            this.curves.push(new BezierCurve());
        }
        return this.curves[0];
    }
    objects: {ctrl: LineSegments; curve: Line; curve2: Line};
    config: BezierDrawerConfig = {
        width: 300,
        height: 150,
        backgroundColor: 0,
        backgroundAlpha: 1,
        showStats: true,
        duration: 3000,
        maxErrors: 20,
        hidePoints: false
    };
    paused = false;
    loop = false;
    pointerPositions: Point[] = [];
    points: Point[] = [];
    private _stoped = false;
    private _currentTime = 0;
    private _geometries = {
        point: new ShapeGeometry(new Shape(new ArcCurve(0, 0, 0.5, 0, Math.PI * 2, true).getPoints(64)))
    };
    private _materials = {point: new MeshBasicMaterial()};
    private _clock = new Clock(false);
    private _drawing = false;

    private _mode: "ctrlPoints" | "fitCurve" | "fitPoints" = "ctrlPoints";
    get mode() {
        return this._mode;
    }
    set mode(value) {
        this._mode = value;
        this.reset();
    }

    constructor(config: Partial<BezierDrawerConfig> = {}) {
        super(config);
        this.config = {...this.config, ...config};
        const {controls, scene, camera} = this;
        this._materials.point.setValues({
            color: this._correctColor(0xcccccc)
        });
        controls.enableRotate = false;
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);

        const ctrl = new LineSegments(new BufferGeometry(), new LineBasicMaterial({color: this._correctColor(0xcccccc)}));
        const curve = new Line(new BufferGeometry(), new LineBasicMaterial({color: this._correctColor(0xff0000)}));
        const curve2 = new Line(new BufferGeometry(), new LineBasicMaterial({color: this._correctColor(0x00ff00)}));
        curve.renderOrder = 1;
        this.objects = {ctrl, curve, curve2};
        scene.add(ctrl, curve, curve2);
        this.controls.enablePan = false;
        this.controls.enableZoom = false;
        // console.log(this);
    }

    private _updateCtrlGeo() {
        const {objects, _currentTime, _geometries, _materials} = this;
        const duration = this.config.duration;
        const ctrlGeometry = objects.ctrl.geometry as BufferGeometry;
        let groups: Point[][] = [];
        const ctrlPosition: number[] = [];
        if (this.config.hidePoints) {
            groups = [];
        } else {
            if (this.mode === "ctrlPoints") {
                groups = this.curve.deCasteljau(_currentTime / duration);
            } else {
                groups = [this.points];
            }
        }

        let childIndex = 0;
        groups.forEach((group) => {
            group.forEach((point, i) => {
                if (i < group.length - 1) {
                    ctrlPosition.push(point.x, point.y, 0);
                    ctrlPosition.push(group[i + 1].x, group[i + 1].y, 0);
                }
                if (!objects.ctrl.children[childIndex]) {
                    const mesh = new Mesh(_geometries.point, _materials.point);
                    mesh.userData.index = childIndex;
                    objects.ctrl.children[childIndex] = mesh;
                }
                objects.ctrl.children[childIndex].position.set(point.x, point.y, 0);
                childIndex++;
            });
        });
        const toRemove = objects.ctrl.children.slice(childIndex, objects.ctrl.children.length);
        objects.ctrl.remove(...toRemove);
        setGeoPos(ctrlGeometry, ctrlPosition);
    }

    private _updateCurveGeo() {
        const {objects, _currentTime} = this;
        const duration = this.config.duration;
        const curveGeometry = objects.curve.geometry as BufferGeometry;
        if (_currentTime <= 0) {
            setGeoPos(curveGeometry, []);
            return;
        }
        const curvePosition = Array.from(curveGeometry.getAttribute("position")?.array || []);
        let point: Point | undefined;
        if (this.mode === "ctrlPoints") {
            point = this.curve.getPoint(_currentTime / duration);
        } else {
            const curves = this.curves;
            const count = curves.length;
            let t = (_currentTime / duration) * count;
            let index = Math.floor(t);
            if (index < count) {
                t -= index;
            } else {
                index = count - 1;
                t = 1;
            }
            point = curves[index]?.getPoint(t);
        }
        if (point) {
            curvePosition.push(point.x, point.y, 0);
            setGeoPos(curveGeometry, curvePosition);
        }
    }

    update() {
        const {_stoped, loop, paused, _clock} = this;
        if (!this.objects) {
            return;
        }
        const duration = this.config.duration;
        if (_stoped) {
            // ctrlGeometry.setAttribute("position", new Float32BufferAttribute([], 3));
            // curveGeometry.setAttribute("position", new Float32BufferAttribute([], 3));
            // objects.ctrl.remove(...objects.ctrl.children);
            if (loop) {
                this.start();
            }
        } else if (paused) {
            _clock.stop();
        } else {
            if (!_clock.running) {
                _clock.start();
            }
            if (this._currentTime > duration) {
                this._currentTime = duration;
            }
            this._updateCtrlGeo();
            this._updateCurveGeo();
            if (this._currentTime >= duration) {
                this._currentTime = 0;
                this._stoped = true;
                _clock.stop();
            } else {
                this._currentTime += _clock.getDelta() * 1000;
            }
        }
    }

    protected _getIntersection(point: Vector2) {
        const {_raycaster, camera, objects} = this;
        _raycaster.setFromCamera(this._getNDC(point), camera);
        const intersects = _raycaster.intersectObjects([objects.ctrl], true);
        if (intersects.length) {
            this._object = intersects[0].object;
        } else if (!this._dragging) {
            this._object = null;
        }
        return this._object;
    }

    protected _click(point: Vector2) {
        super._click(point);
        if (!this._dragging) {
            if (this.mode === "ctrlPoints") {
                this.updateCtrlPoint(point);
            } else if (this.mode === "fitPoints") {
                this.updateFitPoint(point);
            }
            this.start();
        }
    }

    protected _pointerDown(event: PointerEvent) {
        super._pointerDown(event);
        if (this.mode === "fitCurve") {
            this._drawing = true;
        }
    }

    protected _pointerMove(event: PointerEvent) {
        super._pointerMove(event);
        const point = new Vector2(event.clientX, event.clientY);
        if (this._dragging && this._object) {
            const index = this._object.userData.index;
            if (this.mode === "ctrlPoints") {
                this.updateCtrlPoint(point, index);
            } else if (this.mode === "fitPoints") {
                this.updateFitPoint(point, index);
            }
            this.start();
        } else if (this._drawing) {
            if (this.mode === "fitCurve") {
                this.updateFitCurve(point).start();
            }
        }
    }

    protected _pointerUp(event: PointerEvent) {
        super._pointerUp(event);
        this._drawing = false;
    }

    private _getPoint(point: Vector2): Vector3;
    private _getPoint(point: Point): Point;
    private _getPoint(point: Vector2 | Point) {
        const {_raycaster, camera} = this;
        if (point instanceof Point) {
            const result = this._getPoint(new Vector2(point.x, point.y));
            return new Point(result);
        } else {
            _raycaster.setFromCamera(this._getNDC(point), camera);
            const plane = new Plane(new Vector3(0, 0, 1));
            const result = new Vector3();
            _raycaster.ray.intersectPlane(plane, result);
            return result;
        }
    }

    start() {
        this._stoped = false;
        this._currentTime = 0;
        this.paused = false;
        this._clock.stop();
        return this;
    }

    stop() {
        this._stoped = true;
        this._currentTime = 0;
        this.paused = true;
        this._clock.stop();
        return this;
    }

    reset() {
        this.curves.length = 0;
        this.points.length = 0;
        this.pointerPositions.length = 0;
        const curve2Geometry = this.objects.curve2.geometry as BufferGeometry;
        setGeoPos(curve2Geometry, []);
        return this.start();
    }

    private _updatePointPositions(point: Vector2 | null, index = -1) {
        const _pointerPositions = this.pointerPositions;
        if (point) {
            if (index >= 0 && index <= _pointerPositions.length) {
                _pointerPositions[index].set(point.x, point.y);
            } else {
                _pointerPositions.push(new Point(point));
            }
        } else {
            _pointerPositions.splice(index, 1);
        }
    }

    updateCtrlPoint(point: Vector2 | null, index = -1) {
        this._updatePointPositions(point, index);
        this.curve.ctrlPoints = this.pointerPositions.map((p) => this._getPoint(p));
        return this;
    }

    updateFitPoint(point: Vector2 | null, index = -1) {
        const {curves, pointerPositions: _pointerPositions} = this;
        this._updatePointPositions(point, index);
        curves.length = 0;
        const count = _pointerPositions.length;
        this.points = _pointerPositions.map((p) => this._getPoint(p));
        if (count < 3) {
            curves.push(new BezierCurve(this.points));
        } else {
            const ctrlPoints = calcCtrlPoints(_pointerPositions);
            for (let i = 0; i < count - 1; i++) {
                const p1 = _pointerPositions[i];
                const p2 = _pointerPositions[i + 1];
                let arr: Point[];
                if (i === 0) {
                    arr = [p1, ctrlPoints[i * 2 + 2], p2];
                } else if (i === count - 2) {
                    arr = [p1, ctrlPoints[i * 2 + 1], p2];
                } else {
                    arr = [p1, ctrlPoints[i * 2 + 1], ctrlPoints[i * 2 + 2], p2];
                }
                curves.push(new BezierCurve(arr.map((v) => this._getPoint(v))));
            }
        }
        return this;
    }

    updateFitCurve(point?: Vector2) {
        if (point) {
            this._updatePointPositions(point);
            const curve2Geometry = this.objects.curve2.geometry as BufferGeometry;
            const curve2Position = Array.from(curve2Geometry.getAttribute("position")?.array || []);
            const p = this._getPoint(point);
            curve2Position.push(p.x, p.y, 0);
            setGeoPos(curve2Geometry, curve2Position);
        }
        this.curves = fitCurve(
            this.pointerPositions.map((v) => v.toArray()),
            this.config.maxErrors
        ).map((pts) => new BezierCurve(pts.map((vv) => this._getPoint(new Point(vv)))));
        this.points.length = 0;
        this.curves.forEach((curve, i) => {
            curve.ctrlPoints.forEach((v) => this.points.push(v.clone()));
        });
        return this;
    }
}

const setGeoPos = (geometry: BufferGeometry, points: number[]) => {
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
};

const calcCtrlPoints = (points: Point[]) => {
    const length = points.length;
    if (length < 3) {
        throw new Error("require at least 3 points");
    }
    const distance = (x1: number, y1: number, x2: number, y2: number) => new Point(x1, y1).distanceTo(new Point(x2, y2));
    const result: Point[] = [];
    for (let i = 0; i < length; i++) {
        const prev = (i - 1 + length) % length;
        const next = (i + 1) % length;
        const x1 = points[prev].x;
        const y1 = points[prev].y;
        const x2 = points[i].x;
        const y2 = points[i].y;
        const x3 = points[next].x;
        const y3 = points[next].y;
        const x4 = (x2 + x1) / 2;
        const y4 = (y2 + y1) / 2;
        const x5 = (x3 + x2) / 2;
        const y5 = (y3 + y2) / 2;
        const l1 = distance(x1, y1, x2, y2);
        const l2 = distance(x2, y2, x3, y3);
        const l3 = distance(x4, y4, x5, y5);
        const k = l1 / l2;
        const l4 = (l3 * k) / (k + 1);
        const a = Math.atan((y5 - y4) / (x5 - x4));
        let x6 = x4 + l4 / Math.cos(a);
        let y6 = y4 + l4 / Math.sin(a);
        for (let j = 0; j < x5; j += 0.1) {
            const x = x4 + j;
            const y = ((y5 - y4) * x - x4 * y5 + x5 * y4) / (x5 - x4);
            if (Math.abs(distance(x, y, x4, y4) - l4) < 0.1) {
                x6 = x;
                y6 = y;
                break;
            }
        }
        const offsetX = x6 - x2;
        const offsetY = y6 - y2;
        const cp1 = new Point(x4 - offsetX, y4 - offsetY);
        const cp2 = new Point(x5 - offsetX, y5 - offsetY);
        result.push(cp1);
        result.push(cp2);
    }
    return result;
};
