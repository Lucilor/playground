import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {MatSelectChange} from "@angular/material/select";
import {downloadFile, timeout} from "@lucilor/utils";
import {local} from "@src/app/app.common";
import {ChineseChessAIBridge} from "@src/app/components/chinese-chess/chinese-chess-ai.bridge";
import {CC_BOARD_HEIGHT, CC_BOARD_WIDTH} from "@src/app/components/chinese-chess/chinese-chess-helper";
import {
    ChineseChessCollection,
    openChineseChessCollectionDialog
} from "@src/app/components/dialogs/chinese-chess-collection/chinese-chess-collection.component";
import {Storaged} from "@src/app/mixins/Storage.minin";
import {MessageService} from "@src/app/modules/message/services/message.service";
import {environment} from "@src/environments/environment";
import {debounce} from "lodash";
import {BehaviorSubject} from "rxjs";
import {
    ChineseChessBoard,
    ChineseChessBoardInfo,
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

const corners = {
    black: [
        [17, 23, 24, 26, 28, 30],
        [16, 22, 25, 27, 29, 31],
        [9, 15, 16, 18, 20, 22],
        [8, 14, 17, 19, 21, 23]
    ],
    red: [
        [8, 10, 12, 14, 17, 23],
        [9, 11, 13, 15, 16, 22],
        [0, 2, 4, 6, 9, 15],
        [1, 3, 5, 7, 8, 14]
    ]
};

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent extends Storaged() implements OnInit, OnDestroy {
    sideNames: ChineseChessSideName[] = ["black", "red"];
    tilesPerSide = new Array(32);
    board = new ChineseChessBoard();
    ai = new ChineseChessAI();
    aiBridge = typeof Worker !== "undefined" ? new ChineseChessAIBridge(this.ai, 32) : undefined;
    currPiece: ChineseChessPiece | null = null;
    get promptPositions() {
        const mode = this.$mode.value;
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
    collection: ChineseChessCollection;
    collectionIdx: number;
    get collectionName() {
        const {collection, collectionIdx} = this;
        let name = collection.name;
        const board = collection.boards[collectionIdx];
        if (board) {
            name += " —— " + board.name;
        }
        return name;
    }

    constructor(private message: MessageService, private dialog: MatDialog) {
        super("chinese-chess", local);
        this.players = this.load("players") ?? {red: "human", black: "ai-3"};
        this.$mode = new BehaviorSubject(this.load("mode") || "普通");
        this.$mode.subscribe(() => {
            this.currPiece = null;
            this.prevPiece = null;
        });
        this.collection = this.load("collection") ?? {name: "无题", boards: []};
        this.collectionIdx =  this.load("collectionIdx") ?? -1;
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
        sizes.graveyard = [sizes.piece[0] * 12, sizes.piece[1] * 2];
        sizes.font = (sizes.tile[0] * 2) / 3;
        sizes.board = [sizes.battleField[0] + 64, sizes.battleField[1] + 64 + sizes.graveyard[1] * 2];
    }, 200).bind(this);

    ngOnInit() {
        const board = this.board;
        if (!environment.production) {
            (window as any).cc = this;
            document.title = "test";
        }
        this.calcBoardSize();
        this.loadBoardInfo();
        board.on("forward", async (move) => {
            const player = this.players[board.currentSide.name];
            if (this.getAIDepth(player)) {
                const player2 = this.players[board.currentSide.opponent.name];
                if (player2 === "human" && board.currentSide.checkmate()) {
                    this.message.alert("请勿送将！");
                    board.backward();
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

    getPieces(sideName: ChineseChessSideName) {
        return this.board[sideName].pieces;
    }

    getGraveyard(sideName: ChineseChessSideName) {
        return this.board[sideName].graveyard;
    }

    getLeft(num: number, sideName: ChineseChessSideName) {
        if (sideName === "red") {
            return 100 - num * 12.5 + "%";
        } else {
            return num * 12.5 + "%";
        }
    }

    getTop(num: number, sideName: ChineseChessSideName) {
        if (sideName === "red") {
            return 100 - num * 25 + "%";
        } else {
            return num * 25 + "%";
        }
    }

    hasCorner(sideName: ChineseChessSideName, i: number, j: number) {
        return corners[sideName][i].includes(j);
    }

    isPieceSelectable(piece: ChineseChessPiece) {
        const mode = this.$mode.value;
        const board = this.board;
        const sideName = piece.side.name;
        if (mode === "普通") {
            if (piece.dead) {
                return false;
            } else {
                return board.currentSide.name === sideName && !board.brinkmate && this.players[sideName] === "human";
            }
        } else if (mode === "摆棋") {
            return true;
        }
        return false;
    }

    isPieceSelected(piece: ChineseChessPiece) {
        return piece.id === this.currPiece?.id;
    }

    onPieceClick(piece: ChineseChessPiece) {
        const mode = this.$mode.value;
        if (this.currPiece?.id === piece.id) {
            this.currPiece = null;
        } else if (this.isPieceSelectable(piece)) {
            if (mode === "普通") {
                if (this.players[piece.side.name] === "human") {
                    this.currPiece = piece;
                }
            } else if (mode === "摆棋") {
                this.currPiece = piece;
            }
        }
    }

    onGraveyardClick(sideName: ChineseChessSideName) {
        const currPiece = this.currPiece;
        if (currPiece?.side.name === sideName) {
            if (this.$mode.value === "摆棋") {
                if (!currPiece.dead) {
                    currPiece.kill();
                    this.currPiece = null;
                    this.saveBoardInfo();
                }
            }
        }
    }

    onPromptPositionsClick(position: number[]) {
        const mode = this.$mode.value;
        const {board, currPiece} = this;
        if (mode === "普通") {
            if (currPiece) {
                board.forward(currPiece.id, position);
                this.currPiece = null;
            }
        } else if (mode === "摆棋") {
            if (currPiece) {
                board.swapPieces(currPiece, position);
                this.currPiece = null;
                this.saveBoardInfo();
            }
        }
    }

    async reset(confirm = true, info?: ChineseChessBoardInfo) {
        if (!confirm || (await this.message.confirm("确定要重来吗？"))) {
            this.board.load(info);
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

    getPlayer(sideName: ChineseChessSideName) {
        return this.players[sideName];
    }

    setPlayer(event: MatSelectChange, sideName: ChineseChessSideName) {
        const opponent: ChineseChessSideName = sideName === "red" ? "black" : "red";
        if (this.getAIDepth(event.value) && this.getAIDepth(this.players[opponent])) {
            this.message.alert("电脑并不想跟自己玩。");
            event.source.value = "human";
        } else {
            this.players[sideName] = event.value;
            this.save("players", this.players);
        }
        this.aiMove();
    }

    backward() {
        if (this.currPiece) {
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

    saveCollection() {
        this.save("collection", this.collection);
    }

    loadCollection() {
        this.collection = this.load("collection");
    }

    async addToCollection() {
        const name = await this.message.prompt({
            value: "棋局" + (this.collection.boards.length + 1),
            placeholder: "棋局名字"
        });
        if (typeof name === "string") {
            const desc = await this.message.prompt({placeholder: "棋局描述"});
            if (typeof desc === "string") {
                this.collection.boards.push({name, desc, info: this.board.save(true)});
                this.saveCollection();
            }
        }
    }

    async updateToCollection() {
        const {collection, collectionIdx} = this;
        const board = collection.boards[collectionIdx];
        if (!board) {
            this.message.alert("请先添加或载入棋局！");
        } else if (await this.message.confirm("是否更新此棋局？")) {
            board.info = this.board.save(true);
            this.saveCollection();
        }
    }

    async createCollection() {
        const name = await this.message.prompt({value: "无题", placeholder: "棋谱名字", hint: "新建后当前数据将消失，清注意保存"});
        if (typeof name === "string") {
            this.collection = {name, boards: []};
            this.saveCollection();
        }
    }

    async editCollection() {
        const index = await openChineseChessCollectionDialog(this.dialog, {data: this.collection});
        if (typeof index === "number") {
            this.collectionIdx = index;
            this.reset(false, this.collection.boards[index].info);
            this.save("collectionIdx", index);
        }
        this.saveCollection();
    }

    async exportCollection() {
        downloadFile(JSON.stringify(this.collection), this.collection.name + ".json");
    }

    async importCollection(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        let collection: ChineseChessCollection | undefined;
        if (file) {
            try {
                collection = JSON.parse(await file.text());
                collection?.boards.forEach((b) => new ChineseChessBoard(b.info));
            } catch (error) {
                console.warn(error);
                this.message.alert("读取文件时出错");
                collection = undefined;
            } finally {
                if (collection) {
                    this.collection = collection;
                    this.saveCollection();
                }
                input.value = "";
            }
        }
    }

    setMode(event: MatSelectChange) {
        this.$mode.next(event.value);
        this.save("mode", event.value);
    }

    showGraveyardRipple(sideName: ChineseChessSideName) {
        const {currPiece, $mode} = this;
        if (!currPiece) {
            return false;
        }
        return $mode.value === "摆棋" && currPiece.side.name === sideName && !currPiece.dead;
    }

    killAllPieces() {
        const {red, black} = this.board;
        red.killAllPiece();
        black.killAllPiece();
        this.saveBoardInfo();
    }
}
