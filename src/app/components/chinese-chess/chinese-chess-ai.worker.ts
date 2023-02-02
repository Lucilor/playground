/// <reference lib="webworker" />

import {ChineseChessBoard, ChineseChessBoardInfo, ChineseChessPieceMovePlain, getMoves} from "./chinese-chess";
import {ChineseChessAI} from "./chinese-chess-ai";

addEventListener(
  "message",
  async (event: MessageEvent<{boardInfo: ChineseChessBoardInfo; depth: number; moves: ChineseChessPieceMovePlain[]}>) => {
    const {boardInfo, depth} = event.data;
    const board = new ChineseChessBoard(boardInfo);
    const moves = getMoves(event.data.moves, board);
    const ai = new ChineseChessAI();
    const {bestMove, value} = await ai.searchBestMove(board, depth, moves);
    let bestMove2: any = null;
    if (bestMove) {
      bestMove2 = {from: bestMove.from, to: bestMove.to, piece: bestMove.piece.id, eaten: bestMove.eaten?.id};
    }
    postMessage({bestMove2, value});
  }
);
