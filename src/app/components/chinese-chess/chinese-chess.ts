import {EventEmitter} from "events";
import {inRange, uniqueId} from "lodash";
import {
    CC_BOARD_HEIGHT,
    CC_BOARD_WIDTH,
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
export type ChineseChessPieceMovePlain = {
    piece: string;
    from: number[];
    to: number[];
    eaten?: string;
};
export type ChineseChessPieceType = "pawn" | "cannon" | "chariot" | "horse" | "elephant" | "advisor" | "general";
export type ChineseChessPieceInfo = {id?: string; type: ChineseChessPieceType; position: number[]; side: ChineseChessSideName};
export type ChineseChessSideInfo = {pieces?: ChineseChessPieceInfo[]; graveyard?: ChineseChessPieceInfo[]};
export type ChineseChessBoardInfo = {
    red: ChineseChessSideInfo;
    black: ChineseChessSideInfo;
    currentSide: ChineseChessSideName;
    brinkmate: boolean;
    histroy?: ChineseChessPieceMovePlain[];
};
const initialPieces: Omit<ChineseChessPieceInfo, "side">[] = [
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
];
export const getMovesPlain = (moves: ChineseChessPieceMove[]): ChineseChessPieceMovePlain[] =>
    moves.map((move) => ({
        from: move.from,
        to: move.to,
        piece: move.piece.id,
        eaten: move.eaten?.id
    }));
export const getMoves = (moves: ChineseChessPieceMovePlain[], board: ChineseChessBoard): ChineseChessPieceMove[] =>
    moves.map((move) => ({
        from: move.from,
        to: move.to,
        piece: board.findPiece(move.piece, true),
        eaten: board.findPiece(move.eaten)
    }));

export interface ChineseChessEvents {
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
        if (info?.histroy) {
            this.history = getMoves(info.histroy, this);
        } else {
            this.history = [];
        }
    }

    save(withHistory = false, withId = true): ChineseChessBoardInfo {
        return {
            red: this.red.save(withId),
            black: this.black.save(withId),
            currentSide: this.currentSide.name,
            brinkmate: this.brinkmate,
            histroy: withHistory ? getMovesPlain(this.history) : undefined
        };
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

    findPiece(id?: string | number[]): ChineseChessPiece | undefined;
    findPiece(id: string | number[], force: true): ChineseChessPiece;
    findPiece(id?: string | number[], force?: true) {
        const piece = this.currentSide.findPiece(id);
        if (!piece && force) {
            throw new Error("can not find piece: " + JSON.stringify(id));
        }
        return piece;
    }

    swapPieces(...ids: (string | number[] | ChineseChessPiece)[]) {
        for (let i = 1; i < ids.length; i++) {
            const prevId = ids[i - 1];
            const currId = ids[i];
            const prev = prevId instanceof ChineseChessPiece ? prevId : this.findPiece(prevId);
            const curr = currId instanceof ChineseChessPiece ? currId : this.findPiece(currId);
            console.log(prevId, currId);
            if (prev && curr) {
                if (prev.dead && !curr.dead) {
                    prev.revive();
                    curr.kill();
                } else if (!prev.dead && curr.dead) {
                    prev.kill();
                    curr.revive();
                }
                if (prev.side.name === curr.side.name) {
                    [prev.position, curr.position] = [curr.position, prev.position];
                } else {
                    [prev.position, curr.position] = [switchPosition(curr.position), switchPosition(prev.position)];
                }
            } else if (Array.isArray(prevId) && curr) {
                if (curr.side.name !== this.currentSide.name) {
                    curr.position = switchPosition(prevId);
                } else {
                    curr.position = prevId;
                }
                curr.revive();
            } else if (Array.isArray(currId) && prev) {
                if (prev.side.name !== this.currentSide.name) {
                    prev.position = switchPosition(currId);
                } else {
                    prev.position = currId;
                }
                prev.revive();
            }
        }
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

    load(info?: ChineseChessSideInfo) {
        if (!info) {
            info = {};
        }
        if (!info.pieces) {
            info.pieces = initialPieces.map((p) => ({...p, side: this.name}));
        }
        if (!info.graveyard) {
            info.graveyard = [];
        }
        this.pieces = info.pieces?.map((p) => createPiece(this, p, false));
        this.graveyard = info.graveyard.map((p) => createPiece(this, p, true));
        return this;
    }

    save(withId = true): ChineseChessSideInfo {
        const getInfo = (ps: ChineseChessPiece[]) =>
            ps.map((p) => {
                const info = p.info;
                if (!withId) {
                    delete info.id;
                }
                return info;
            });
        return {pieces: getInfo(this.pieces), graveyard: getInfo(this.graveyard)};
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

    findPiece(id?: string | number[]) {
        if (!id) {
            return undefined;
        }
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

    killAllPiece() {
        this.pieces.forEach((p) => (p.dead = true));
        this.graveyard = this.graveyard.concat(this.pieces);
        this.pieces = [];
    }

    reviveAllPiece() {
        this.graveyard.forEach((p) => (p.dead = false));
        this.pieces = this.pieces.concat(this.graveyard);
        this.graveyard = [];
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
        public id = uniqueId(type + "-"),
        public dead = false
    ) {}

    abstract clone(id?: string): ChineseChessPiece;

    private _isPositionBlocked(p: number[]) {
        return !!this.side.findPiece(p);
    }

    protected _filterPath(path: number[][]) {
        return path.filter(
            (postion) => !this.side.findOwnPiece(postion) && inRange(postion[0], CC_BOARD_WIDTH) && inRange(postion[1], CC_BOARD_HEIGHT)
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
                const left2 = this._getLeft(0, mostLeft);
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
                const right2 = this._getRight(0, mostRight);
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
                const up2 = this._getUp(0, mostUp);
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
                const down2 = this._getDown(0, mostDown);
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
            .map((v) => [x + v[0], y + v[1]])
            .filter((v) => v[1] < 5);
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

const createPiece = (side: ChineseChessSide, info: ChineseChessPieceInfo, dead: boolean) => {
    const {id, type, position} = info;
    switch (type) {
        case "pawn":
            return new ChineseChessPawn(side, position, id, dead);
        case "cannon":
            return new ChineseChessCannon(side, position, id, dead);
        case "chariot":
            return new ChineseChessChariot(side, position, id, dead);
        case "horse":
            return new ChineseChessHorse(side, position, id, dead);
        case "elephant":
            return new ChineseChessElephant(side, position, id, dead);
        case "advisor":
            return new ChineseChessAdvisor(side, position, id, dead);
        case "general":
            return new ChineseChessGeneral(side, position, id, dead);
    }
};
