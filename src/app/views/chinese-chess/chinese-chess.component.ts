import {Component, OnInit} from "@angular/core";
import {ChineseChessBoard, ChineseChessPiece} from "./chinese-chess";

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent implements OnInit {
    tilesPerArea = new Array(32);
    board = new ChineseChessBoard();
    currPiece: ChineseChessPiece | null = null;
    get promptPositions() {
        return this.currPiece?.path || [];
    }

    constructor() {}

    ngOnInit() {
        console.log(this);
        document.title = "test";
        this.board.on("pieceselect", (piece) => {
            this.currPiece = piece;
        });
        this.board.on("pieceunselect", () => {
            this.currPiece = null;
        });
    }

    onPieceClick(piece: ChineseChessPiece) {
        this.board.selectPiece(piece);
    }

    onPromptPositionsClick(position: number[]) {
        if (this.currPiece) {
            this.board.movePiece(this.currPiece, position);
        }
    }
}
