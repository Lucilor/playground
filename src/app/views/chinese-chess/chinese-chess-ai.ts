import {environment} from "@src/environments/environment";
import {ChineseChessBoard, ChineseChessHistoryItem, ChinesePieceType} from "./chinese-chess";
import {chineseChessBoardSize} from "./chinese-chess-helper";

const {height} = chineseChessBoardSize;

export class ChineseChessAI {
    constructor(public depth: number, public evalModel = new WeightEvalModel(), public cutOff = true) {}

    search(board: ChineseChessBoard, depth: number, isMax: boolean, alpha: number, beta: number) {
        if (depth === 0 || board.brinkmate) {
            return this.evalModel.eval(board);
        }
        const side = board.currentSide;
        const opponent = side.opponent;
        let value = isMax ? -Infinity : Infinity;
        for (const piece of side.pieces) {
            for (const position of piece.path) {
                const originalPosition = piece.position;
                piece.position = position;
                const targetId = side.findOpponentPiece(position)?.id || "";
                opponent.killPiece(targetId);
                const value2 = this.search(board, depth - 1, !isMax, alpha, beta);
                piece.position = originalPosition;
                opponent.revivePiece(targetId);
                if (isMax) {
                    value = Math.max(value, value2);
                    if (this.cutOff) {
                        alpha = Math.max(alpha, value);
                        if (alpha >= beta) {
                            return alpha;
                        }
                    }
                } else {
                    value = Math.min(value, value2);
                    if (this.cutOff) {
                        beta = Math.min(beta, value);
                        if (alpha >= beta) {
                            return beta;
                        }
                    }
                }
            }
        }
        return value;
    }

    getBestMove(board: ChineseChessBoard) {
        let max = -Infinity;
        const side = board.currentSide;
        const opponent = side.opponent;
        let bestMove: ChineseChessHistoryItem | null = null;
        if (!environment.production) {
            console.time("getBestMove");
        }
        for (const piece of side.pieces) {
            for (const position of piece.path) {
                const originalPosition = piece.position;
                piece.position = position;
                const target = side.findOpponentPiece(position);
                const targetId = target?.id || "";
                opponent.killPiece(targetId);
                const value = this.search(board, this.depth - 1, false, -Infinity, Infinity);
                piece.position = originalPosition;
                opponent.revivePiece(targetId);
                if (value > max) {
                    max = value;
                    bestMove = {from: originalPosition, to: position, piece, eaten: target};
                }
            }
        }
        if (!environment.production) {
            console.timeEnd("getBestMove");
        }
        return Promise.resolve({bestMove, value: max});
    }

    // async getNextMove(board: ChineseChessBoard) {
    //     console.time("getNextMove");
    //     const {bestMove} = await this.getBestMove(board);
    //     console.timeEnd("getNextMove");
    //     return bestMove;
    // }
}

class WeightEvalModel {
    static evalPieceVal(type: ChinesePieceType) {
        const pieceVal: Record<ChinesePieceType, number> = {
            general: 1000000,
            advisor: 110,
            elephant: 110,
            house: 300,
            chariot: 600,
            cannon: 300,
            pawn: 70
        };
        return pieceVal[type];
    }

    static evalPosVal(type: ChinesePieceType, position: number[]) {
        const [x, y] = position;
        const posVal: Record<ChinesePieceType, number[][] | number> = {
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
            house: [
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
        let val = posVal[type];
        if (Array.isArray(val)) {
            val = val[height - y][x];
            if (typeof val !== "number") {
                console.log(x, y);
            }
            return val;
        }
        return val;
    }

    eval(board: ChineseChessBoard): number {
        let selfPieceVal = 0;
        let selfPosVal = 0;
        let opponentPieceVal = 0;
        let opponentPosVal = 0;

        let pieces = board.currentSide.pieces;
        for (const piece of pieces) {
            selfPieceVal += WeightEvalModel.evalPieceVal(piece.type);
            selfPosVal += WeightEvalModel.evalPosVal(piece.type, piece.position);
        }

        pieces = board.currentSide.opponent.pieces;
        for (const piece of pieces) {
            opponentPieceVal += WeightEvalModel.evalPieceVal(piece.type);
            opponentPosVal += WeightEvalModel.evalPosVal(piece.type, piece.position);
        }

        return selfPieceVal + selfPosVal - opponentPieceVal - opponentPosVal;
    }
}
