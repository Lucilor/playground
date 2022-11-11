import {AfterViewInit, Component, ElementRef, ViewChild} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {HttpService} from "@modules/http/services/http.service";
import {initCanvas} from "./happy-birthday.canvas";

@Component({
    selector: "app-happy-birthday",
    templateUrl: "./happy-birthday.component.html",
    styleUrls: ["./happy-birthday.component.scss"]
})
export class HappyBirthdayComponent implements AfterViewInit {
    @ViewChild("canvas") canvasRef?: ElementRef<HTMLCanvasElement>;

    constructor(private route: ActivatedRoute, private http: HttpService) {}

    async ngAfterViewInit() {
        const {code} = this.route.snapshot.queryParams;
        const response = await this.http.get<{name: string} | null>("api/playground/birthday", {code});
        if (response?.data) {
            initCanvas(this.canvasRef?.nativeElement, response.data.name);
        }
    }
}
