import {Object3D, BoxGeometry, Color, MeshLambertMaterial, Mesh, Vector3, Clock, Matrix4, MathUtils, TextureLoader, Texture} from "three";
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
    steps: {queue: RubiksCubeStep[]; histroy: RubiksCubeStep[]} = {queue: [], histroy: []};
    // TODO: error in private _tween: TWEEN.Tween;
    private _tween: any;
    private _clock = new Clock(false);
    private _texture?: Texture;

    constructor(size = 5, dimension = 3, gap = 0.25) {
        super();
        this.size = size;
        this.dimension = dimension;
        this.gap = gap;
        this.reset();
    }

    async loadTexture() {
        try {
            this._texture = await new TextureLoader().loadAsync("assets/cube-texture.jpg");
            return true;
        } catch (error) {
            return false;
        }
    }

    private _getCube() {
        const {_texture, size, colors} = this;
        // TODO: rounded cube
        // const shape = new Shape();
        // const eps = 0.00001;
        // const radius0 = size / 10;
        // const depth = size;
        // const smoothness = 16;
        // const radius = radius0 - eps;
        // shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
        // shape.absarc(eps, size - radius * 2, eps, Math.PI, Math.PI / 2, true);
        // shape.absarc(size - radius * 2, size - radius * 2, eps, Math.PI / 2, 0, true);
        // shape.absarc(size - radius * 2, eps, eps, 0, -Math.PI / 2, true);
        // const geometry = new ExtrudeBufferGeometry(shape, {
        // 	depth: depth - radius0 * 2,
        // 	bevelEnabled: true,
        // 	bevelSegments: smoothness * 2,
        // 	steps: 1,
        // 	bevelSize: radius,
        // 	bevelThickness: radius0,
        // 	curveSegments: smoothness
        // });
        const geometry = new BoxGeometry(size, size, size);
        const materials: MeshLambertMaterial[] = [];
        const order: (keyof RubiksCubeColors)[] = ["R", "L", "U", "D", "F", "B"];
        for (const face of order) {
            const color = colors[face];
            const material = new MeshLambertMaterial({color, map: _texture});
            materials.push(material);
        }
        return new Mesh(geometry, materials);
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
                    const cube = this._getCube();
                    const x = (i - offset) * inc;
                    const y = (j - offset) * inc;
                    const z = (k - offset) * inc;
                    cube.position.set(x, y, z);
                    cube.userData = {x: i, y: j, z: k};
                    this.add(cube);
                }
            }
        }
        return this;
    }

    forward(step: RubiksCubeStep): this;
    forward(axis: Axis, indices?: number | number[], clockwise?: boolean, duration?: number): this;
    forward(axis: Axis | RubiksCubeStep, indices?: number | number[], clockwise?: boolean, duration = this.stepDuration) {
        if (typeof axis === "string") {
            clockwise = !!clockwise;
            if (typeof indices === "number") {
                indices = [indices];
            } else if (!Array.isArray(indices)) {
                indices = [];
            }
            this.steps.queue.push({axis, indices, clockwise, duration, forsaken: false});
        } else {
            this.steps.queue.push(axis);
        }
        return this;
    }

    back(duration = this.stepDuration) {
        const step = this.steps.histroy.pop();
        if (step) {
            step.clockwise = !step.clockwise;
            step.duration = duration;
            step.forsaken = true;
            this.steps.queue.push(step);
        }
        return this;
    }

    update() {
        const {steps, _tween, _clock, size, dimension, gap} = this;
        _tween?.update(_clock.getElapsedTime() * 1000);
        if (steps.queue.length && !this.takingStep) {
            const step = steps.queue.shift() as RubiksCubeStep;
            this.takingStep = true;
            const {indices, axis, clockwise} = step;
            const duration = step.duration && step.duration > 0 ? step.duration : this.stepDuration;
            const forsaken = step.forsaken === true ? true : false;
            const layers: Object3D[][] = [];
            if (!forsaken) {
                steps.histroy.push(step);
            }
            indices.forEach((i, j) => {
                layers[j] = [];
                this.children.forEach((o) => {
                    if (o.userData[axis] === i) {
                        layers[j].push(o);
                    }
                });
            });
            const obj = {angle: 0};
            const totalAngle = (clockwise ? 1 : -1) * (Math.PI / 2);
            const tween = new TWEEN.Tween(obj).to({angle: totalAngle}, duration);
            const axisVector = new Vector3();
            axisVector[axis] = 1;
            let lastAngle = 0;
            const group = new Object3D();
            this.add(group);
            layers.forEach((cubes) => {
                cubes.forEach((cube) => {
                    group.add(cube);
                    this.remove(cube);
                });
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
                    const array: any[][][] = [];
                    const offset = (dimension - 1) / 2;
                    const inc = size + gap;
                    layers.forEach((cubes, i) => {
                        array[i] = [];
                        cubes.forEach((cube) => {
                            const x = cube.position[axes[0]];
                            const y = cube.position[axes[1]];
                            const j = Math.round(y / inc + offset);
                            const k = Math.round(x / inc + offset);
                            if (!array[i][j]) {
                                array[i][j] = [];
                            }
                            array[i][j][k] = cube.userData;
                        });
                    });

                    for (const v of array) {
                        if (v.length !== dimension) {
                            throw new Error("Something goes wrong when taking a step.");
                        }
                    }
                    // TODO: axis y has different clockwise
                    const newArray: any[][][] = [];
                    array.forEach((v, i) => (newArray[i] = this.rotateArray2D(v, axis === "y" ? clockwise : !clockwise)));
                    layers.forEach((cubes, i) => {
                        cubes.forEach((cube) => {
                            const x = cube.position[axes[0]];
                            const y = cube.position[axes[1]];
                            const j = Math.round(y / inc + offset);
                            const k = Math.round(x / inc + offset);
                            cube.userData = newArray[i][j][k];

                            cube.applyMatrix4(matrix);
                            cube.matrixWorldNeedsUpdate = true;
                            this.add(cube);
                        });
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
            this.forward(axis, indices, clockwise, duration);
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
        let steps: RubiksCubeStep[] = [];
        let stepsGroup: RubiksCubeStep[] = [];
        let step: RubiksCubeStep | undefined;
        let subCmd = "";
        let stack = 0;
        const allIndices = [];
        const mid = (dimension - 1) / 2;
        const midIndices = mid % 1 === 0 ? [mid] : [mid - 0.5, mid + 0.5];
        for (let i = 0; i < dimension; i++) {
            allIndices.push(i);
        }
        for (const char of cmd) {
            if (char === "(") {
                stack++;
                continue;
            } else if (char === ")") {
                if (stack === 1) {
                    const numCmd = Number(subCmd);
                    if (isNaN(numCmd)) {
                        stepsGroup = this._parseCommand(subCmd);
                        steps = steps.concat(stepsGroup);
                    } else {
                        const indices = step?.indices;
                        if (indices?.length === 1 && numCmd > 0 && numCmd <= dimension) {
                            if (indices[0] === 0) {
                                indices[0] += numCmd - 1;
                            } else if (indices[0] === dimension - 1) {
                                indices[0] -= numCmd - 1;
                            } else {
                                throw new Error(`Illegal command: (${subCmd})`);
                            }
                        } else {
                            throw new Error(`Illegal command: (${subCmd})`);
                        }
                    }
                    subCmd = "";
                }
                stack--;
                continue;
            }
            if (stack > 0) {
                subCmd += char;
                continue;
            }
            const numChar = Number(char);
            if (char === "'") {
                if (!step) {
                    throw new Error(`Illegal character: ${char}.`);
                }
                step.clockwise = !step.clockwise;
            } else if (!isNaN(numChar)) {
                for (let i = 0; i < numChar - 1; i++) {
                    if (stepsGroup.length < 1 && step) {
                        steps.push(step);
                    } else {
                        steps = steps.concat(stepsGroup);
                    }
                }
            } else {
                switch (char) {
                    case "F":
                        step = {axis: "z", indices: [dimension - 1], clockwise: false};
                        break;
                    case "f":
                        step = {axis: "z", indices: [dimension - 1, dimension - 2], clockwise: false};
                        break;
                    case "B":
                        step = {axis: "z", indices: [0], clockwise: true};
                        break;
                    case "b":
                        step = {axis: "z", indices: [0, 1], clockwise: true};
                        break;
                    case "U":
                        step = {axis: "y", indices: [dimension - 1], clockwise: false};
                        break;
                    case "u":
                        step = {axis: "y", indices: [dimension - 1, dimension - 2], clockwise: false};
                        break;
                    case "D":
                        step = {axis: "y", indices: [0], clockwise: true};
                        break;
                    case "d":
                        step = {axis: "y", indices: [0, 1], clockwise: true};
                        break;
                    case "L":
                        step = {axis: "x", indices: [0], clockwise: true};
                        break;
                    case "l":
                        step = {axis: "x", indices: [0, 1], clockwise: true};
                        break;
                    case "R":
                        step = {axis: "x", indices: [dimension - 1], clockwise: false};
                        break;
                    case "r":
                        step = {axis: "x", indices: [dimension - 1, dimension - 2], clockwise: false};
                        break;
                    case "x":
                        step = {axis: "x", indices: allIndices, clockwise: false};
                        break;
                    case "y":
                        step = {axis: "y", indices: allIndices, clockwise: false};
                        break;
                    case "z":
                        step = {axis: "z", indices: allIndices, clockwise: false};
                        break;
                    case "M":
                        step = {axis: "x", indices: midIndices, clockwise: false};
                        break;
                    case "E":
                        step = {axis: "y", indices: midIndices, clockwise: false};
                        break;
                    case "S":
                        step = {axis: "z", indices: midIndices, clockwise: false};
                        break;
                    default:
                        throw new Error(`Illegal character: ${char}.`);
                }
                steps.push(step);
            }
        }
        if (stack) {
            throw new Error(`Illegal command: brackets not match.`);
        }
        return steps;
    }
}
