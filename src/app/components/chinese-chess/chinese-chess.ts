import {EventEmitter} from "events";
import {inRange, uniqueId} from "lodash";
import {
    chineseChessBoardSize,
    getDownUntil,
    getLeftUntil,
    getRightUntil,
    getUpUntil,
    isPositionInPath,
    switchPosition
} from "./chinese-chess-helper";

export type ChineseChessSideName = "red" | "black";
export type ChineseChessPieceMove = {
    piece: ChineseChessPiece;
    from: number[];
    to: number[];
    eaten?: ChineseChessPiece;
};
export type ChineseChessPieceType = "pawn" | "cannon" | "chariot" | "horse" | "elephant" | "advisor" | "general";
export type ChineseChessPieceInfo = {id?: string; type: ChineseChessPieceType; position: number[]; side: ChineseChessSideName};
export type ChineseChessBoardInfo = {
    red: ChineseChessPieceInfo[];
    black: ChineseChessPieceInfo[];
    currentSide: ChineseChessSideName;
    brinkmate: boolean;
};
const {width, height} = chineseChessBoardSize;

export interface ChineseChessEvents {
    pieceselect: [ChineseChessPiece];
    pieceunselect: [ChineseChessPiece];
    forward: [ChineseChessPieceMove];
    backward: [ChineseChessPieceMove];
    checkmate: [ChineseChessSide];
    brinkmate: [ChineseChessSide];
}
export type ChineseChessEventCallBack<T extends keyof ChineseChessEvents> = (...params: ChineseChessEvents[T]) => void;

export class ChineseChessBoard extends EventEmitter {
    red = new ChineseChessSide("red", this);
    black = new ChineseChessSide("black", this);
    currentSide = this.red;
    history: ChineseChessPieceMove[] = [];
    brinkmate = false;

    constructor(info?: ChineseChessBoardInfo) {
        super();
        this.on("checkmate", (side) => {
            if (this.brinkmate) {
                return;
            }
            const opponent = side.opponent;
            for (const move of opponent.getAllMoves()) {
                if (!this.testMove(move, () => side.checkmate())) {
                    return;
                }
            }
            this.brinkmate = true;
            this.emit("brinkmate", side);
        });
        this.load(info);
    }

    load(info?: ChineseChessBoardInfo) {
        this.red.load(info?.red);
        this.black.load(info?.black);
        this.currentSide = info?.currentSide === "black" ? this.black : this.red;
        this.brinkmate = info?.brinkmate === true;
    }

    save(withId = true): ChineseChessBoardInfo {
        return {
            red: this.red.save(withId),
            black: this.black.save(withId),
            currentSide: this.currentSide.name,
            brinkmate: this.brinkmate
        };
    }

    selectPiece(id: string) {
        if (this.brinkmate) {
            return false;
        }
        if (this.currentSide.isRed) {
            return this.red.selectPiece(id);
        } else if (this.currentSide.isBlack) {
            return this.black.selectPiece(id);
        }
        return false;
    }

    forward(id: string, position: number[]) {
        if (this.brinkmate) {
            return false;
        }
        const currentSide = this.currentSide;
        const piece = currentSide.findOwnPiece(id);
        if (!piece || !isPositionInPath(position, piece.path) || currentSide.findOwnPiece(position)) {
            return false;
        }
        const target = currentSide.findOpponentPiece(position);
        const move: ChineseChessPieceMove = {piece, from: piece.position.slice(), to: position.slice(), eaten: target};
        piece.moveTo(position);
        target?.kill();
        this.history.push({...move});
        if (target instanceof ChineseChessGeneral) {
            this.brinkmate = true;
            this.emit("brinkmate", currentSide);
            return true;
        }
        this.switchSide();
        this.emit("forward", move);
        if (currentSide.checkmate()) {
            this.emit("checkmate", currentSide);
        }
        return true;
    }

    backward() {
        const move = this.history.pop();
        if (move) {
            const piece = move.piece.side.findOwnPiece(move.piece.id);
            piece?.moveTo(move.from);
            move.eaten?.revive();
            this.switchSide();
            this.emit("backward", move);
            this.brinkmate = false;
            return true;
        }
        return false;
    }

    testMove<T>(move: ChineseChessPieceMove, testFn: (...args: any[]) => T) {
        const {from, to, piece, eaten} = move;
        const side = this.currentSide;
        piece.moveTo(to);
        eaten?.kill();
        const brinkmate = this.brinkmate;
        if (eaten instanceof ChineseChessGeneral) {
            this.brinkmate = true;
        }
        this.switchSide(side.opponent);
        const result = testFn();
        piece.moveTo(from);
        eaten?.revive();
        this.brinkmate = brinkmate;
        this.switchSide(side);
        return result;
    }

    switchSide(side = this.currentSide.opponent) {
        this.currentSide = side;
    }

    findPiece(id: string | number[]) {
        return this.currentSide.findPiece(id);
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
    get general() {
        const result = this.pieces.find((v) => v instanceof ChineseChessGeneral);
        if (!result) {
            throw new Error("General not found.");
        }
        return result;
    }

    constructor(readonly name: ChineseChessSideName, public board: ChineseChessBoard) {
        this.load();
    }

    load(pieces?: ChineseChessPieceInfo[]) {
        if (!pieces) {
            pieces = [
                {type: "pawn", position: [0, 3]},
                {type: "pawn", position: [2, 3]},
                {type: "pawn", position: [4, 3]},
                {type: "pawn", position: [6, 3]},
                {type: "pawn", position: [8, 3]},
                {type: "cannon", position: [1, 2]},
                {type: "cannon", position: [7, 2]},
                {type: "chariot", position: [0, 0]},
                {type: "chariot", position: [8, 0]},
                {type: "horse", position: [1, 0]},
                {type: "horse", position: [7, 0]},
                {type: "elephant", position: [2, 0]},
                {type: "elephant", position: [6, 0]},
                {type: "advisor", position: [3, 0]},
                {type: "advisor", position: [5, 0]},
                {type: "general", position: [4, 0]}
            ].map((v) => ({...v, side: this.name})) as ChineseChessPieceInfo[];
        }
        this.pieces = pieces.map((p) => createPiece(this.board, p));
        this.graveyard = [];
        return this;
    }

    save(withId = true): ChineseChessPieceInfo[] {
        return this.pieces.map((p) => {
            const info = p.info;
            if (!withId) {
                delete info.id;
            }
            return info;
        });
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

    findOwnPiece(id: string | number[]) {
        if (Array.isArray(id)) {
            const [x, y] = id;
            return this.pieces.find((p) => p.position[0] === x && p.position[1] === y);
        } else {
            return this.pieces.find((p) => !p.dead && p.id === id);
        }
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
        if (!id) {
            return false;
        }
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
        if (!id) {
            return false;
        }
        const index = this.graveyard.findIndex((p) => p.id === id);
        if (index > -1) {
            const piece = this.graveyard.splice(index, 1)[0];
            piece.dead = false;
            this.pieces.push(piece);
            return true;
        }
        return false;
    }

    checkmate() {
        const position = switchPosition(this.opponent.general.position);
        for (const piece of this.pieces) {
            if (isPositionInPath(position, piece.path)) {
                return true;
            }
        }
        return false;
    }

    getAllMoves() {
        const moves: ChineseChessPieceMove[] = [];
        this.pieces.forEach((piece) => {
            const from = piece.position.slice();
            piece.path.forEach((position) => {
                moves.push({from, to: position, piece, eaten: this.findOpponentPiece(position)});
            });
        });
        return moves;
    }
}

export abstract class ChineseChessPiece {
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
    get name() {
        return this.names[this.side.name];
    }
    get info(): ChineseChessPieceInfo {
        return {id: this.id, type: this.type, position: this.position.slice(), side: this.side.name};
    }

    constructor(
        public type: ChineseChessPieceType,
        public side: ChineseChessSide,
        public names: {red: string; black: string},
        public position: number[],
        public id = uniqueId("piece-"),
        public dead = false
    ) {}

    abstract clone(id?: string): ChineseChessPiece;

    private _isPositionBlocked(p: number[]) {
        return !!this.side.findPiece(p);
    }

    protected _filterPath(path: number[][]) {
        return path.filter(
            (postion) => !this.side.findOwnPiece(postion) && inRange(postion[0], width + 1) && inRange(postion[1], height + 1)
        );
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

    moveTo(position: number[]) {
        this.position = position;
    }

    kill() {
        this.side.killPiece(this.id);
    }

    revive() {
        this.side.revivePiece(this.id);
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

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("pawn", side, {red: "兵", black: "卒"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessPawn(this.side, this.position.slice(), id, this.dead);
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
                const piece = this.side.findOpponentPiece(path2[path2.length - 1]);
                return piece;
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
                const up2 = getUpUntil(mostUp, 0, (p) => !!this.side.findPiece(p));
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

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("cannon", side, {red: "炮", black: "炮"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessCannon(this.side, this.position.slice(), id, this.dead);
    }
}
export class ChineseChessChariot extends ChineseChessPiece {
    get path() {
        return this._filterPath([...this._getLeft(), ...this._getRight(), ...this._getUp(), ...this._getDown()]);
    }

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("chariot", side, {red: "車", black: "車"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessChariot(this.side, this.position.slice(), id, this.dead);
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

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("horse", side, {red: "馬", black: "馬"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessHorse(this.side, this.position.slice(), id, this.dead);
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

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("elephant", side, {red: "相", black: "象"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessElephant(this.side, this.position.slice(), id, this.dead);
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

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("advisor", side, {red: "仕", black: "士"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessAdvisor(this.side, this.position.slice(), id, this.dead);
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
        const position = switchPosition(this.side.opponent.general.position);
        const up = this._getUp();
        if (up.length) {
            const mostUp = up[up.length - 1];
            if (mostUp[0] === position[0] && mostUp[1] === position[1]) {
                result.push(position);
            }
        }
        // if (position[0] === this.position[0]) {
        // }
        return this._filterPath(result);
    }

    constructor(side: ChineseChessSide, position: number[], id?: string, dead = false) {
        super("general", side, {red: "帥", black: "將"}, position, id, dead);
    }

    clone(id = this.id) {
        return new ChineseChessGeneral(this.side, this.position.slice(), id, this.dead);
    }
}

const createPiece = (board: ChineseChessBoard, info: ChineseChessPieceInfo) => {
    const {id, type, position} = info;
    const side = info.side === "black" ? board.black : board.red;
    switch (type) {
        case "pawn":
            return new ChineseChessPawn(side, position, id);
        case "cannon":
            return new ChineseChessCannon(side, position, id);
        case "chariot":
            return new ChineseChessChariot(side, position, id);
        case "horse":
            return new ChineseChessHorse(side, position, id);
        case "elephant":
            return new ChineseChessElephant(side, position, id);
        case "advisor":
            return new ChineseChessAdvisor(side, position, id);
        case "general":
            return new ChineseChessGeneral(side, position, id);
    }
};
