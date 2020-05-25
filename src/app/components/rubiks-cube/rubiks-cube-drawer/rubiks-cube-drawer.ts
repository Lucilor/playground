import {PointLight, AmbientLight, Vector2, AxesHelper, Vector3, Intersection} from "three";
import {RubiksCube, Axis} from "./rubiks-cube";
import {DrawerConfig, Drawer} from "../../drawer/drawer";

export class RubiksCubeDrawer extends Drawer {
	config: DrawerConfig;
	cube: RubiksCube;
	private _cubePositions = [new Vector3(), new Vector3()];
	private _cubeFaces = [new Vector3(), new Vector3()];
	private _intersection: Intersection;

	constructor(cube: RubiksCube, config: DrawerConfig) {
		super(config);

		const {camera, scene} = this;
		camera.position.set(50, 50, 50);
		camera.lookAt(0, 0, 0);
		scene.add(camera);
		const pointLight = new PointLight(0xffffff);
		camera.add(pointLight);
		scene.add(new AmbientLight(0xffffff, 0.2));
		this.cube = cube;
		this.cube.position.set(10, 10, 10);
		scene.add(this.cube);

		scene.add(new AxesHelper(100));
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

	protected _hover(point: Vector2) {
		super._hover(point);
		if (this._object) {
			this.controls.enableRotate = false;
		} else {
			this.controls.enableRotate = true;
		}
	}

	protected _pointerDown(event: PointerEvent) {
		super._pointerDown(event);
		const object = this._getIntersection(new Vector2(event.clientX, event.clientY));
		if (object) {
			const {x, y, z} = object.userData;
			this._cubePositions[0].set(x, y, z);
			const normal = this._intersection.face.normal.clone();
			this._cubeFaces[0].copy(normal.transformDirection(object.matrixWorld).round());
		}
	}

	protected _pointerMove(event: PointerEvent) {
		super._pointerMove(event);
		if (this._dragging && this._object) {
			const {x, y, z} = this._object.userData;
			this._cubePositions[1].set(x, y, z);
			const normal = this._intersection.face.normal.clone();
			this._cubeFaces[1].copy(normal.transformDirection(this._object.matrixWorld).round());
		}
	}

	protected _pointerUp(event: PointerEvent) {
		super._pointerUp(event);
		const {_cubePositions, _cubeFaces} = this;
		const dPosition = _cubePositions[1].clone().sub(_cubePositions[0]);
		let valid = true;
		if (!_cubeFaces[0].equals(_cubeFaces[1])) {
			valid = false;
		}
		let axis: Axis;
		let dragAxis: Axis;
		let clickAxis: Axis;
		["x", "y", "z"].forEach((v) => {
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
		if (!axis || !dragAxis || !clickAxis) {
			valid = false;
		}
		let clockwise: boolean;
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
		if (valid) {
			this.cube.forward(axis, _cubePositions[0][axis], 1, clockwise);
		}
		_cubePositions[0].set(0, 0, 0);
		_cubePositions[1].set(0, 0, 0);
		_cubeFaces[0].set(0, 0, 0);
		_cubeFaces[1].set(0, 0, 0);
	}
}
