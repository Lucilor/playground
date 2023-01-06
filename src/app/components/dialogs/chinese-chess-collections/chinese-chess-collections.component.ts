import {AfterViewInit, Component} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {timeout} from "@lucilor/utils";
import {HttpService} from "@modules/http/services/http.service";
import {SpinnerService} from "@modules/spinner/services/spinner.service";
import urljoin from "url-join";
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

  constructor(
    public dialogRef: MatDialogRef<ChineseChessCollectionsComponent, null>,
    private http: HttpService,
    private spinner: SpinnerService
  ) {}

  async ngAfterViewInit() {
    await timeout(0);
    this.spinner.show(this.loadId);
    const response = await this.http.get<Collections>("api/chinese-chess/collections");
    this.spinner.hide(this.loadId);
    if (response?.data) {
      this.data = response.data;
    }
  }

  getDownloadURL(name: string) {
    return urljoin(this.http.baseURL, `api/chinese-chess/collections/${name}.json`);
  }
}

export const openChineseChessCollectionsDialog = getOpenDialogFunc<ChineseChessCollectionsComponent, undefined, undefined>(
  ChineseChessCollectionsComponent
);
