import {PointLight, AmbientLight, Vector2, Mesh, AxesHelper} from "three";
import {RubiksCube} from "./rubiks-cube";
import {DrawerConfig, Drawer} from "../../drawer/drawer";

export interface RubiksCubeDrawerConfig extends DrawerConfig {
	size?: number;
	dimension?: number;
}

export class RubiksCubeDrawer extends Drawer {
	config: RubiksCubeDrawerConfig;
	cube: RubiksCube;
	smallCubes: Mesh[] = [];

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
		} else {
			this._object = null;
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
		this.smallCubes.length = 0;
	}

	protected _pointerMove(event: PointerEvent) {
		super._pointerMove(event);
		if (this._dragging) {
			this.smallCubes.push(this._object as Mesh);
		}
	}
}
