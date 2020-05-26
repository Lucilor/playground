import {Object3D, BoxGeometry, Color, MeshLambertMaterial, Mesh, Vector3, Clock, Matrix4, MathUtils} from "three";
import TWEEN from "@tweenjs/tween.js";

export interface RubiksCubeColors {
	F: Color; // front
	B: Color; // back
	U: Color; // up
	D: Color; // down
	L: Color; // left
	R: Color; // right
}

export type Axis = "x" | "y" | "z";

export interface RubiksCubeStep {
	axis: Axis; // axis to rotate on
	indices: number[]; // layers to rotate
	count: number; // times to rotate
	clockwise: boolean; // rotate direction
	duration?: number; // rotate speed
	forsaken?: boolean; // if true, this step won't push to history
}

export class RubiksCube extends Object3D {
	size: number;
	dimension: number;
	gap: number;
	colors: RubiksCubeColors = {
		F: new Color(1, 0.5, 0.25),
		B: new Color(1, 0, 0),
		U: new Color(1, 1, 1),
		D: new Color(1, 1, 0),
		L: new Color(0, 0, 1),
		R: new Color(0, 1, 0)
	};
	stepDuration = 500;
	takingStep = false;
	steps: {queue: RubiksCubeStep[]; histroy: RubiksCubeStep[]};
	private _tween: TWEEN.Tween;
	private _clock = new Clock(false);

	constructor(size = 5, dimension = 3, gap = 0.25) {
		super();
		this.size = size;
		this.dimension = dimension;
		this.gap = gap;
		this.reset();
	}

	reset() {
		const {dimension, size, gap} = this;
		const offset = (dimension - 1) / 2;
		const inc = size + gap;
		this.remove(...this.children);
		this.steps = {queue: [], histroy: []};
		for (let i = 0; i < dimension; i++) {
			for (let j = 0; j < dimension; j++) {
				for (let k = 0; k < dimension; k++) {
					const geometry = new BoxGeometry(size, size, size);
					const materials: MeshLambertMaterial[] = [];
					// TODO: kind of mess
					const order: (keyof RubiksCubeColors)[] = ["R", "L", "U", "D", "F", "B"];
					for (const face of order) {
						const color = this.colors[face];
						materials.push(new MeshLambertMaterial({color}));
					}
					const cube = new Mesh(geometry, materials);
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

	forward(axis: Axis | RubiksCubeStep, indices?: number | number[], count?: number, clockwise?: boolean, duration = this.stepDuration) {
		if (typeof axis === "string") {
			count = ((count % 4) + 4) % 4;
			clockwise = !!clockwise;
			if (typeof indices === "number") {
				indices = [indices];
			}
			this.steps.queue.push({axis, indices, count, clockwise, duration, forsaken: false});
		} else {
			this.steps.queue.push(axis);
		}
	}

	back(duration = this.stepDuration) {
		const step = this.steps.histroy.pop();
		step.clockwise = !step.clockwise;
		step.duration = duration;
		step.forsaken = true;
		this.steps.queue.push(step);
	}

	update() {
		const {steps, _tween, _clock, size, dimension, gap} = this;
		_tween?.update(_clock.getElapsedTime() * 1000);
		if (steps.queue.length && !this.takingStep) {
			this.takingStep = true;
			const step = steps.queue.shift();
			const {indices, axis, count, clockwise} = step;
			const duration = step.duration > 0 ? step.duration : this.stepDuration;
			const forsaken = step.forsaken === true ? true : false;
			if (!forsaken) {
				steps.histroy.push(step);
			}
			const cubes = this.children.filter((o) => indices.includes(o.userData[axis]));
			const obj = {angle: 0};
			const totalAngle = (clockwise ? 1 : -1) * (Math.PI / 2) * count;
			const tween = new TWEEN.Tween(obj).to({angle: totalAngle}, duration);
			const axisVector = new Vector3();
			axisVector[axis] = 1;
			let lastAngle = 0;
			const group = new Object3D();
			this.add(group);
			cubes.forEach((cube) => {
				group.add(cube);
				this.remove(cube);
			});
			const axes: ("x" | "y" | "z")[] = [];
			const matrix = new Matrix4();
			if (axis === "x") {
				axes.push("y", "z");
				matrix.makeRotationX(totalAngle);
			}
			if (axis === "y") {
				axes.push("x", "z");
				matrix.makeRotationY(totalAngle);
			}
			if (axis === "z") {
				axes.push("x", "y");
				matrix.makeRotationZ(totalAngle);
			}
			tween
				.onUpdate(({angle}) => {
					const delta = angle - lastAngle;
					lastAngle = angle;
					group.rotateOnAxis(axisVector, delta);
				})
				.onComplete(() => {
					_clock.stop();
					this.takingStep = false;
					this._tween = null;
					const array: any[][] = [];
					const offset = (dimension - 1) / 2;
					const inc = size + gap;
					cubes.forEach((cube) => {
						const x = cube.position[axes[0]];
						const y = cube.position[axes[1]];
						const j = Math.round(y / inc + offset);
						const k = Math.round(x / inc + offset);
						if (!array[j]) {
							array[j] = [];
						}
						array[j][k] = cube.userData;
					});
					for (const v of array) {
						if (v.length !== dimension) {
							throw new Error("Something goes wrong when taking a step.");
						}
					}
					// TODO: axis y has different clockwise
					const newArray = this.rotateArray2D(array, axis === "y" ? clockwise : !clockwise);
					cubes.forEach((cube) => {
						const x = cube.position[axes[0]];
						const y = cube.position[axes[1]];
						const j = Math.round(y / inc + offset);
						const k = Math.round(x / inc + offset);
						cube.userData = newArray[j][k];
					});
					cubes.forEach((cube) => {
						cube.applyMatrix4(matrix);
						cube.matrixWorldNeedsUpdate = true;
						this.add(cube);
					});
					this.remove(group);
				})
				.start(0);
			_clock.start();
			this._tween = tween;
		}
	}

	rotateArray2D<T>(array: T[][], clockwise: boolean) {
		const result: T[][] = [];
		for (let i = 0; i < array.length; i++) {
			const col = array[i];
			for (let j = 0; j < col.length; j++) {
				if (!result[j]) {
					result[j] = [];
				}
				if (clockwise) {
					result[j][i] = array[array.length - 1 - i][j];
				} else {
					result[j][i] = array[i][col.length - 1 - j];
				}
			}
		}
		return result;
	}

	shuffle(count = 8 * this.dimension, duration = 100) {
		for (let i = 0; i < count; i++) {
			const axis = ["x", "y", "z"][MathUtils.randInt(0, 2)] as "x" | "y" | "z";
			const indices = [MathUtils.randInt(0, this.dimension - 1)];
			const clockwise = [true, false][MathUtils.randInt(0, 1)];
			this.forward(axis, indices, 1, clockwise, duration);
		}
	}

	backToOrigin(duration = 100) {
		while (this.steps.histroy.length) {
			this.back(duration);
		}
	}

	execute(cmd: string) {
		const steps = this._parseCommand(cmd);
		steps.forEach((step) => this.forward(step));
	}

	private _parseCommand(cmd: string) {
		const {dimension} = this;
		// cmd = cmd.toUpperCase();
		const steps: RubiksCubeStep[] = [];
		let step: RubiksCubeStep;
		for (const char of cmd) {
			if (["F", "B", "U", "D", "L", "R"].includes(char)) {
				switch (char) {
					case "F":
						step = {axis: "z", indices: [dimension - 1], clockwise: false, count: 1};
						break;
					case "B":
						step = {axis: "z", indices: [0], clockwise: true, count: 1};
						break;
					case "U":
						step = {axis: "y", indices: [dimension - 1], clockwise: false, count: 1};
						break;
					case "D":
						step = {axis: "y", indices: [0], clockwise: true, count: 1};
						break;
					case "L":
						step = {axis: "x", indices: [0], clockwise: true, count: 1};
						break;
					case "R":
						step = {axis: "x", indices: [dimension - 1], clockwise: false, count: 1};
						break;
				}
				steps.push(step);
			}
			if (char === "'") {
				step.clockwise = !step.clockwise;
			}
		}
		return steps;
	}
}
