import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {NgxUiLoaderService} from "ngx-ui-loader";

@Component({
    selector: "app-blog",
    templateUrl: "./blog.component.html",
    styleUrls: ["./blog.component.scss"]
})
export class BlogComponent implements AfterViewInit {
    @ViewChild("iframe", {read: ElementRef}) iframe?: ElementRef<HTMLIFrameElement>;

    constructor(private loader: NgxUiLoaderService) {}

    ngAfterViewInit() {
        if (this.iframe) {
            this.loader.start();
            const iframe = this.iframe.nativeElement;
            iframe.onload = () => {
                this.loader.stop();
            };
        }
    }
}
