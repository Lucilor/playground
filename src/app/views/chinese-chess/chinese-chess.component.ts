import {Component, OnDestroy, OnInit} from "@angular/core";
import {debounce} from "lodash";
import {ChineseChessBoard, ChineseChessPiece} from "./chinese-chess";

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent implements OnInit, OnDestroy {
    tilesPerArea = new Array(32);
    board = new ChineseChessBoard();
    currPiece: ChineseChessPiece | null = null;
    get promptPositions() {
        return this.currPiece?.path || [];
    }
    prevPiece: ChineseChessPiece | null = null;
    prevPosition: number[] = [-1, -1];
    sizes = {
        board: [0, 0],
        battleField: [0, 0],
        graveyard: [0, 0],
        tile: [0, 0],
        piece: [0, 0],
        font: 0
    };

    calcBoardSize = debounce(() => {
        console.log(1);
        const sizes = this.sizes;
        const ratio = 8 / 9;
        let w = ((innerWidth - 104) / 8) * 8;
        let h = ((innerHeight - 104) / 12) * 8;
        console.log(w, h, w / h, ratio);
        if (w / h > ratio) {
            w = h * ratio;
        } else {
            h = w / ratio;
        }
        sizes.battleField = [w, h];
        sizes.tile = [sizes.battleField[0] / 8, sizes.battleField[1] / 9];
        sizes.piece = [sizes.tile[0] * 0.75, sizes.tile[1] * 0.75];
        sizes.graveyard = [sizes.piece[0] * 8, sizes.piece[1] * 2];
        sizes.font = (sizes.tile[0] * 2) / 3;
        sizes.board = [sizes.battleField[0] + 64, sizes.battleField[1] + 64 + sizes.graveyard[1] * 2];
    }, 200).bind(this);

    ngOnInit() {
        console.log(this);
        document.title = "test";
        this.calcBoardSize();
        this.board.on("pieceselect", (piece) => {
            this.currPiece = piece;
        });
        this.board.on("pieceunselect", () => {
            this.currPiece = null;
        });
        this.board.on("piecemove", (info) => {
            this.prevPiece = info.piece;
            this.prevPosition = info.from;
        });
        window.addEventListener("resize", this.calcBoardSize);
    }

    ngOnDestroy() {
        window.removeEventListener("resize", this.calcBoardSize);
    }

    onPieceClick(piece: ChineseChessPiece) {
        this.board.selectPiece(piece.id);
    }

    onPromptPositionsClick(position: number[]) {
        if (this.currPiece) {
            this.board.movePiece(this.currPiece.id, position);
        }
    }
}
