import {EventEmitter} from "events";
import {ChineseChessBoard, ChineseChessPiece, ChineseChessPieceMove, getMovesPlain} from "./chinese-chess";
import {ChineseChessAI} from "./chinese-chess-ai";

export class ChineseChessAIBridge {
    private _workers: Worker[];
    private _event = new EventEmitter();

    constructor(public ai: ChineseChessAI, public workerNum: number) {
        this._workers = [];
        for (let i = 0; i < workerNum; i++) {
            const worker = new Worker("./chinese-chess-ai.worker", {type: "module"});
            worker.onmessage = (event) => {
                this._event.emit("workermessage", event);
            };
            this._workers.push(worker);
        }
    }

    getMove(board: ChineseChessBoard, depth: number) {
        return new Promise<ChineseChessPieceMove | null>((resolve) => {
            const moves = board.currentSide.getAllMoves();
            const total = moves.length;
            const workersCount = this._workers.length;
            const average = Math.ceil(total / workersCount);
            let offset = 0;
            const boardInfo = board.save(true);
            this._workers.forEach((worker) => {
                const subMoves = getMovesPlain(moves.slice(offset, offset + average));
                worker.postMessage({boardInfo, moves: subMoves, depth});
                offset += average;
                if (total - offset < average) {
                    offset = total;
                }
            });
            let count = 0;
            let bestMove: ChineseChessPieceMove | null = null;
            let maxValue = -Infinity;
            const onWorkerMessage = (event: MessageEvent) => {
                const {bestMove2, value} = event.data;
                if (value > maxValue) {
                    bestMove = {
                        from: bestMove2.from,
                        to: bestMove2.to,
                        piece: board.findPiece(bestMove2.piece) as ChineseChessPiece,
                        eaten: board.findPiece(bestMove2.eaten)
                    };
                    maxValue = value;
                }
                if (++count === workersCount) {
                    this._event.removeListener("workermessage", onWorkerMessage);
                    resolve(bestMove);
                }
            };
            this._event.addListener("workermessage", onWorkerMessage);
        });
    }
}
