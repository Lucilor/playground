import {Object3D, BoxGeometry, Color, MeshLambertMaterial, Mesh, Vector3, Clock, Matrix4, ArcCurve, Vector2, MathUtils} from "three";
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
	axis: "x" | "y" | "z";
	indices: number[];
	count: number;
	clockwise: boolean;
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
	steps: {queue: RubiksCubeStep[]; histroy: RubiksCubeStep[]};
	takingStep = false;
	private _tween: TWEEN.Tween;
	private _clock = new Clock(false);

	constructor(size = 5, dimension = 3, gap = 0.25) {
		super();
		this.size = size;
		this.dimension = dimension;
		this.gap = gap;
		this.steps = {queue: [], histroy: []};

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

	forward(axis: "x" | "y" | "z", indices: number | number[], count: number, clockwise: boolean) {
		count = ((count % 4) + 4) % 4;
		clockwise = !!clockwise;
		if (typeof indices === "number") {
			indices = [indices];
		}
		this.steps.queue.push({axis, indices, count, clockwise});
	}

	back() {
		const step = this.steps.histroy.pop();
		step.clockwise = !step.clockwise;
		this.steps.queue.push(step);
	}

	update() {
		const {steps, _tween, _clock, size, dimension, gap, stepDuration} = this;
		_tween?.update(_clock.getElapsedTime() * 1000);
		if (steps.queue.length && !this.takingStep) {
			this.takingStep = true;
			const step = steps.queue.shift();
			steps.histroy.push(step);
			const {indices, axis, count, clockwise} = step;
			const cubes = this.children.filter((o) => indices.includes(o.userData[axis]));
			const obj = {angle: 0};
			const totalAngle = (clockwise ? 1 : -1) * (Math.PI / 2) * count;
			const tween = new TWEEN.Tween(obj).to({angle: totalAngle}, stepDuration);
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
						const j = Math.round(y / inc) + offset;
						const k = Math.round(x / inc) + offset;
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
						const j = Math.round(y / inc) + offset;
						const k = Math.round(x / inc) + offset;
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

	shuffle(count = 20) {
		for (let i = 0; i < count; i++) {
			const axis = ["x", "y", "z"][MathUtils.randInt(0, 2)] as "x" | "y" | "z";
			const indices = [MathUtils.randInt(0, this.dimension - 1)];
			const clockwise = [true, false][MathUtils.randInt(0, 1)];
			this.forward(axis, indices, 1, clockwise);
		}
	}
}
