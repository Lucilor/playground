/**
 * 参考项目: https://github.com/ParadeTo/chinese-chess
 */
import {ChineseChessBoard, ChineseChessPieceMove, ChineseChessPieceType, ChineseChessSide} from "./chinese-chess";
import {CC_BOARD_HEIGHT} from "./chinese-chess-helper";

const defaultPieceValues: Record<ChineseChessPieceType, number> = {
    general: Math.pow(10, 10),
    advisor: 110,
    elephant: 110,
    horse: 300,
    chariot: 600,
    cannon: 300,
    pawn: 70
};
const defaultPositionValues: Record<ChineseChessPieceType, number[][] | number> = {
    cannon: [
        [6, 4, 0, -10, -12, -10, 0, 4, 6],
        [2, 2, 0, -4, -14, -4, 0, 2, 2],
        [2, 2, 0, -10, -8, -10, 0, 2, 2],
        [0, 0, -2, 4, 10, 4, -2, 0, 0],
        [0, 0, 0, 2, 8, 2, 0, 0, 0],
        [-2, 0, 4, 2, 6, 2, 4, 0, -2],
        [0, 0, 0, 2, 4, 2, 0, 0, 0],
        [4, 0, 8, 6, 10, 6, 8, 0, 4],
        [0, 2, 4, 6, 6, 6, 4, 2, 0],
        [0, 0, 2, 6, 6, 6, 2, 0, 0]
    ],
    horse: [
        [4, 8, 16, 12, 4, 12, 16, 8, 4],
        [4, 10, 28, 16, 8, 16, 28, 10, 4],
        [12, 14, 16, 20, 18, 20, 16, 14, 12],
        [8, 24, 18, 24, 20, 24, 18, 24, 8],
        [6, 16, 14, 18, 16, 18, 14, 16, 6],
        [4, 12, 16, 14, 12, 14, 16, 12, 4],
        [2, 6, 8, 6, 10, 6, 8, 6, 2],
        [4, 2, 8, 8, 4, 8, 8, 2, 4],
        [0, 2, 4, 4, -2, 4, 4, 2, 0],
        [0, -4, 0, 0, 0, 0, 0, -4, 0]
    ],
    chariot: [
        [14, 14, 12, 18, 16, 18, 12, 14, 14],
        [16, 20, 18, 24, 26, 24, 18, 20, 16],
        [12, 12, 12, 18, 18, 18, 12, 12, 12],
        [12, 18, 16, 22, 22, 22, 16, 18, 12],
        [12, 14, 12, 18, 18, 18, 12, 14, 12],
        [12, 16, 14, 20, 20, 20, 14, 16, 12],
        [6, 10, 8, 14, 14, 14, 8, 10, 6],
        [4, 8, 6, 14, 12, 14, 6, 8, 4],
        [8, 4, 8, 16, 8, 16, 8, 4, 8],
        [-2, 10, 6, 14, 12, 14, 6, 10, -2]
    ],
    pawn: [
        [0, 3, 6, 9, 12, 9, 6, 3, 0],
        [18, 36, 56, 80, 120, 80, 56, 36, 18],
        [14, 26, 42, 60, 80, 60, 42, 26, 14],
        [10, 20, 30, 34, 40, 34, 30, 20, 10],
        [6, 12, 18, 18, 20, 18, 18, 12, 6],
        [2, 0, 8, 0, 8, 0, 8, 0, 2],
        [0, 0, -2, 0, 4, 0, -2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    general: 0,
    elephant: 0,
    advisor: 0
};

export class ChineseChessAI {
    constructor(private _pieceValues = defaultPieceValues, private _positionValues = defaultPositionValues) {}

    private _getPieceValue(type: ChineseChessPieceType) {
        return this._pieceValues[type];
    }

    private _getPositionValue(type: ChineseChessPieceType, position: number[]) {
        const [x, y] = position;
        let val = this._positionValues[type];
        if (Array.isArray(val)) {
            val = val[CC_BOARD_HEIGHT - 1 - y][x];
            return val;
        }
        return val;
    }

    private _getSideValue(side: ChineseChessSide): number {
        let selfPieceVal = 0;
        let selfPosVal = 0;
        let opponentPieceVal = 0;
        let opponentPosVal = 0;

        for (const piece of side.pieces) {
            selfPieceVal += this._getPieceValue(piece.type);
            selfPosVal += this._getPositionValue(piece.type, piece.position);
        }

        for (const piece of side.opponent.pieces) {
            opponentPieceVal += this._getPieceValue(piece.type);
            opponentPosVal += this._getPositionValue(piece.type, piece.position);
        }

        return selfPieceVal + selfPosVal - opponentPieceVal - opponentPosVal;
    }

    private _search(board: ChineseChessBoard, side: ChineseChessSide, depth: number, isMax: boolean, alpha: number, beta: number) {
        const currentSide = board.currentSide;
        if (depth === 0 || board.brinkmate) {
            return this._getSideValue(side);
        }
        let value = isMax ? -Infinity : Infinity;
        const moves = currentSide.getAllMoves();
        for (const move of moves) {
            const value2 = board.testMove(move, () => this._search(board, side, depth - 1, !isMax, alpha, beta));
            if (isMax) {
                value = Math.max(value, value2);
                alpha = Math.max(alpha, value);
                if (alpha >= beta) {
                    return alpha;
                }
            } else {
                value = Math.min(value, value2);
                beta = Math.min(beta, value);
                if (alpha >= beta) {
                    return beta;
                }
            }
        }
        return value;
    }

    searchBestMove(board: ChineseChessBoard, depth: number, moves: ChineseChessPieceMove[]) {
        let max = -Infinity;
        const side = board.currentSide;
        let bestMove: ChineseChessPieceMove | null = null;
        for (const move of moves) {
            const value = board.testMove(move, () => this._search(board, side, depth - 1, false, -Infinity, Infinity));
            if (value > max) {
                max = value;
                bestMove = move;
            }
        }
        return Promise.resolve({bestMove, value: max});
    }

    async getMove(board: ChineseChessBoard, depth: number) {
        board = new ChineseChessBoard(board.save());
        return (await this.searchBestMove(board, depth, board.currentSide.getAllMoves())).bestMove;
    }
}
