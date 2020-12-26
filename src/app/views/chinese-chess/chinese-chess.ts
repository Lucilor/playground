import {clamp, uniqueId} from "lodash";

export type ChineseChessSideName = "red" | "black";

const getLeft = (position: number[], step = 1) => [clamp(position[0] - step, 0, 9), position[1]];
const getRight = (position: number[], step = 1) => [clamp(position[0] + step, 0, 9), position[1]];
const getUp = (position: number[], step = 1) => [position[0], clamp(position[1] + step, 0, 9)];
const getDown = (position: number[], step = 1) => [position[0], clamp(position[1] - step, 0, 9)];

export class ChineseChessBoard {
    red = new ChineseChessSide("red", this);
    black = new ChineseChessSide("black", this);
    currentSide: ChineseChessSideName = "red";

    constructor() {}

    selectPiece(id: string | ChineseChessPiece) {
        if (this.currentSide === "red") {
            this.red.selectPiece(id);
        } else {
            this.black.selectPiece(id);
        }
    }

    movePiece(id: string, position: number[]) {}

    getValidMoves(piece: ChineseChessPiece) {}

    findPiece(id: string | ChineseChessPiece | number[]) {
        let piece = this.black.findPiece(id);
        if (!piece) {
            if (Array.isArray(id)) {
                id = [9 - id[0], 9 - id[1]];
            }
            piece = this.red.findPiece(id);
        }
        return piece;
    }
}

type ChineseChessPieceType = new (...args: any[]) => ChineseChessPiece;
export class ChineseChessSide {
    pieces: ChineseChessPiece[] = [];
    // get eatenPieces() {
    //     return this.pieces.filter((p) => p.eaten);
    // }

    constructor(public name: ChineseChessSideName, public board: ChineseChessBoard) {
        this.initPieces();
    }

    initPieces() {
        const initialPieces: [ChineseChessPieceType, number[][]][] = [
            [
                ChineseChessPawn,
                [
                    [0, 3],
                    [2, 3],
                    [4, 3],
                    [6, 3],
                    [8, 3]
                ]
            ],
            [
                ChineseChessCannon,
                [
                    [1, 2],
                    [7, 2]
                ]
            ],
            [
                ChineseChessChariot,
                [
                    [0, 0],
                    [8, 0]
                ]
            ],
            [
                ChineseChessHorse,
                [
                    [1, 0],
                    [7, 0]
                ]
            ],
            [
                ChineseChessElephant,
                [
                    [2, 0],
                    [6, 0]
                ]
            ],
            [
                ChineseChessAdvisor,
                [
                    [3, 0],
                    [5, 0]
                ]
            ],
            [ChineseChessGeneral, [[4, 0]]]
        ];
        this.pieces = [];
        initialPieces.forEach((v) => {
            v[1].forEach((vv) => this.pieces.push(new v[0](this, vv)));
        });
        return this;
    }

    selectPiece(id: string | ChineseChessPiece) {
        if (id instanceof ChineseChessPiece) {
            id = id.id;
        }
        this.pieces.forEach((piece) => {
            if (piece.id === id) {
                piece.selected = !piece.selected;
            } else {
                piece.selected = false;
            }
        });
        return this;
    }

    findPiece(id: string | ChineseChessPiece | number[]) {
        if (Array.isArray(id)) {
            const [x, y] = id;
            return this.pieces.find((p) => p.position[0] === x && p.position[1] === y);
        }
        if (id instanceof ChineseChessPiece) {
            id = id.id;
        }
        return this.pieces.find((p) => !p.eaten && p.id === id);
    }
}

export abstract class ChineseChessPiece {
    id = uniqueId("piece-");
    selected = false;
    abstract get path(): number[][];

    constructor(
        public side: ChineseChessSide,
        public name: {red: string; black: string},
        public position: number[],
        public eaten = false
    ) {}
}

export class ChineseChessPawn extends ChineseChessPiece {
    get path() {
        const position = this.position;
        if (position[1] > 4) {
            return [getUp(position), getLeft(position), getRight(position)];
        }
        return [getUp(position)];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "兵", black: "卒"}, position, eaten);
    }
}
export class ChineseChessCannon extends ChineseChessPiece {
    get path() {
        const board = this.side.board;
        const position = this.position;
        const leftPoints = [];
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "炮", black: "炮"}, position, eaten);
    }
}
export class ChineseChessChariot extends ChineseChessPiece {
    get path() {
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "車", black: "車"}, position, eaten);
    }
}
export class ChineseChessHorse extends ChineseChessPiece {
    get path() {
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "馬", black: "馬"}, position, eaten);
    }
}
export class ChineseChessElephant extends ChineseChessPiece {
    get path() {
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "相", black: "象"}, position, eaten);
    }
}
export class ChineseChessAdvisor extends ChineseChessPiece {
    get path() {
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "仕", black: "士"}, position, eaten);
    }
}
export class ChineseChessGeneral extends ChineseChessPiece {
    get path() {
        return [];
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "帥", black: "將"}, position, eaten);
    }
}
