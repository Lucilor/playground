import {PointLight, AmbientLight, Vector2, AxesHelper, Vector3, Intersection} from "three";
import {RubiksCube} from "./rubiks-cube";
import {DrawerConfig, Drawer} from "../../drawer/drawer";

export interface RubiksCubeDrawerConfig extends DrawerConfig {
	size?: number;
	dimension?: number;
}

export class RubiksCubeDrawer extends Drawer {
	config: RubiksCubeDrawerConfig;
	cube: RubiksCube;
	private _cubePositions = [new Vector3(), new Vector3()];
	private _cubeFaces = [new Vector3(), new Vector3()];
	private _intersection: Intersection;

	constructor(config: RubiksCubeDrawerConfig) {
		super(config);
		this.config = {size: 5, dimension: 3, ...this.config};

		const {camera, scene} = this;
		camera.position.set(50, 50, 50);
		camera.lookAt(0, 0, 0);
		scene.add(camera);
		const pointLight = new PointLight(0xffffff);
		camera.add(pointLight);
		scene.add(new AmbientLight(0xffffff, 0.2));
		this.cube = new RubiksCube(config.size, config.dimension);
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
			this._cubeFaces[0].copy(this._intersection.face.normal);
		}
	}

	protected _pointerMove(event: PointerEvent) {
		super._pointerMove(event);
		if (this._dragging && this._object) {
			const {x, y, z} = this._object.userData;
			this._cubePositions[1].set(x, y, z);
			this._cubeFaces[1].copy(this._intersection.face.normal);
		}
	}

	protected _pointerUp(event: PointerEvent) {
		super._pointerUp(event);
		const {_cubePositions, _cubeFaces} = this;
		const dPosition = _cubePositions[1].clone().sub(_cubePositions[0]);
		if (!_cubeFaces[0].equals(_cubeFaces[1])) {
			console.log(1);
			return;
		}
		const x = dPosition.x | _cubeFaces[0].x;
		const y = dPosition.y | _cubeFaces[0].y;
		const z = dPosition.z | _cubeFaces[0].z;
		let axis: "x" | "y" | "z";
		if (!x && y && z) {
			axis = "x";
		}
		if (x && !y && z) {
			axis = "y";
		}
		if (x && y && !z) {
			axis = "z";
		}
		if (!axis) {
			console.log(x, y, z);
			return;
		}
		let clockwise: boolean;
		if (dPosition.x) {
			clockwise = dPosition.x > 0;
		}
		if (dPosition.y) {
			clockwise = dPosition.y > 0;
		}
		if (dPosition.z) {
			clockwise = dPosition.z > 0;
		}
		console.log(axis, _cubePositions[0][axis], 1, clockwise);
		this.cube.forward(axis, _cubePositions[0][axis], 1, clockwise);
		_cubePositions[0].set(0, 0, 0);
		_cubePositions[1].set(0, 0, 0);
		_cubeFaces[0].set(0, 0, 0);
		_cubeFaces[1].set(0, 0, 0);
	}
}
