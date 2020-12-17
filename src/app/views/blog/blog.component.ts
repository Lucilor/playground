import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from "@angular/core";
import {NgxUiLoaderService} from "ngx-ui-loader";

@Component({
    selector: "app-blog",
    templateUrl: "./blog.component.html",
    styleUrls: ["./blog.component.scss"]
})
export class BlogComponent implements AfterViewInit, OnDestroy {
    @ViewChild("iframe", {read: ElementRef}) iframe?: ElementRef<HTMLIFrameElement>;
    private _i: any = -1;

    constructor(private loader: NgxUiLoaderService) {}

    ngAfterViewInit() {
        if (this.iframe) {
            this.loader.start();
            const iframe = this.iframe.nativeElement;
            iframe.onload = () => {
                this.loader.stop();
                const iframeWindow = iframe.contentWindow;
                if (iframeWindow?.document) {
                    const html = iframeWindow.document.getElementsByTagName("html")[0];
                    this._i = setInterval(() => (iframe.height = html.scrollHeight + "px"), 500);
                }
            };
        }
    }

    ngOnDestroy() {
        clearInterval(this._i);
    }
}
