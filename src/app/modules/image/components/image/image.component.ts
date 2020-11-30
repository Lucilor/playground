import {Component, Input} from "@angular/core";
import {SafeUrl} from "@angular/platform-browser";

export const imgEmpty = "assets/images/empty.jpg";
export const imgLoading = "assets/images/loading.gif";

@Component({
    selector: "app-image",
    templateUrl: "./image.component.html",
    styleUrls: ["./image.component.scss"]
})
export class ImageComponent {
    @Input() width = "";
    @Input() height = "";
    @Input() src?: string | SafeUrl = "";
    loading = true;
    loadingSrc = imgLoading;
    emptySrc = imgEmpty;

    constructor() {}

    onLoad() {
        this.loading = false;
    }

    onError() {
        this.loading = false;
        this.src = this.emptySrc;
    }
}
