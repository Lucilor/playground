import {Component, Inject} from "@angular/core";
import {MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog";
import {MessageService} from "@src/app/modules/message/services/message.service";
import {ChineseChessBoardInfo} from "../../chinese-chess/chinese-chess";
import {getOpenDialogFunc} from "../dialog.common";

export interface ChineseChessCollection {
    name: string;
    desc: string;
    boards: {name: string; desc: string; info: ChineseChessBoardInfo}[];
}

@Component({
    selector: "app-chinese-chess-collection",
    templateUrl: "./chinese-chess-collection.component.html",
    styleUrls: ["./chinese-chess-collection.component.scss"]
})
export class ChineseChessCollectionComponent {
    constructor(
        public dialogRef: MatDialogRef<ChineseChessCollectionComponent, number>,
        @Inject(MAT_DIALOG_DATA) public data: ChineseChessCollection,
        private message: MessageService
    ) {}

    close() {
        this.dialogRef.close();
    }

    async loadBoard(i: number) {
        if (await this.message.confirm("载入此棋局？")) {
            this.dialogRef.close(i);
        }
    }

    async deleteBoard(i: number) {
        if (await this.message.confirm("确定删除？")) {
            this.data.boards.splice(i, 1);
        }
    }
}

type CCC = ChineseChessCollection;
export const openChineseChessCollectionDialog = getOpenDialogFunc<ChineseChessCollectionComponent, CCC, number>(
    ChineseChessCollectionComponent
);
