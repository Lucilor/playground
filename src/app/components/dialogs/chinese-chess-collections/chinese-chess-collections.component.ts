import {AfterViewInit, Component} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {timeout} from "@lucilor/utils";
import {HttpService} from "@src/app/modules/http/services/http.service";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {getOpenDialogFunc} from "../dialog.common";

type Collections = {name: string; url: string}[];

@Component({
    selector: "app-chinese-chess-collections",
    templateUrl: "./chinese-chess-collections.component.html",
    styleUrls: ["./chinese-chess-collections.component.scss"]
})
export class ChineseChessCollectionsComponent implements AfterViewInit {
    loadId = "ChineseChessCollectionsLoader";
    data: Collections = [];

    constructor(
        public dialogRef: MatDialogRef<ChineseChessCollectionsComponent, null>,
        private http: HttpService,
        private loader: NgxUiLoaderService
    ) {}

    async ngAfterViewInit() {
        await timeout(0);
        this.loader.startLoader(this.loadId);
        const response = await this.http.get<Collections>("static/chinese-chess/getCollections.php");
        this.loader.stopLoader(this.loadId);
        if (response?.data) {
            this.data = response.data;
        }
    }
}

export const openChineseChessCollectionsDialog = getOpenDialogFunc<ChineseChessCollectionsComponent, undefined, undefined>(
    ChineseChessCollectionsComponent
);
