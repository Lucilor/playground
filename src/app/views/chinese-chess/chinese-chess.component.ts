import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from "@angular/core";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {MatDialog} from "@angular/material/dialog";
import {MatSelectChange} from "@angular/material/select";
import {MatSlideToggleChange} from "@angular/material/slide-toggle";
import {local} from "@app/app.common";
import {
  ChineseChessBoardInfo,
  ChineseChessSideName,
  ChineseChessBoard,
  ChineseChessPiece,
  ChineseChessPieceInfo,
  createPiece,
  ChineseChessPieceMove
} from "@components/chinese-chess/chinese-chess";
import {ChineseChessAI} from "@components/chinese-chess/chinese-chess-ai";
import {ChineseChessAIBridge} from "@components/chinese-chess/chinese-chess-ai.bridge";
import {CC_BOARD_WIDTH, CC_BOARD_HEIGHT} from "@components/chinese-chess/chinese-chess-helper";
import {openChineseChessCollectionsDialog} from "@components/dialogs/chinese-chess-collections/chinese-chess-collections.component";
import {timeout, downloadByString} from "@lucilor/utils";
import {AppStorage} from "@mixins/app-storage.mixin";
import {MessageService} from "@modules/message/services/message.service";
import {debounce} from "lodash";
import {BehaviorSubject} from "rxjs";

type Mode = "下棋" | "摆棋";
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

interface ChineseChessCollection {
  name: string;
  desc: string;
  boards: {name: string; desc: string; info: ChineseChessBoardInfo}[];
}

@Component({
  selector: "app-chinese-chess",
  templateUrl: "./chinese-chess.component.html",
  styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent extends AppStorage() implements OnInit, OnDestroy {
  sideNames: ChineseChessSideName[] = ["black", "red"];
  tilesPerSide = new Array(32);
  board = new ChineseChessBoard();
  ai = new ChineseChessAI();
  aiBridge = typeof Worker !== "undefined" ? new ChineseChessAIBridge(this.ai, 32) : undefined;
  currPiece$ = new BehaviorSubject<ChineseChessPiece | null>(null);
  prevPiece$ = new BehaviorSubject<ChineseChessPiece | null>(null);
  prevPiece = 1;
  private _currentPiecePath: number[][] = [];
  get promptPositions() {
    const mode = this.mode$.value;
    const currPiece = this.currPiece$.value;
    if (mode === "下棋") {
      return this._currentPiecePath;
    } else if (mode === "摆棋") {
      return currPiece ? allPositions : [];
    } else {
      return [];
    }
  }
  get prevPosition() {
    return this.prevPiece$.value?.position ?? [];
  }
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
  modes: Mode[] = ["下棋", "摆棋"];
  mode$: BehaviorSubject<Mode>;
  collection: ChineseChessCollection;
  collectionIdx$: BehaviorSubject<number>;
  get collectionBoard(): ChineseChessCollection["boards"][0] | undefined {
    return this.collection.boards[this.collectionIdx$.value];
  }
  applyCollection: boolean;
  private get _applyCollection() {
    const mode = this.mode$.value;
    return mode === "摆棋" || (mode === "下棋" && this.applyCollection);
  }

  constructor(private message: MessageService, private dialog: MatDialog) {
    super("chinese-chess", local);
    this.players = this.load("players") ?? {red: "human", black: "ai-3"};
    this.mode$ = new BehaviorSubject(this.load("mode") ?? "下棋");
    this.mode$.subscribe((value) => {
      this.currPiece$.next(null);
      this.prevPiece$.next(null);
      this.save("mode", value);
    });
    this.collection = this.load("collection") ?? {name: "无题", boards: []};
    this.collectionIdx$ = new BehaviorSubject(this.load("collectionIdx") ?? -1);
    this.collectionIdx$.subscribe((value) => {
      this.save("collectionIdx", value);
      if (this._applyCollection) {
        this.reset(false, this.collectionBoard?.info);
      }
    });
    this.applyCollection = this.load("applyCollection") ?? false;
    this.currPiece$.subscribe((piece) => (this._currentPiecePath = piece?.path ?? []));
    const prevPieceInfo: ChineseChessPieceInfo = this.load("prevPiece");
    if (prevPieceInfo) {
      const side = prevPieceInfo.side === "black" ? this.board.black : this.board.red;
      this.prevPiece$.next(createPiece(side, prevPieceInfo, false));
    }
    this.prevPiece$.subscribe((piece) => this.save("prevPiece", piece?.info || null));
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
    this.calcBoardSize();
    this.loadBoardInfo();
    board.on("forward", async (move) => {
      const player2 = this.players[board.currentSide.opponent.name];
      if (player2 === "human" && board.currentSide.checkmate()) {
        this.message.alert("请勿送将！");
        board.backward();
        return;
      }
      const prevPiece = move.piece.clone();
      prevPiece.moveTo(move.from);
      this.prevPiece$.next(prevPiece);
      await timeout(this.pieceMoveDelay);
      this.aiMove();
      this.saveBoardInfo();
    });
    board.on("backward", () => {
      const move = board.history[board.history.length - 1];
      if (move) {
        const prevPiece = move.piece.clone();
        prevPiece.moveTo(move.from);
        this.prevPiece$.next(prevPiece);
      } else {
        this.prevPiece$.next(null);
      }
      this.saveBoardInfo();
    });
    board.on("checkmate", async (side) => {
      await timeout(this.pieceMoveDelay);
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
    board.on("brinkmate", async (side) => {
      await timeout(this.pieceMoveDelay);
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

  getLeft(num = 0, sideName: ChineseChessSideName) {
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
    const mode = this.mode$.value;
    const board = this.board;
    const sideName = piece.side.name;
    if (mode === "下棋") {
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
    return piece.id === this.currPiece$.value?.id;
  }

  onPieceClick(piece: ChineseChessPiece) {
    const mode = this.mode$.value;
    if (this.currPiece$.value?.id === piece.id) {
      this.currPiece$.next(null);
    } else if (this.isPieceSelectable(piece)) {
      if (mode === "下棋") {
        if (this.players[piece.side.name] === "human") {
          this.currPiece$.next(piece);
        }
      } else if (mode === "摆棋") {
        this.currPiece$.next(piece);
      }
    }
  }

  onGraveyardClick(sideName: ChineseChessSideName) {
    const currPiece = this.currPiece$.value;
    if (currPiece?.side.name === sideName) {
      if (this.mode$.value === "摆棋") {
        if (!currPiece.dead) {
          currPiece.kill();
          this.currPiece$.next(null);
          this.saveBoardInfo();
        }
      }
    }
  }

  onPromptPositionsClick(position: number[]) {
    const mode = this.mode$.value;
    const {board, currPiece$} = this;
    const currPiece = currPiece$.value;
    if (mode === "下棋") {
      if (currPiece) {
        board.forward(currPiece.id, position);
        currPiece$.next(null);
      }
    } else if (mode === "摆棋") {
      if (currPiece) {
        board.swapPieces(currPiece, position);
        this.currPiece$.next(null);
        this.saveBoardInfo();
      }
    }
  }

  async reset(confirm = true, info?: ChineseChessBoardInfo) {
    if (!confirm || (await this.message.confirm("确定要重来吗？"))) {
      if (this.mode$.value === "下棋" && this.applyCollection) {
        const board = this.collectionBoard;
        if (board) {
          info = board.info;
        }
      }
      this.board.load(info);
      this.currPiece$.next(null);
      this.prevPiece$.next(null);
      this.aiThinking = false;
      this.saveBoardInfo();
      this.aiMove();
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
    if (this.currPiece$) {
      this.currPiece$.next(null);
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
      type: "string",
      label: "棋局名字",
      value: "棋局" + (this.collection.boards.length + 1)
    });
    if (typeof name === "string") {
      this.reset(false);
      this.collection.boards.push({name, desc: "", info: this.board.save(true)});
      this.saveCollection();
      this.changeCollectionIdx(this.collection.boards.length - 1);
    }
  }

  updateToCollection() {
    const board = this.collectionBoard;
    if (!board) {
      this.message.alert("请先添加或载入棋局！");
    } else {
      board.info = this.board.save(true);
      this.saveCollection();
    }
  }

  deleteFromCollection() {
    const index = this.collectionIdx$.value;
    if (index <= 0) {
      this.message.alert("请先添加或载入棋局！");
    } else {
      this.collection.boards.splice(index, 1);
      this.collectionIdx$.next(index - 1);
      this.saveCollection();
    }
  }

  async createCollection() {
    const name = await this.message.prompt({type: "string", label: "集合名字", value: "无题", hint: "新建后当前数据将消失，清注意保存"});
    if (typeof name === "string") {
      this.collection = {name, desc: "", boards: []};
      this.saveCollection();
    }
  }

  async editCollection() {
    const result = await this.message.editor({content: this.collection.desc, title: this.collection.name});
    if (typeof result === "string") {
      this.collection.desc = result;
      this.saveCollection();
    }
  }

  async editCollectionBoard(event: Event) {
    event.stopPropagation();
    const board = this.collectionBoard;
    if (board) {
      const result = await this.message.editor({content: board.desc, title: board.name});
      if (typeof result === "string") {
        board.desc = result;
        this.saveCollection();
      }
    }
  }

  changeBoardName(event: Event) {
    const input = event.target as HTMLInputElement;
    const board = this.collectionBoard;
    if (board) {
      board.name = input.value;
    }
  }

  changeCollectionIdx(event: MatAutocompleteSelectedEvent | number) {
    if (event instanceof MatAutocompleteSelectedEvent) {
      this.collectionIdx$.next(this.collection.boards.findIndex((v) => v.name === event.option.value));
    } else {
      this.collectionIdx$.next(event);
    }
  }

  async exportCollection() {
    downloadByString(JSON.stringify(this.collection), {filename: this.collection.name + ".json"});
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
          this.collectionIdx$.next(0);
          this.saveCollection();
        }
        input.value = "";
      }
    }
  }

  setMode(event: MatSelectChange) {
    const mode = event.value as Mode;
    this.mode$.next(mode);
    const board = this.collectionBoard;
    if (mode === "摆棋" && board) {
      this.reset(false, board.info);
    }
  }

  showGraveyardRipple(sideName: ChineseChessSideName) {
    const {currPiece$, mode$} = this;
    const currPiece = currPiece$.value;
    if (!currPiece) {
      return false;
    }
    return mode$.value === "摆棋" && currPiece.side.name === sideName && !currPiece.dead;
  }

  killAllPieces() {
    const {red, black} = this.board;
    red.killAllPiece();
    black.killAllPiece();
    this.saveBoardInfo();
  }

  toggleApplyCollection(event: MatSlideToggleChange) {
    this.applyCollection = event.checked;
    this.save("applyCollection", event.checked);
  }

  showBoardMoves() {
    let result = "";
    this.board.getHistoryDesc().forEach((desc, i) => {
      if (i % 2) {
        result += `      ${desc}<br/>`;
      } else {
        result += desc;
      }
    });
    result = `<div style="white-space:pre">${result}</div>`;
    this.message.alert(result);
  }

  async getCollections() {
    openChineseChessCollectionsDialog(this.dialog);
  }

  showInfo() {
    const getList = (content: string[]) => `<ul>${content.map((v) => `<li>${v}</li>`).join("")}</ul>`;
    this.message.book({
      bookData: [
        {title: "关于字体", content: "字体文件可能需要加载较长时间，但不影响其他功能。"},
        {
          title: "关于模式",
          content: getList(["下棋：正常地下棋，开启“应用集合”时可以玩对应残局。", "摆棋：编辑残局，可用于上述的“应用集合”。"])
        },
        {
          title: "关于电脑(AI)",
          content: getList([
            "AI算法是最简单的遍历算法，所以不要对它的智商抱有期待。",
            "电脑（简单）：请不要欺负它。",
            "电脑（中等）：可能没有那么智障了。",
            "电脑（困难）：效果拔群（指CPU的负荷）！渣渣CPU请勿轻易尝试。"
          ])
        }
      ],
      title: "说明书"
    });
  }
}
