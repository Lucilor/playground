import {Scene, PerspectiveCamera, WebGLRenderer, PointLight, AmbientLight, Vector2, Vector3, Object3D, Raycaster} from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export interface DrawerConfig {
    width: number;
    height: number;
    backgroundColor: number;
    backgroundAlpha: number;
    showStats: boolean;
}

export class Drawer {
    dom: HTMLDivElement;
    scene: Scene;
    camera: PerspectiveCamera;
    renderer: WebGLRenderer;
    config: DrawerConfig = {
        width: 300,
        height: 150,
        backgroundColor: 0,
        backgroundAlpha: 1,
        showStats: true
    };
    stats?: Stats;
    controls: OrbitControls;
    protected _raycaster = new Raycaster();
    protected _pointer = new Vector2();
    protected _object: Object3D | null = null;
    protected _dragging = false;

    constructor(config: Partial<DrawerConfig> = {}) {
        this.config = {...this.config, ...config};
        const {width, height, backgroundColor, backgroundAlpha} = this.config;
        const scene = new Scene();
        const camera = new PerspectiveCamera(60, width / height, 0.1, 15000);
        const renderer = new WebGLRenderer({preserveDrawingBuffer: true, antialias: true});
        renderer.setClearColor(backgroundColor, backgroundAlpha);
        renderer.setSize(width, height);

        const dom = document.createElement("div");
        dom.appendChild(renderer.domElement);
        dom.classList.add("three-drawer");
        this.dom = dom;
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        scene.add(camera);
        const light = new PointLight(0xffffff, 0.5);
        light.position.set(0, 0, 0);
        camera.add(light);
        scene.add(new AmbientLight(0xffffff, 0.4));
        camera.position.set(0, 0, 50);
        camera.lookAt(0, 0, 0);

        if (this.config.showStats) {
            this.stats = Stats();
            dom.appendChild(this.stats.dom);
        }
        this.controls = new OrbitControls(camera, dom);

        const animate = () => {
            requestAnimationFrame(animate.bind(this));
            const {renderer, camera, scene} = this;
            renderer?.render(scene, camera);
            this.stats?.update();
            this.controls?.update();
            this.update();
        };
        animate();

        dom.addEventListener("pointerdown", this._pointerDown.bind(this));
        dom.addEventListener("pointermove", this._pointerMove.bind(this));
        dom.addEventListener("pointerup", this._pointerUp.bind(this));
    }

    update() {}

    resize(width?: number, height?: number) {
        if (width && width > 0) {
            this.config.width = width;
        } else {
            width = this.config.width;
        }
        if (height && height > 0) {
            this.config.height = height;
        } else {
            height = this.config.height;
        }
        const {dom, renderer, camera} = this;
        dom.style.width = width + "px";
        dom.style.height = height + "px";
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        return this;
    }

    protected _correctColor(color: number, threshold = 5) {
        if (typeof color === "number" && Math.abs(color - this.config.backgroundColor) <= threshold) {
            return 0xfffffff - color;
        }
        return color;
    }

    protected _getNDC(point: Vector2) {
        const rect = this.dom.getBoundingClientRect();
        return new Vector3(((point.x - rect.left) / rect.width) * 2 - 1, ((rect.top - point.y) / rect.height) * 2 + 1, 0.5);
    }

    protected _getNDCReverse(point: Vector3) {
        const rect = this.dom.getBoundingClientRect();
        const a = rect.width / 2;
        const b = rect.height / 2;
        return new Vector2(point.x * a + a + rect.left, -point.y * b + b + rect.top);
    }

    protected _getWorldPoint(point: Vector2) {
        return this._getNDC(point).unproject(this.camera);
    }

    protected _getScreenPoint(point: Vector3) {
        return this._getNDCReverse(point.project(this.camera));
    }

    protected _getIntersection(_point: Vector2) {
        return this._object;
    }

    protected _hover(point: Vector2) {
        const object = this._getIntersection(point);
        if (object) {
            this.dom.style.cursor = "pointer";
        } else {
            this.dom.style.cursor = "default";
        }
    }

    protected _click(_point: Vector2) {}

    protected _pointerDown({clientX, clientY, button}: PointerEvent) {
        this._pointer.set(clientX, clientY);
        if (button === 0 && this._object) {
            this._dragging = true;
        }
    }

    protected _pointerMove({clientX, clientY}: PointerEvent) {
        const point = new Vector2(clientX, clientY);
        this._hover(point);
    }

    protected _pointerUp({clientX, clientY, button}: PointerEvent) {
        const point = new Vector2(clientX, clientY);
        if (point.distanceTo(this._pointer) <= 5 && button === 0) {
            this._click(point);
        }
        this._dragging = false;
    }
}
