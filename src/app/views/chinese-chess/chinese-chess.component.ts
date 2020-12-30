import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MessageService} from "@src/app/modules/message/services/message.service";
import {debounce} from "lodash";
import {ChineseChessBoard, ChineseChessPiece} from "./chinese-chess";
import {ChineseChessAI} from "./chinese-chess-ai";

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent implements OnInit, OnDestroy {
    tilesPerSide = new Array(32);
    board = new ChineseChessBoard();
    ai = new ChineseChessAI(3);
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
    @ViewChild("boardRef", {read: ElementRef}) boardRef?: ElementRef<HTMLDivElement>;
    get boardEl() {
        return this.boardRef?.nativeElement || document.createElement("div");
    }

    constructor(private message: MessageService) {}

    calcBoardSize = debounce(() => {
        const sizes = this.sizes;
        const ratio = 8 / 9;
        let w = innerWidth - 64;
        let h = ((innerHeight - 104) / 12) * 9;
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
        const board = this.board;
        (window as any).board = this.board;
        (window as any).ai = this.ai;
        document.title = "test";
        this.calcBoardSize();
        board.on("pieceselect", (piece) => {
            this.currPiece = piece;
        });
        board.on("pieceunselect", () => {
            this.currPiece = null;
        });
        board.on("forward", (item) => {
            if (board.currentSide.checkmate()) {
                this.message.alert("请勿送将！");
                board.backward();
            } else {
                this.prevPiece = item.piece;
                this.prevPosition = item.from;
            }
        });
        board.on("backward", () => {
            const item = board.history[board.history.length - 1];
            if (item) {
                this.prevPiece = item.piece;
                this.prevPosition = item.from;
            } else {
                this.prevPiece = null;
                this.prevPosition = [-1, -1];
            }
        });
        board.on("checkmate", (side) => {
            const duration = 1000;
            const bubbleEl = this.boardEl.querySelector(`.side.${side.name} .chat-bubble`);
            if (bubbleEl) {
                bubbleEl.classList.add("shout1");
                setTimeout(() => bubbleEl.classList.remove("shout1"), duration + 1000);
            }
            const generalEl = this.boardEl.querySelector(`.side.${side.opponent.name} [type="general"]`);
            if (generalEl) {
                generalEl.classList.add("shout2");
                setTimeout(() => generalEl.classList.remove("shout2"), duration);
            }
        });
        board.on("brinkmate", (side) => {
            this.message.alert(`绝杀！${side.isRed ? "红" : "黑"}方胜！`);
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
            this.board.forward(this.currPiece.id, position);
        }
    }

    reset() {
        this.board.init();
        this.currPiece = null;
        this.prevPiece = null;
        this.prevPosition = [-1, -1];
    }
}
