import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatSelect, MatSelectChange} from "@angular/material/select";
import {downloadFile, timeout} from "@lucilor/utils";
import {local} from "@src/app/app.common";
import {ChineseChessAIBridge} from "@src/app/components/chinese-chess/chinese-chess-ai.bridge";
import {CC_BOARD_HEIGHT, CC_BOARD_WIDTH} from "@src/app/components/chinese-chess/chinese-chess-helper";
import {Storaged} from "@src/app/mixins/Storage.minin";
import {MessageService} from "@src/app/modules/message/services/message.service";
import {debounce} from "lodash";
import {BehaviorSubject} from "rxjs";
import {
    ChineseChessBoard,
    ChineseChessPiece,
    ChineseChessPieceMove,
    ChineseChessSideName
} from "../../components/chinese-chess/chinese-chess";
import {ChineseChessAI} from "../../components/chinese-chess/chinese-chess-ai";

type Mode = "普通" | "摆棋";
const allPositions: number[][] = [];
for (let i = 0; i < CC_BOARD_WIDTH; i++) {
    for (let j = 0; j < CC_BOARD_HEIGHT; j++) {
        allPositions.push([i, j]);
    }
}

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent extends Storaged() implements OnInit, OnDestroy {
    tilesPerSide = new Array(32);
    board = new ChineseChessBoard();
    ai = new ChineseChessAI();
    aiBridge = typeof Worker !== "undefined" ? new ChineseChessAIBridge(this.ai, 32) : undefined;
    currPiece: ChineseChessPiece | null = null;
    get promptPositions() {
        const mode = this.$mode.getValue();
        if (mode === "普通") {
            return this.currPiece?.path || [];
        } else if (mode === "摆棋") {
            return this.currPiece ? allPositions : [];
        } else {
            return [];
        }
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
    pieceMoveDelay = 400;
    @ViewChild("boardRef", {read: ElementRef}) boardRef?: ElementRef<HTMLDivElement>;
    @ViewChild("blackPlayerSelect") blackPlayerSelect?: MatSelect;
    @ViewChild("redPlayerSelect") redPlayerSelect?: MatSelect;
    get boardEl() {
        return this.boardRef?.nativeElement || document.createElement("div");
    }
    playersList = [
        {name: "人类", value: "human"},
        {name: "电脑(简单)", value: "ai-3"},
        {name: "电脑(中等)", value: "ai-4"},
        {name: "电脑(困难)", value: "ai-5"}
    ];
    players: Record<ChineseChessSideName, string>;
    aiThinking = false;
    modes: Mode[] = ["普通", "摆棋"];
    $mode: BehaviorSubject<Mode>;

    constructor(private message: MessageService) {
        super("chinese-chess", local);
        this.players = this.load("players") || {red: "human", black: "ai-3"};
        this.$mode = new BehaviorSubject(this.load("mode") || "普通");
        this.$mode.subscribe((mode) => {
            console.log(mode);
        });
    }

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
        // (window as any).board = this.board;
        // (window as any).ai = this.ai;
        // document.title = "test";
        this.calcBoardSize();
        this.loadBoardInfo();
        board.on("pieceselect", (piece) => {
            this.currPiece = piece;
        });
        board.on("pieceunselect", () => {
            this.currPiece = null;
        });
        board.on("forward", async (move) => {
            move.piece.selected = false;
            const player = this.players[board.currentSide.name];
            if (this.getAIDepth(player)) {
                const player2 = this.players[board.currentSide.opponent.name];
                if (player2 === "human" && board.currentSide.checkmate()) {
                    this.message.alert("请勿送将！");
                    board.backward();
                    move.piece.selected = true;
                    return;
                }
            }
            this.prevPiece = move.piece;
            this.prevPosition = move.from;
            await timeout(this.pieceMoveDelay);
            this.aiMove();
            this.saveBoardInfo();
        });
        board.on("backward", () => {
            const move = board.history[board.history.length - 1];
            if (move) {
                this.prevPiece = move.piece;
                this.prevPosition = move.from;
            } else {
                this.prevPiece = null;
                this.prevPosition = [-1, -1];
            }
            this.saveBoardInfo();
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
        this.aiMove();
    }

    ngOnDestroy() {
        window.removeEventListener("resize", this.calcBoardSize);
    }

    isPieceSelectable(sideName: ChineseChessSideName) {
        const board = this.board;
        return board.currentSide.name === sideName && !board.brinkmate && this.players[sideName] === "human";
    }

    onPieceClick(piece: ChineseChessPiece) {
        if (this.players[piece.side.name] === "human") {
            this.board.selectPiece(piece.id);
        }
    }

    onPromptPositionsClick(position: number[]) {
        if (this.currPiece) {
            this.board.forward(this.currPiece.id, position);
        }
    }

    async reset() {
        if (await this.message.confirm("确定要重来吗？")) {
            this.board.load();
            this.currPiece = null;
            this.prevPiece = null;
            this.prevPosition = [-1, -1];
            this.aiThinking = false;
            this.saveBoardInfo();
        }
    }

    getAIDepth(player: string) {
        const arr = player.split("-");
        if (arr[0] === "ai") {
            return Number(arr[1]);
        }
        return NaN;
    }

    async aiMove() {
        const player = this.players[this.board.currentSide.name];
        const depth = this.getAIDepth(player);
        if (depth) {
            let bestMove: ChineseChessPieceMove | null = null;
            this.aiThinking = true;
            if (this.aiBridge) {
                bestMove = await this.aiBridge.getMove(this.board, depth);
            } else {
                bestMove = await this.ai.getMove(this.board, depth);
            }
            this.aiThinking = false;
            if (bestMove) {
                this.board.forward(bestMove.piece.id, bestMove.to);
            } else {
                this.message.alert("电脑放弃思考");
            }
            return true;
        }
        return false;
    }

    setPlayer(event: MatSelectChange, sideName: ChineseChessSideName) {
        const opponent: ChineseChessSideName = sideName === "red" ? "black" : "red";
        if (this.getAIDepth(event.value) && this.getAIDepth(this.players[opponent])) {
            this.message.alert("电脑并不想跟自己玩。");
            if (sideName === "red" && this.redPlayerSelect) {
                this.redPlayerSelect.value = "human";
            }
            if (sideName === "black" && this.blackPlayerSelect) {
                this.blackPlayerSelect.value = "human";
            }
        } else {
            this.players[sideName] = event.value;
            this.save("players", this.players);
        }
        this.aiMove();
    }

    backward() {
        if (this.currPiece) {
            this.currPiece.selected = false;
            this.currPiece = null;
        }
        this.board.backward();
        const player = this.players[this.board.currentSide.name];
        if (this.getAIDepth(player)) {
            this.backward();
        }
    }

    saveBoardInfo() {
        this.save("boardInfo", this.board.save(true));
    }

    loadBoardInfo() {
        try {
            this.board.load(this.load("boardInfo"));
        } catch (error) {
            console.warn(error);
            this.message.alert("载入棋局出错");
            this.board.load();
        }
    }

    exportBoardInfo() {
        downloadFile(JSON.stringify(this.board.save()), "board.json");
    }

    async importBoardInfo(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            try {
                const boardInfo = JSON.parse(await file.text());
                this.board.load(boardInfo);
                this.saveBoardInfo();
            } catch (error) {
                console.warn(error);
                this.message.alert("读取文件时出错");
            }
            input.value = "";
        }
    }

    setMode(event: MatSelectChange) {
        this.$mode.next(event.value);
        this.save("mode", event.value);
    }
}
