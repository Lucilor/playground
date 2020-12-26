import {Component, OnInit} from "@angular/core";
import {ChineseChess} from "./chinese-chess";

@Component({
    selector: "app-chinese-chess",
    templateUrl: "./chinese-chess.component.html",
    styleUrls: ["./chinese-chess.component.scss"]
})
export class ChineseChessComponent implements OnInit {
    tilesPerArea = new Array(32);
    chineseChess = new ChineseChess();

    constructor() {}

    ngOnInit() {
        console.log(this);
        document.title = "test";
    }
}
