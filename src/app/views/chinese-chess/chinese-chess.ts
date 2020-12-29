import {EventEmitter} from "events";
import {inRange, uniqueId} from "lodash";

export type ChineseChessSideName = "red" | "black";

const switchPosition = (position: number[]) => [8 - position[0], 9 - position[1]];

export interface ChineseChessEvents {
    pieceselect: [ChineseChessPiece];
    pieceunselect: [ChineseChessPiece];
    piecemove: [{piece: ChineseChessPiece; from: number[]; to: number[]; eaten?: ChineseChessPiece}];
}
export type ChineseChessEventCallBack<T extends keyof ChineseChessEvents> = (...params: ChineseChessEvents[T]) => void;

export class ChineseChessBoard extends EventEmitter {
    red = new ChineseChessSide("red", this);
    black = new ChineseChessSide("black", this);
    currentSide = this.red;

    // constructor() {}

    selectPiece(id: string) {
        if (this.currentSide.isRed) {
            this.red.selectPiece(id);
        } else if (this.currentSide.isBlack) {
            this.black.selectPiece(id);
        }
    }

    movePiece(id: string, position: number[]) {
        const currentSide = this.currentSide;
        const piece = currentSide.findOwnPiece(id);
        if (!piece || !piece.path.find((p) => p[0] === position[0] && p[1] === position[1]) || currentSide.findOwnPiece(position)) {
            return false;
        }
        const target = currentSide.findOpponentPiece(position);
        this.emit("piecemove", {piece, from: piece.position.slice(), to: position.slice(), eaten: target});
        piece.position = position;
        if (target) {
            currentSide.opponent.killPiece(target.id);
        }
        piece.selected = !piece.selected;
        this.currentSide = this.currentSide.opponent;
        return true;
    }

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
    graveyard: ChineseChessPiece[] = [];
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

    selectPiece(id: string) {
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

    findOwnPiece(id: string | number[], includeEaten = false) {
        let found: ChineseChessPiece | undefined;
        if (Array.isArray(id)) {
            const [x, y] = id;
            found = this.pieces.find((p) => p.position[0] === x && p.position[1] === y);
        } else {
            found = this.pieces.find((p) => !p.dead && p.id === id);
        }
        if (found && found.dead && !includeEaten) {
            return;
        }
        return found;
    }

    findOpponentPiece(id: string | number[]) {
        if (Array.isArray(id)) {
            return this.opponent.findOwnPiece(switchPosition(id));
        }
        return this.opponent.findOwnPiece(id);
    }

    findPiece(id: string | number[]) {
        return this.findOwnPiece(id) || this.findOpponentPiece(id);
    }

    killPiece(id: string) {
        const index = this.pieces.findIndex((p) => p.id === id);
        if (index > -1) {
            const piece = this.pieces.splice(index, 1)[0];
            piece.dead = true;
            this.graveyard.push(piece);
            return true;
        }
        return false;
    }

    revivePiece(id: string) {
        const index = this.graveyard.findIndex((p) => p.id === id);
        if (index > -1) {
            const piece = this.graveyard.splice(index, 1)[0];
            piece.dead = false;
            this.pieces.push(piece);
            return true;
        }
        return false;
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

    constructor(public side: ChineseChessSide, public name: {red: string; black: string}, public position: number[], public dead = false) {}

    abstract clone(): ChineseChessPiece;

    private _isPositionBlocked(p: number[]) {
        return !!this.side.findPiece(p);
    }

    protected _filterPath(path: number[][]) {
        return path.filter((postion) => !this.side.findOwnPiece(postion) && inRange(postion[0], 9) && inRange(postion[1], 10));
    }

    protected _getLeft(maxStep = 0, position = this.position) {
        return getLeftUntil(position, maxStep, (p) => this._isPositionBlocked(p));
    }

    protected _getRight(maxStep = 0, position = this.position) {
        return getRightUntil(position, maxStep, (p) => this._isPositionBlocked(p));
    }

    protected _getUp(maxStep = 0, position = this.position) {
        return getUpUntil(position, maxStep, (p) => this._isPositionBlocked(p));
    }

    protected _getDown(maxStep = 0, position = this.position) {
        return getDownUntil(position, maxStep, (p) => this._isPositionBlocked(p));
    }
}

export class ChineseChessPawn extends ChineseChessPiece {
    get path() {
        const position = this.position;
        if (position[1] > 4) {
            return this._filterPath([...this._getUp(1), ...this._getLeft(1), ...this._getRight(1)]);
        } else {
            return this._filterPath(this._getUp(1));
        }
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "兵", black: "卒"}, position, dead);
    }

    clone() {
        return new ChineseChessPawn(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessCannon extends ChineseChessPiece {
    get path() {
        const left = this._getLeft();
        const right = this._getRight();
        const up = this._getUp();
        const down = this._getDown();
        const findPiece = (path2: number[][]) => {
            if (path2.length) {
                return this.side.findOpponentPiece(path2[path2.length - 1]);
            }
            return;
        };
        if (left.length) {
            const mostLeft = left[left.length - 1];
            const piece = this.side.findPiece(mostLeft);
            if (piece) {
                const left2 = getLeftUntil(mostLeft, 0, (p) => !!this.side.findOpponentPiece(p));
                if (findPiece(left2)) {
                    left[left.length - 1] = left2[left2.length - 1];
                } else {
                    left.pop();
                }
            }
        }
        if (right.length) {
            const mostRight = right[right.length - 1];
            const piece = this.side.findPiece(mostRight);
            if (piece) {
                const right2 = getRightUntil(mostRight, 0, (p) => !!this.side.findOpponentPiece(p));
                if (findPiece(right2)) {
                    right[right.length - 1] = right2[right2.length - 1];
                } else {
                    right.pop();
                }
            }
        }
        if (up.length) {
            const mostUp = up[up.length - 1];
            const piece = this.side.findPiece(mostUp);
            if (piece) {
                const up2 = getUpUntil(mostUp, 0, (p) => !!this.side.findOpponentPiece(p));
                if (findPiece(up2)) {
                    up[up.length - 1] = up2[up2.length - 1];
                } else {
                    up.pop();
                }
            }
        }
        if (down.length) {
            const mostDown = down[down.length - 1];
            const piece = this.side.findPiece(mostDown);
            if (piece) {
                const down2 = getDownUntil(mostDown, 0, (p) => !!this.side.findOpponentPiece(p));
                if (findPiece(down2)) {
                    down[down.length - 1] = down2[down2.length - 1];
                } else {
                    down.pop();
                }
            }
        }
        return [...left, ...right, ...up, ...down];
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "炮", black: "炮"}, position, dead);
    }

    clone() {
        return new ChineseChessCannon(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessChariot extends ChineseChessPiece {
    get path() {
        return this._filterPath([...this._getLeft(), ...this._getRight(), ...this._getUp(), ...this._getDown()]);
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "車", black: "車"}, position, dead);
    }

    clone() {
        return new ChineseChessChariot(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessHorse extends ChineseChessPiece {
    get path() {
        const [x, y] = this.position;
        const result = [
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [-2, -1],
            [-2, 1],
            [2, -1],
            [2, 1]
        ]
            .filter((v) => {
                const vv = v.map((vvv) => (vvv === 2 ? 1 : vvv === -2 ? -1 : 0));
                return !this.side.findPiece([x + vv[0], y + vv[1]]);
            })
            .map((v) => [x + v[0], y + v[1]]);
        return this._filterPath(result);
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "馬", black: "馬"}, position, dead);
    }

    clone() {
        return new ChineseChessHorse(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessElephant extends ChineseChessPiece {
    get path() {
        const [x, y] = this.position;
        const result = [
            [-2, -2],
            [-2, 2],
            [2, -2],
            [2, 2]
        ]
            .filter((v) => {
                const vv = v.map((vvv) => (vvv === 2 ? 1 : -1));
                return !this.side.findPiece([x + vv[0], y + vv[1]]);
            })
            .map((v) => [x + v[0], y + v[1]]);
        return this._filterPath(result);
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "相", black: "象"}, position, dead);
    }

    clone() {
        return new ChineseChessElephant(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessAdvisor extends ChineseChessPiece {
    get path() {
        const [x, y] = this.position;
        const result = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1]
        ]
            .map((v) => [x + v[0], y + v[1]])
            .filter((v) => inRange(v[0], 3, 6) && inRange(v[1], 0, 3));
        return this._filterPath(result);
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "仕", black: "士"}, position, dead);
    }

    clone() {
        return new ChineseChessAdvisor(this.side, this.position.slice(), this.dead);
    }
}
export class ChineseChessGeneral extends ChineseChessPiece {
    get path() {
        const [x, y] = this.position;
        const result = [
            [-1, 0],
            [0, -1],
            [1, 0],
            [0, 1]
        ]
            .map((v) => [x + v[0], y + v[1]])
            .filter((v) => inRange(v[0], 3, 6) && inRange(v[1], 0, 3));
        return this._filterPath(result);
    }

    constructor(public side: ChineseChessSide, public position: number[], public dead = false) {
        super(side, {red: "帥", black: "將"}, position, dead);
    }

    clone() {
        return new ChineseChessGeneral(this.side, this.position.slice(), this.dead);
    }
}
