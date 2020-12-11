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

export interface BezierDrawerConfig extends DrawerConfig {
    duration: number;
}

export class BezierDrawer extends Drawer {
    curve = new BezierCurve();
    objects: {ctrl: LineSegments; curve: Line};
    config: BezierDrawerConfig = {
        width: 300,
        height: 150,
        backgroundColor: 0,
        backgroundAlpha: 1,
        showStats: true,
        duration: 3000
    };
    paused = false;
    loop = false;
    private _stoped = false;
    private _currentTime = 0;
    private _geometries = {
        point: new ShapeGeometry(new Shape(new ArcCurve(0, 0, 0.5, 0, Math.PI * 2, true).getPoints(64)))
    };
    private _materials = {point: new MeshBasicMaterial()};
    private _clock = new Clock(false);

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
        curve.renderOrder = 1;
        this.objects = {ctrl, curve};
        scene.add(ctrl, curve);
    }

    update() {
        const {config, curve, _currentTime, objects, _geometries, _materials} = this;
        const {_stoped, loop, paused, _clock} = this;
        if (!objects) {
            return;
        }
        const ctrlGeometry = objects.ctrl.geometry as BufferGeometry;
        const curveGeometry = objects.curve.geometry as BufferGeometry;
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
            const {duration} = config;
            const groups = curve.deCasteljau(_currentTime / duration);
            const ctrlPosition: number[] = [];
            const curvePosition = Array.from(curveGeometry.getAttribute("position")?.array || []);
            if (_currentTime <= 0) {
                curvePosition.length = 0;
            }
            if (!_clock.running) {
                _clock.start();
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
                if (group.length === 1) {
                    curvePosition.push(group[0].x, group[0].y, 0);
                }
            });
            const toRemoved = objects.ctrl.children.slice(childIndex, objects.ctrl.children.length);
            objects.ctrl.remove(...toRemoved);
            ctrlGeometry.setAttribute("position", new Float32BufferAttribute(ctrlPosition, 3));
            curveGeometry.setAttribute("position", new Float32BufferAttribute(curvePosition, 3));
            if (this._currentTime === duration) {
                this._currentTime = 0;
                this._stoped = true;
                _clock.stop();
            } else {
                this._currentTime += _clock.getDelta() * 1000;
            }
            if (this._currentTime > duration) {
                this._currentTime = duration;
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
            this.addCtrlPoint(point);
        }
    }

    protected _pointerMove(event: PointerEvent) {
        super._pointerMove(event);
        const point = new Vector2(event.clientX, event.clientY);
        if (this._dragging && this._object) {
            this.addCtrlPoint(point, this._object.userData.index);
        }
    }

    start() {
        this._stoped = false;
        this._currentTime = 0;
        this.paused = false;
        return this;
    }

    stop() {
        this._stoped = true;
        this._currentTime = 0;
        this.paused = true;
        return this;
    }

    addCtrlPoint(point: Vector2, index = -1) {
        const {_raycaster, camera, curve} = this;
        _raycaster.setFromCamera(this._getNDC(point), camera);
        const plane = new Plane(new Vector3(0, 0, 1));
        const p = new Vector3();
        _raycaster.ray.intersectPlane(plane, p);
        if (index >= 0 && index < curve.ctrlPoints.length) {
            curve.ctrlPoints[index].set(p.x, p.y);
        } else {
            curve.ctrlPoints.push(new Point(p.x, p.y));
        }
        return this.start();
    }

    removeCtrlPoint(index: number) {
        this.curve.ctrlPoints.splice(index, 1);
        return this.start();
    }
}
