import {Drawer, DrawerConfig} from "@components/drawer/drawer";
import {AmbientLight, Vector2, Vector3, Intersection, DirectionalLight} from "three";
import {RubiksCube, Axis} from "./rubiks-cube";

export interface RubiksCubeDrawerConfig extends DrawerConfig {
  axesHelper: boolean;
}

export class RubiksCubeDrawer extends Drawer {
  config: RubiksCubeDrawerConfig = {
    width: 300,
    height: 150,
    backgroundColor: 0,
    backgroundAlpha: 1,
    showStats: true,
    axesHelper: true
  };
  cube: RubiksCube;
  private _cubePositions = [new Vector3(), new Vector3()];
  private _cubeFaces = [new Vector3(), new Vector3()];
  private _intersection: Intersection | null = null;

  constructor(cube: RubiksCube, config: Partial<RubiksCubeDrawerConfig> = {}) {
    super(config);
    this.config = {...this.config, ...config};

    const {camera, scene} = this;
    camera.position.set(50, 50, 50);
    camera.lookAt(0, 0, 0);
    scene.add(camera);
    const directionalLight = new DirectionalLight(0xffffff, 0.5);
    // directionalLight.position.set();
    scene.add(directionalLight);
    scene.add(new AmbientLight(0xffffff, 0.2));
    this.cube = cube;
    scene.add(this.cube);

    // const axisHelper = new AxesHelper(100);
    // scene.add(new AxesHelper(100));
  }

  update() {
    this.cube?.update();
  }

  protected _getIntersection(point: Vector2) {
    const {_raycaster, camera} = this;
    _raycaster.setFromCamera(this._getNDC(point), camera);
    const intersections = _raycaster.intersectObjects([this.cube], true);
    if (intersections.length) {
      this._object = intersections[0].object;
      this._intersection = intersections[0];
    } else {
      this._object = null;
      this._intersection = null;
    }
    return this._object;
  }

  protected _pointerDown(event: PointerEvent) {
    super._pointerDown(event);
    const object = this._getIntersection(new Vector2(event.clientX, event.clientY));
    if (object) {
      const {x, y, z} = object.userData;
      this._cubePositions[0].set(x, y, z);
      const normal = this._intersection?.face?.normal.clone();
      if (normal) {
        this._cubeFaces[0].copy(normal.transformDirection(object.matrixWorld).round());
        this.controls.enableRotate = false;
      }
    }
  }

  protected _pointerMove(event: PointerEvent) {
    super._pointerMove(event);
    if (this._dragging && this._object) {
      const {x, y, z} = this._object.userData;
      this._cubePositions[1].set(x, y, z);
      const normal = this._intersection?.face?.normal.clone();
      if (normal) {
        this._cubeFaces[1].copy(normal.transformDirection(this._object.matrixWorld).round());
      }
    }
  }

  protected _pointerUp(event: PointerEvent) {
    // TODO: make the move more accurate
    super._pointerUp(event);
    const {_cubePositions, _cubeFaces, cube} = this;
    const dPosition = _cubePositions[1].clone().sub(_cubePositions[0]);
    let valid = !cube.takingStep;
    if (!_cubeFaces[0].equals(_cubeFaces[1])) {
      valid = false;
    }
    let axis: Axis | undefined;
    let dragAxis: Axis | undefined;
    let clickAxis: Axis | undefined;
    (["x", "y", "z"] as Axis[]).forEach((v) => {
      if (dPosition[v] === 0 && _cubeFaces[0][v] === 0) {
        axis = v as Axis;
      } else {
        if (dPosition[v] !== 0) {
          dragAxis = v as Axis;
        }
        if (_cubeFaces[0][v] !== 0) {
          clickAxis = v as Axis;
        }
      }
    });
    if (valid && axis && dragAxis && clickAxis) {
      let clockwise: boolean | undefined;
      if (axis === "x") {
        if (clickAxis === "y") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] > 0;
        }
        if (clickAxis === "z") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] < 0;
        }
      }
      if (axis === "y") {
        if (clickAxis === "x") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] < 0;
        }
        if (clickAxis === "z") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] > 0;
        }
      }
      if (axis === "z") {
        if (clickAxis === "x") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] > 0;
        }
        if (clickAxis === "y") {
          clockwise = dPosition[dragAxis] * _cubeFaces[0][clickAxis] < 0;
        }
      }
      this.cube.forward(axis, _cubePositions[0][axis], clockwise);
    }
    _cubePositions[0].set(0, 0, 0);
    _cubePositions[1].set(0, 0, 0);
    _cubeFaces[0].set(0, 0, 0);
    _cubeFaces[1].set(0, 0, 0);
    this.controls.enableRotate = true;
  }
}
