import {
	Scene,
	PerspectiveCamera,
	WebGLRenderer,
	BufferGeometry,
	LineBasicMaterial,
	Float32BufferAttribute,
	Vector2,
	Vector3,
	LineSegments,
	PointLight,
	AmbientLight,
	Line,
	ShapeGeometry,
	ArcCurve,
	Shape,
	Mesh,
	MeshBasicMaterial,
	Raycaster,
	Plane,
	Clock,
	Object3D
} from "three";
import {BezierCurve} from "./bezier-curve";
import Stats from "three/examples/jsm/libs/stats.module";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export interface BezierDrawerConfig {
	width?: number;
	height?: number;
	backgroundColor?: number;
	backgroundAlpha?: number;
	showStats?: boolean;
	duration?: number;
}

export class BezierDrawer {
	dom: HTMLDivElement;
	scene: Scene;
	camera: PerspectiveCamera;
	renderer: WebGLRenderer;
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
	stats: Stats;
	controls: OrbitControls;
	paused = false;
	loop = false;
	private _stoped = false;
	private _destroyed = false;
	private _currentTime = 0;
	private _geometries = {
		point: new ShapeGeometry(new Shape(new ArcCurve(0, 0, 0.5, 0, Math.PI * 2, true).getPoints(64)))
	};
	private _materials = {point: new MeshBasicMaterial()};
	private _raycaster = new Raycaster();
	private _clock = new Clock(false);
	private _pointer = new Vector2();
	private _object: Object3D;
	private _dragging = false;

	constructor(config: BezierDrawerConfig = {}) {
		this.config = {...this.config, ...config};
		const {width, height, backgroundColor, backgroundAlpha} = this.config;
		this._materials.point.setValues({
			color: this._correctColor(0xcccccc)
		});
		const scene = new Scene();
		const camera = new PerspectiveCamera(60, width / height, 0.1, 15000);
		const renderer = new WebGLRenderer({preserveDrawingBuffer: true});
		renderer.setClearColor(backgroundColor, backgroundAlpha);
		renderer.setSize(width, height);

		const dom = document.createElement("div");
		dom.appendChild(renderer.domElement);
		dom.classList.add("bezier-drawer");
		this.dom = dom;
		this.scene = scene;
		this.camera = camera;
		this.renderer = renderer;

		scene.add(camera);
		const light = new PointLight(0xffffff, 0.5);
		light.position.set(0, 0, 0);
		camera.add(light);
		scene.add(new AmbientLight(0xffffff, 0.4));

		if (this.config.showStats) {
			this.stats = Stats();
			dom.appendChild(this.stats.dom);
		}
		this.controls = new OrbitControls(camera, dom);
		this.controls.enableRotate = false;

		const ctrl = new LineSegments(new BufferGeometry(), new LineBasicMaterial({color: this._correctColor(0xcccccc)}));
		const curve = new Line(new BufferGeometry(), new LineBasicMaterial({color: this._correctColor(0xff0000)}));
		curve.renderOrder = 1;
		this.objects = {ctrl, curve};
		scene.add(ctrl, curve);

		camera.position.set(0, 0, 50);
		camera.lookAt(0, 0, 0);

		const animate = () => {
			if (!this._destroyed) {
				requestAnimationFrame(animate.bind(this));
				const {renderer, camera, scene} = this;
				renderer?.render(scene, camera);
				this.stats?.update();
				this.controls?.update();
				this.render();
			}
		};
		animate();

		dom.addEventListener("pointerdown", this._pointerDown.bind(this));
		dom.addEventListener("pointermove", this._pointerMove.bind(this));
		dom.addEventListener("pointerup", this._pointerUp.bind(this));
	}

	render() {
		const {config, curve, _currentTime, objects, _geometries, _materials} = this;
		const {_stoped, loop, paused, _clock} = this;
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
			const ctrlPosition = [];
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

	private _correctColor(color: number, threshold = 5) {
		if (typeof color === "number" && Math.abs(color - this.config.backgroundColor) <= threshold) {
			return 0xfffffff - color;
		}
		return color;
	}

	private _getNDC(point: Vector2) {
		const rect = this.dom.getBoundingClientRect();
		return new Vector3(((point.x - rect.left) / rect.width) * 2 - 1, ((rect.top - point.y) / rect.height) * 2 + 1, 0.5);
	}

	private _getNDCReverse(point: Vector3) {
		const rect = this.dom.getBoundingClientRect();
		const a = rect.width / 2;
		const b = rect.height / 2;
		return new Vector2(point.x * a + a + rect.left, -point.y * b + b + rect.top);
	}

	private _getWorldPoint(point: Vector2) {
		return this._getNDC(point).unproject(this.camera);
	}

	private _getScreenPoint(point: Vector3) {
		return this._getNDCReverse(point.project(this.camera));
	}

	private _getIntersection(point: Vector2) {
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

	private _hover(point: Vector2) {
		const object = this._getIntersection(point);
		if (object) {
			this.dom.style.cursor = "pointer";
		} else {
			this.dom.style.cursor = "default";
		}
	}

	private _click(point: Vector2) {
		if (!this._dragging) {
			this.addCtrlPoint(point);
		}
	}

	private _pointerDown({clientX, clientY, button}: PointerEvent) {
		this._pointer.set(clientX, clientY);
		if (button === 0 && this._object) {
			this._dragging = true;
		}
	}

	private _pointerMove({clientX, clientY}: PointerEvent) {
		const point = new Vector2(clientX, clientY);
		this._hover(point);
		if (this._dragging) {
			this.addCtrlPoint(point, this._object.userData.index);
		}
	}

	private _pointerUp({clientX, clientY, button}: PointerEvent) {
		const point = new Vector2(clientX, clientY);
		if (point.distanceTo(this._pointer) <= 5 && button === 0) {
			this._click(point);
		}
		this._dragging = false;
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
			curve.ctrlPoints.push(new Vector2(p.x, p.y));
		}
		return this.start();
	}

	removeCtrlPoint(index: number) {
		this.curve.ctrlPoints.splice(index, 1);
		return this.start();
	}
}
