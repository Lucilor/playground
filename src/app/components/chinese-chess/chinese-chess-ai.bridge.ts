import {EventEmitter} from "events";
import {ChineseChessBoard, ChineseChessPiece, ChineseChessPieceMove} from "./chinese-chess";
import {ChineseChessAI} from "./chinese-chess-ai";

// if (typeof Worker !== "undefined") {
//     // Create a new
//     const worker = new Worker("./chinese-chess-ai.worker", {type: "module"});
//     worker.onmessage = ({data}) => {
//         console.log(`page got message: ${data}`);
//     };
//     worker.postMessage("hello");
// } else {
//     // Web Workers are not supported in this environment.
//     // You should add a fallback so that your program still executes correctly.
// }

export class ChineseChessAIBridge extends EventEmitter {
    private _workers: Worker[];

    constructor(public ai: ChineseChessAI, public workerNum: number) {
        super();
        this._workers = [];
        for (let i = 0; i < workerNum; i++) {
            const worker = new Worker("./chinese-chess-ai.worker", {type: "module"});
            worker.onmessage = (event) => {
                this.emit("workermessage", event);
            };
            this._workers.push(worker);
        }
    }

    getMove(board: ChineseChessBoard, depth: number) {
        return new Promise<ChineseChessPieceMove | null>((resolve) => {
            const moves = board.currentSide.getAllMoves();
            const total = moves.length;
            const workersCount = this._workers.length;
            const average = Math.floor(total / workersCount);
            let offset = 0;
            const boardInfo = board.save(true);
            this._workers.forEach((worker, i) => {
                const subMoves = moves
                    .slice(offset, offset + average)
                    .map((move) => ({from: move.from, to: move.to, piece: move.piece.id, eaten: move.eaten?.id}));
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
                    this.removeListener("workermessage", onWorkerMessage);
                    resolve(bestMove);
                }
            };
            this.addListener("workermessage", onWorkerMessage);
        });
    }
}
