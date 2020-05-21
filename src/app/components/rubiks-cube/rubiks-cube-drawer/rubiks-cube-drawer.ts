import {Scene, PerspectiveCamera, WebGLRenderer, PointLight, AmbientLight} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {RubiksCube} from "./rubiks-cube";
import {DrawerConfig, Drawer} from "../../drawer/drawer";

export interface RubiksCubeDrawerConfig extends DrawerConfig {
	size?: number;
	dimension?: number;
}

export class RubiksCubeDrawer extends Drawer {
	config: RubiksCubeDrawerConfig;
	cube: RubiksCube;

	constructor(config: RubiksCubeDrawerConfig) {
		super(config);
		this.config = {size: 5, dimension: 3, ...this.config};
		const {width, height, backgroundColor, backgroundAlpha} = this.config;
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

		if (this.config.showStats) {
			this.stats = Stats();
			dom.appendChild(this.stats.dom);
		}
		this.controls = new OrbitControls(camera, dom);

		camera.position.set(0, 0, 50);
		camera.lookAt(0, 0, 0);
		scene.add(camera);
		const pointLight = new PointLight(0xffffff);
		camera.add(pointLight);
		scene.add(new AmbientLight(0xffffff, 0.2));
		this.cube = new RubiksCube(config.size, config.dimension);
		scene.add(this.cube);
	}

	render() {}
}
