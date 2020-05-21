import {Object3D, BoxGeometry, Color, MeshLambertMaterial, Mesh} from "three";

export interface RubiksCubeColors {
	F: Color;
	B: Color;
	U: Color;
	D: Color;
	L: Color;
	R: Color;
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
	constructor(size = 5, dimension = 3) {
		super();
		this.size = size;
		this.dimension = dimension;

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
					this.add(cube);
				}
			}
		}
	}

	newCube() {
		const {size} = this;
		const geometry = new BoxGeometry(size, size, size);
		const materials: MeshLambertMaterial[] = [];
		for (const face in this.colors) {
			const color = this.colors[face];
			materials.push(new MeshLambertMaterial({color}));
		}
		return new Mesh(geometry, materials);
	}
}
