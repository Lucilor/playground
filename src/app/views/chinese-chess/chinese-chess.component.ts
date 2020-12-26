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

    constructor() {}

    ngOnInit() {
        console.log(this);
        document.title = "test";
    }

    onPieceClick(piece: ChineseChessPiece) {
        this.board.selectPiece(piece);
        if (piece.selected) {
            console.log(piece);
        }
    }
}
