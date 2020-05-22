import {Object3D, BoxGeometry, Color, MeshLambertMaterial, Mesh, Vector3, Clock, Matrix4, ArcCurve} from "three";
import TWEEN from "@tweenjs/tween.js";

export interface RubiksCubeColors {
	F: Color;
	B: Color;
	U: Color;
	D: Color;
	L: Color;
	R: Color;
}

export interface RubiksCubeStep {
	cubes: Mesh[];
	axis: "x" | "y" | "z";
	count: number;
}

export class RubiksCube extends Object3D {
	size: number;
	dimension: number;
	colors: RubiksCubeColors = {
		F: new Color(1, 0.5, 0.25),
		B: new Color(1, 0, 0),
		U: new Color(1, 1, 1),
		D: new Color(1, 1, 0),
		L: new Color(0, 0, 1),
		R: new Color(0, 1, 0)
	};
	steps: {forward: RubiksCubeStep[]; backward: RubiksCubeStep[]};
	takingStep = false;
	private _tween: TWEEN.Tween;
	private _clock = new Clock(false);

	constructor(size = 5, dimension = 3) {
		super();
		this.size = size;
		this.dimension = dimension;
		this.steps = {forward: [], backward: []};

		const gap = 0.25;
		const offset = (dimension - 1) / 2;
		const inc = size + gap;
		for (let i = 0; i < dimension; i++) {
			for (let j = 0; j < dimension; j++) {
				for (let k = 0; k < dimension; k++) {
					const cube = this.newCube();
					const x = (i - offset) * inc;
					const y = (j - offset) * inc;
					const z = (k - offset) * inc;
					cube.position.set(x, y, z);
					cube.userData = {x: i, y: j, z: k};
					this.add(cube);
				}
			}
		}
	}

	newCube() {
		const {size} = this;
		const geometry = new BoxGeometry(size, size, size);
		const materials: MeshLambertMaterial[] = [];
		const order: (keyof RubiksCubeColors)[] = ["F", "U", "B", "D", "L", "R"];
		for (const face of order) {
			const color = this.colors[face];
			materials.push(new MeshLambertMaterial({color}));
		}
		return new Mesh(geometry, materials);
	}

	forward(axis: "x" | "y" | "z", index: number[], count: number) {
		count = ((count % 4) + 4) % 4;
		const cubes = this.children.filter((o) => index.includes(o.userData[axis])) as Mesh[];
		if (cubes.length % this.dimension ** 2 !== 0) {
			console.warn(cubes.length);
		}
		this.steps.forward.push({cubes, axis, count});
		// cubes.forEach((o) => o.rotateOnAxis(new Vector3(1, 0, 0), Math.PI / 2));
	}

	update() {
		const {steps, _tween, _clock} = this;
		if (this.takingStep) {
			_tween?.update(_clock.getElapsedTime() * 1000);
		}
		if (steps.forward.length && !this.takingStep) {
			this.takingStep = true;
			const {cubes, axis, count} = steps.forward.shift();
			const obj = {angle: 0};
			const tween = new TWEEN.Tween(obj).to({angle: (Math.PI / 2) * count}, 1000);
			const axisVector = new Vector3();
			axisVector[axis] = 1;
			let lastAngle = 0;
			const group = new Object3D();
			this.add(group);
			cubes.forEach((cube) => {
				group.add(cube);
				this.remove(cube);
			});
			console.log(cubes.map((o) => o.userData));
			tween
				.onUpdate(({angle}) => {
					const delta = angle - lastAngle;
					lastAngle = angle;
					group.rotateOnAxis(axisVector, delta);
				})
				.onComplete(() => {
					this.takingStep = false;
					_clock.stop();
					cubes.forEach((cube) => {
						// cube.applyMatrix4(group.matrix);
						cube.rotateOnAxis(axisVector, (Math.PI / 2) * count);
						this.add(cube);
					});
					this.remove(group);
				})
				.start(0);
			_clock.start();
			this._tween = tween;
		}
	}
}
