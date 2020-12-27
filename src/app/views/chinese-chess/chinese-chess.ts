import {EventEmitter} from "events";
import {uniqueId} from "lodash";

export type ChineseChessSideName = "red" | "black";

const switchPosition = (position: number[]) => [8 - position[0], 9 - position[1]];

export interface ChineseChessEvents {
    pieceselect: [ChineseChessPiece];
    pieceunselect: [ChineseChessPiece];
}
export type ChineseChessEventCallBack<T extends keyof ChineseChessEvents> = (...params: ChineseChessEvents[T]) => void;

export class ChineseChessBoard extends EventEmitter {
    red = new ChineseChessSide("red", this);
    black = new ChineseChessSide("black", this);
    currentSide = this.red;

    // constructor() {}

    selectPiece(id: string | ChineseChessPiece) {
        if (this.currentSide.isRed) {
            this.red.selectPiece(id);
        } else if (this.currentSide.isBlack) {
            this.black.selectPiece(id);
        }
    }

    movePiece(id: string | ChineseChessPiece, position: number[]) {
        const currentSide = this.currentSide;
        const piece = currentSide.findPiece(id);
        if (!piece || !piece.path.find((p) => p[0] === position[0] && p[1] === position[1])) {
            return false;
        }
        let pieceToEat: ChineseChessPiece | undefined;
        if (currentSide.isRed) {
            pieceToEat = this.red.findPiece(position) || this.black.findPiece(switchPosition(position));
        } else {
            pieceToEat = this.black.findPiece(position) || this.red.findPiece(switchPosition(position));
        }
        piece.position = position;
        if (pieceToEat) {
            pieceToEat.eaten = true;
        }
        piece.selected = !piece.selected;
        this.currentSide = this.currentSide.isRed ? this.black : this.red;
        return true;
    }

    getValidMoves(piece: ChineseChessPiece) {}

    // findPiece(id: string | ChineseChessPiece | number[]) {
    //     let piece = this.black.findPiece(id);
    //     if (!piece && Array.isArray(id)) {
    //         piece = this.red.findPiece(switchPosition(id));
    //     }
    //     return piece;
    // }

    emit<T extends keyof ChineseChessEvents>(type: T, ...params: ChineseChessEvents[T]) {
        return super.emit(type, ...params);
    }

    on<T extends keyof ChineseChessEvents>(type: T, listener: ChineseChessEventCallBack<T>) {
        return super.on(type, listener as (...args: any[]) => void);
    }

    off<T extends keyof ChineseChessEvents>(type: T, listener: ChineseChessEventCallBack<T>) {
        return super.off(type, listener as (...args: any[]) => void);
    }
}

type ChineseChessPieceType = new (...args: any[]) => ChineseChessPiece;
export class ChineseChessSide {
    pieces: ChineseChessPiece[] = [];
    get isRed() {
        return this.name === "red";
    }
    get isBlack() {
        return this.name === "black";
    }
    get opponent() {
        if (this.isRed) {
            return this.board.black;
        } else {
            return this.board.red;
        }
    }
    // get eatenPieces() {
    //     return this.pieces.filter((p) => p.eaten);
    // }

    constructor(readonly name: ChineseChessSideName, public board: ChineseChessBoard) {
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
        let pieceFound: ChineseChessPiece | undefined;
        this.pieces.forEach((piece) => {
            if (piece.id === id) {
                pieceFound = piece;
            } else {
                piece.selected = false;
            }
        });
        if (pieceFound) {
            pieceFound.selected = !pieceFound.selected;
        }
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

    findOpponentPiece(id: string | ChineseChessPiece | number[]) {
        if (Array.isArray(id)) {
            return this.opponent.findPiece(switchPosition(id));
        }
        return this.opponent.findPiece(id);
    }
}

const getLeftUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[0] - maxStep : 0;
    for (let i = position[0] - 1; i >= j; i--) {
        const p = [i, position[1]];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
const getRightUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[0] + maxStep : 8;
    for (let i = position[0] + 1; i <= j; i++) {
        const p = [i, position[1]];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
const getUpUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[1] + maxStep : 9;
    for (let i = position[1] + 1; i <= j; i++) {
        const p = [position[0], i];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};
const getDownUntil = (position: number[], maxStep: number, until: (currPosition: number[]) => boolean) => {
    const result: number[][] = [];
    const j = maxStep > 0 ? position[1] - maxStep : 0;
    for (let i = position[1] - 1; i >= j; i--) {
        const p = [position[0], i];
        result.push(p);
        if (until(p)) {
            break;
        }
    }
    return result;
};

export abstract class ChineseChessPiece {
    id = uniqueId("piece-");
    private _selected = false;
    get selected() {
        return this._selected;
    }
    set selected(value) {
        if (this._selected !== value) {
            this._selected = value;
            if (value) {
                this.side.board.emit("pieceselect", this);
            } else {
                this.side.board.emit("pieceunselect", this);
            }
        }
    }
    abstract get path(): number[][];

    constructor(
        public side: ChineseChessSide,
        public name: {red: string; black: string},
        public position: number[],
        public eaten = false
    ) {}

    private _isPositionBlocked(p: number[]) {
        return !!(this.side.findPiece(p) || this.side.findOpponentPiece(p));
    }

    private _filterPath(path: number[][]) {
        return path.filter((postion) => !this.side.findPiece(postion));
    }

    protected _getLeft(maxStep = 0) {
        return this._filterPath(getLeftUntil(this.position, maxStep, (p) => this._isPositionBlocked(p)));
    }

    protected _getRight(maxStep = 0) {
        return this._filterPath(getRightUntil(this.position, maxStep, (p) => this._isPositionBlocked(p)));
    }

    protected _getUp(maxStep = 0) {
        return this._filterPath(getUpUntil(this.position, maxStep, (p) => this._isPositionBlocked(p)));
    }

    protected _getDown(maxStep = 0) {
        return this._filterPath(getDownUntil(this.position, maxStep, (p) => this._isPositionBlocked(p)));
    }
}

export class ChineseChessPawn extends ChineseChessPiece {
    get path() {
        const position = this.position;
        if (position[1] > 4) {
            return [...this._getUp(1), ...this._getLeft(1), ...this._getRight(1)];
        } else {
            return this._getUp(1);
        }
    }

    constructor(public side: ChineseChessSide, public position: number[], public eaten = false) {
        super(side, {red: "兵", black: "卒"}, position, eaten);
    }
}
export class ChineseChessCannon extends ChineseChessPiece {
    get path() {
        const left = this._getLeft();
        const right = this._getRight();
        const up = this._getUp();
        const down = this._getDown();
        if (left.length) {
            const mostLeft = left[left.length - 1];
            const piece = this.side.findOpponentPiece(mostLeft);
            if (piece) {
                const left2 = getLeftUntil(mostLeft, 0, (p) => !!this.side.findOpponentPiece(p));
                if (left2.length) {
                    left[left.length - 1] = left2[left2.length - 1];
                } else {
                    left.pop();
                }
            }
        }
        if (right.length) {
            const mostRight = right[right.length - 1];
            const piece = this.side.findOpponentPiece(mostRight);
            if (piece) {
                const right2 = getDownUntil(mostRight, 0, (p) => !!this.side.findOpponentPiece(p));
                if (right2.length) {
                    right[right.length - 1] = right2[right2.length - 1];
                } else {
                    right.pop();
                }
            }
        }
        if (up.length) {
            const mostUp = up[up.length - 1];
            const piece = this.side.findOpponentPiece(mostUp);
            if (piece) {
                const up2 = getUpUntil(mostUp, 0, (p) => !!this.side.findOpponentPiece(p));
                if (up2.length) {
                    up[up.length - 1] = up2[up2.length - 1];
                } else {
                    up.pop();
                }
            }
        }
        if (down.length) {
            const mostDown = down[down.length - 1];
            const piece = this.side.findOpponentPiece(mostDown);
            if (piece) {
                const down2 = getDownUntil(mostDown, 0, (p) => !!this.side.findOpponentPiece(p));
                if (down2.length) {
                    down[down.length - 1] = down2[down2.length - 1];
                } else {
                    down.pop();
                }
            }
        }
        return [...left, ...right, ...up, ...down];
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
