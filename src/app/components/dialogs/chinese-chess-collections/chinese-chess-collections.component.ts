import {AfterViewInit, Component} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {timeout} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import {NgxUiLoaderService} from "ngx-ui-loader";
import {getOpenDialogFunc} from "../dialog.common";

type Collections = {name: string; size: number}[];

@Component({
    selector: "app-chinese-chess-collections",
    templateUrl: "./chinese-chess-collections.component.html",
    styleUrls: ["./chinese-chess-collections.component.scss"]
})
export class ChineseChessCollectionsComponent implements AfterViewInit {
    loadId = "ChineseChessCollectionsLoader";
    data: Collections = [];
    urlPrefix = this.http.baseURL + "/chinese-chess/collections/";

    constructor(
        public dialogRef: MatDialogRef<ChineseChessCollectionsComponent, null>,
        private http: HttpService,
        private loader: NgxUiLoaderService
    ) {}

    async ngAfterViewInit() {
        await timeout(0);
        this.loader.startLoader(this.loadId);
        const response = await this.http.get<Collections>("chinese-chess/collections");
        this.loader.stopLoader(this.loadId);
        if (response?.data) {
            this.data = response.data;
        }
    }
}

export const openChineseChessCollectionsDialog =
    getOpenDialogFunc<ChineseChessCollectionsComponent, undefined, undefined>(ChineseChessCollectionsComponent);
