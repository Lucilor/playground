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
	cubes: Mesh[];
	axis: "x" | "y" | "z";
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
	steps: {forward: RubiksCubeStep[]; backward: RubiksCubeStep[]};
	takingStep = false;
	private _tween: TWEEN.Tween;
	private _clock = new Clock(false);

	constructor(size = 5, dimension = 3, gap = 0.25) {
		super();
		this.size = size;
		this.dimension = dimension;
		this.gap = gap;
		this.steps = {forward: [], backward: []};

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

	a = 0;
	forward(axis: "x" | "y" | "z", indexs: number[], count: number, clockwise: boolean) {
		count = ((count % 4) + 4) % 4;
		const cubes = this.children.filter((o) => indexs.includes(o.userData[axis])) as Mesh[];
		if (cubes.length % this.dimension ** 2 !== 0) {
			console.warn(cubes.length);
		}
		// if (++this.a >= 3) {
		// 	if (this.a === 3) {
		// 		cubes.forEach((o) => (o.position.x += 20));
		// 	}
		// 	return;
		// }
		this.steps.forward.push({cubes, axis, count, clockwise});
	}

	update() {
		const {steps, _tween, _clock, size, dimension, gap} = this;
		if (this.takingStep) {
			_tween?.update(_clock.getElapsedTime() * 1000);
		}
		if (steps.forward.length && !this.takingStep) {
			this.takingStep = true;
			const {cubes, axis, count, clockwise} = steps.forward.shift();
			const obj = {angle: 0};
			const totalAngle = (clockwise ? 1 : -1) * (Math.PI / 2) * count;
			const tween = new TWEEN.Tween(obj).to({angle: totalAngle}, 500);
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
			if (axis === "x") {
				axes.push("z", "y");
			}
			if (axis === "y") {
				axes.push("x", "z");
			}
			if (axis === "z") {
				axes.push("x", "y");
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
					const array: any[][] = [];
					const offset = (dimension - 1) / 2;
					const inc = size + gap;
					console.group();
					cubes.forEach((cube, i) => {
						const x = cube.position[axes[0]];
						const y = cube.position[axes[1]];
						const j2 = i % dimension;
						const k2 = Math.floor(i / dimension);
						let j = Math.round(y / inc) + offset;
						let k = Math.round(x / inc) + offset;
						// if (axis === "z") {
						// 	j = dimension - 1 - j;
						// }
						if (!array[j]) {
							array[j] = [];
						}
						// console.log({j, k}, cube.uuid);
						array[j][k] = cube.userData;
					});
					const newArray = this.rotateArray2D(array, axis === "y" ? clockwise : !clockwise);
					cubes.forEach((cube, i) => {
						const x = cube.position[axes[0]];
						const y = cube.position[axes[1]];
						const j2 = i % dimension;
						const k2 = Math.floor(i / dimension);
						let j = Math.round(y / inc) + offset;
						let k = Math.round(x / inc) + offset;
						// if (axis === "z") {
						// 	j = dimension - 1 - j;
						// }
						if (!array[j]) {
							array[j] = [];
						}
						cube.userData = newArray[j][k];
					});
					// for (let j = 0; j < newArray.length; j++) {
					// 	for (let k = 0; k < newArray[j].length; k++) {
					// 		const i = dimension * k + j;
					// 		cubes[i].userData = newArray[j][k];
					// 	}
					// }
					console.log(array, newArray);
					console.groupEnd();
					for (const v of array) {
						if (v.length !== dimension) {
							console.log(1);
							this.steps.forward.length = 0;
							return;
						}
					}
					const matrix = new Matrix4();
					if (axis === "x") {
						matrix.makeRotationX(totalAngle);
					}
					if (axis === "y") {
						matrix.makeRotationY(totalAngle);
					}
					if (axis === "z") {
						matrix.makeRotationZ(totalAngle);
					}
					cubes.forEach((cube) => {
						cube.applyMatrix4(matrix);
						cube.matrixWorldNeedsUpdate = true;
						this.add(cube);
					});
					this.remove(group);
					this._tween = null;
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
			const axis = ["y", "z"][MathUtils.randInt(0, 1)] as "x" | "y" | "z";
			const indexs = [2]; //[MathUtils.randInt(0, this.dimension - 1)];
			const clockwise = [true, false][MathUtils.randInt(0, 1)];
			setTimeout(() => {
				this.forward(i % 2 ? "y" : "z", [2], 1, true);
			}, 1000 * i);
			console.log({axis, indexs, clockwise});
		}
	}
}
