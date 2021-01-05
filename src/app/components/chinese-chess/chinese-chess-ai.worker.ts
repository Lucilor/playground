/// <reference lib="webworker" />

import {ChineseChessBoard, ChineseChessPieceMove} from "./chinese-chess";
import {ChineseChessAI} from "./chinese-chess-ai";

addEventListener("message", async (event) => {
    const {boardInfo, depth} = event.data;
    const board = new ChineseChessBoard(boardInfo);
    const moves = event.data.moves.map((move: any) => ({
        from: move.from,
        to: move.to,
        piece: board.findPiece(move.piece),
        eaten: board.findPiece(move.eaten)
    })) as ChineseChessPieceMove[];
    const ai = new ChineseChessAI();
    const {bestMove, value} = await ai.searchBestMove(board, depth, moves);
    let bestMove2: any = null;
    if (bestMove) {
        bestMove2 = {from: bestMove.from, to: bestMove.to, piece: bestMove.piece.id, eaten: bestMove.eaten?.id};
    }
    postMessage({bestMove2, value});
});
